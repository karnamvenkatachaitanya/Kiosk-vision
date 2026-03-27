"""
Order & Billing Service – Kiosk Vision
Handles cart management, order lifecycle, billing, tax, and receipt generation.
"""

import os
import uuid
from datetime import datetime
from contextlib import asynccontextmanager
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel

import sys
sys.path.insert(0, "/app")
from shared.middleware.auth import get_current_user, require_roles
from shared.schemas.models import (
    OrderStatus, PaymentMethod, OrderItem, OrderCreate, OrderResponse,
    BillGenerate, BillResponse,
)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongodb:27017")
DB_NAME = os.getenv("MONGO_DB_ORDERS", "kiosk_orders")
TAX_PERCENT = float(os.getenv("TAX_PERCENT", "5.0"))

db = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global db
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]
    await db.orders.create_index("user_id")
    await db.orders.create_index("status")
    await db.carts.create_index("user_id", unique=True)
    yield
    client.close()


app = FastAPI(title="Kiosk Vision – Order & Billing Service", version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


# ── Cart ──

class CartItem(BaseModel):
    product_id: str
    product_name: str
    quantity: float = 1
    unit_price: float


class VoiceOrderRequest(BaseModel):
    transcript: str
    parsed_items: List[dict]


@app.get("/health")
async def health():
    return {"status": "ok", "service": "orders"}


@app.get("/cart")
async def get_cart(user: dict = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": user["sub"]})
    if not cart:
        return {"user_id": user["sub"], "items": [], "total": 0}
    cart["_id"] = str(cart["_id"])
    return cart


@app.post("/cart/add")
async def add_to_cart(item: CartItem, user: dict = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": user["sub"]})
    new_item = {
        "product_id": item.product_id,
        "product_name": item.product_name,
        "quantity": item.quantity,
        "unit_price": item.unit_price,
        "total_price": round(item.quantity * item.unit_price, 2),
    }

    if cart:
        # Check if product already in cart
        existing_idx = None
        for i, ci in enumerate(cart.get("items", [])):
            if ci["product_id"] == item.product_id:
                existing_idx = i
                break

        if existing_idx is not None:
            cart["items"][existing_idx]["quantity"] += item.quantity
            cart["items"][existing_idx]["total_price"] = round(
                cart["items"][existing_idx]["quantity"] * cart["items"][existing_idx]["unit_price"], 2
            )
        else:
            cart.setdefault("items", []).append(new_item)

        total = sum(i["total_price"] for i in cart["items"])
        await db.carts.update_one(
            {"user_id": user["sub"]},
            {"$set": {"items": cart["items"], "total": round(total, 2), "updated_at": datetime.utcnow()}},
        )
    else:
        await db.carts.insert_one({
            "user_id": user["sub"],
            "items": [new_item],
            "total": new_item["total_price"],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        })

    return {"status": "added", "item": new_item}


@app.delete("/cart/clear")
async def clear_cart(user: dict = Depends(get_current_user)):
    await db.carts.delete_one({"user_id": user["sub"]})
    return {"status": "cleared"}


# ── Orders ──

@app.post("/orders", response_model=OrderResponse)
async def create_order(order: OrderCreate, user: dict = Depends(get_current_user)):
    order_id = str(uuid.uuid4())
    subtotal = sum(item.total_price for item in order.items)
    tax = round(subtotal * TAX_PERCENT / 100, 2)
    total = round(subtotal + tax, 2)

    order_doc = {
        "_id": order_id,
        "user_id": user["sub"],
        "items": [item.model_dump() for item in order.items],
        "subtotal": subtotal,
        "tax_percent": TAX_PERCENT,
        "tax": tax,
        "total": total,
        "status": OrderStatus.CONFIRMED,
        "notes": order.notes,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    await db.orders.insert_one(order_doc)
    # Clear cart after order
    await db.carts.delete_one({"user_id": user["sub"]})

    return OrderResponse(
        id=order_id, user_id=user["sub"], items=order.items,
        subtotal=subtotal, tax=tax, total=total,
        status=OrderStatus.CONFIRMED, created_at=order_doc["created_at"],
    )


@app.post("/orders/voice", response_model=OrderResponse)
async def create_voice_order(req: VoiceOrderRequest, user: dict = Depends(get_current_user)):
    """Create an order from voice-parsed items (AI service sends structured data)."""
    items = []
    for pi in req.parsed_items:
        items.append(OrderItem(
            product_id=pi["product_id"],
            product_name=pi["product_name"],
            quantity=pi.get("quantity", 1),
            unit_price=pi["unit_price"],
            total_price=round(pi.get("quantity", 1) * pi["unit_price"], 2),
        ))
    return await create_order(OrderCreate(items=items, notes=f"Voice: {req.transcript}"), user)


@app.get("/orders/{order_id}")
async def get_order(order_id: str, user: dict = Depends(get_current_user)):
    order = await db.orders.find_one({"_id": order_id})
    if not order:
        raise HTTPException(404, "Order not found")
    if order["user_id"] != user["sub"] and user["role"] not in ("supervisor", "owner"):
        raise HTTPException(403, "Not authorized")
    order["id"] = order.pop("_id")
    return order


@app.get("/orders")
async def list_orders(
    status: Optional[str] = None,
    limit: int = Query(20, le=100),
    user: dict = Depends(get_current_user),
):
    query = {"user_id": user["sub"]}
    if user["role"] in ("supervisor", "owner"):
        query = {}
    if status:
        query["status"] = status

    cursor = db.orders.find(query).sort("created_at", -1).limit(limit)
    orders = []
    async for o in cursor:
        o["id"] = o.pop("_id")
        orders.append(o)
    return orders


# ── Billing ──

@app.post("/billing/generate", response_model=BillResponse)
async def generate_bill(req: BillGenerate, user: dict = Depends(get_current_user)):
    order = await db.orders.find_one({"_id": req.order_id})
    if not order:
        raise HTTPException(404, "Order not found")

    bill_id = str(uuid.uuid4())
    bill_doc = {
        "_id": bill_id,
        "order_id": req.order_id,
        "subtotal": order["subtotal"],
        "tax_percent": order["tax_percent"],
        "tax_amount": order["tax"],
        "total": order["total"],
        "payment_method": req.payment_method,
        "created_at": datetime.utcnow(),
    }
    await db.bills.insert_one(bill_doc)
    await db.orders.update_one(
        {"_id": req.order_id},
        {"$set": {"status": OrderStatus.BILLING, "updated_at": datetime.utcnow()}},
    )

    return BillResponse(
        id=bill_id, order_id=req.order_id,
        subtotal=order["subtotal"], tax_percent=order["tax_percent"],
        tax_amount=order["tax"], total=order["total"],
        payment_method=req.payment_method,
    )
