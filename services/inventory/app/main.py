"""
Inventory Service – Kiosk Vision
Product catalog, stock management, barcode registry, and product location mapping.
"""

import os
import uuid
from datetime import datetime
from contextlib import asynccontextmanager
from typing import Optional, List

from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel

import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from shared.middleware.auth import get_current_user, require_roles
from shared.schemas.models import ProductCreate, ProductResponse

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGO_DB_INVENTORY", "kiosk_inventory")

db = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global db
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]
    await db.products.create_index("barcode", unique=True, sparse=True)
    await db.products.create_index("name")
    await db.products.create_index("category")
    try:
        await db.products.create_index([
            ("name", "text"), 
            ("category", "text"), 
            ("description", "text"),
            ("brand_name", "text")
        ])
    except Exception:
        pass # Ignore text index conflicts if DB is already heavily seeded
    yield
    client.close()


app = FastAPI(title="Kiosk Vision – Inventory Service", version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


class StockUpdate(BaseModel):
    product_id: str
    quantity_change: int
    reason: str = ""


class LocationUpdate(BaseModel):
    aisle: str
    shelf: str


@app.get("/health")
async def health():
    return {"status": "ok", "service": "inventory"}


# ── Products ──

@app.post("/products", response_model=ProductResponse)
async def create_product(
    product: ProductCreate,
    _: dict = Depends(require_roles(["supervisor", "owner"])),
):
    product_id = str(uuid.uuid4())
    doc = {
        "_id": product_id,
        **product.model_dump(),
        "is_available": product.stock_quantity > 0,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    await db.products.insert_one(doc)
    return ProductResponse(id=product_id, **product.model_dump(), is_available=doc["is_available"])


@app.get("/products/search")
async def search_products(
    q: str = Query(..., min_length=1),
    category: Optional[str] = None,
    limit: int = Query(20, le=100),
):
    """Fuzzy search products by name/description (used by voice & text search)."""
    query = {"$text": {"$search": q}}
    if category:
        query["category"] = category

    cursor = db.products.find(query, {"score": {"$meta": "textScore"}})
    cursor = cursor.sort([("score", {"$meta": "textScore"})]).limit(limit)

    results = []
    async for p in cursor:
        p["id"] = p.pop("_id")
        results.append(p)
    return results


@app.get("/products/barcode/{barcode}")
async def lookup_barcode(barcode: str):
    """Lookup product by barcode."""
    product = await db.products.find_one({"barcode": barcode})
    if not product:
        raise HTTPException(404, "Product not found for barcode")
    product["id"] = product.pop("_id")
    return product


@app.get("/products/{product_id}")
async def get_product(product_id: str):
    product = await db.products.find_one({"_id": product_id})
    if not product:
        raise HTTPException(404, "Product not found")
    product["id"] = product.pop("_id")
    return product


@app.get("/products/{product_id}/location")
async def get_product_location(product_id: str):
    """Get product location in store (aisle/shelf)."""
    product = await db.products.find_one({"_id": product_id}, {"name": 1, "location_aisle": 1, "location_shelf": 1})
    if not product:
        raise HTTPException(404, "Product not found")
    return {
        "product_id": product_id,
        "name": product.get("name"),
        "aisle": product.get("location_aisle", "Unknown"),
        "shelf": product.get("location_shelf", "Unknown"),
        "directions": f"Go to Aisle {product.get('location_aisle', '?')}, Shelf {product.get('location_shelf', '?')}",
    }


@app.get("/products")
async def list_products(
    category: Optional[str] = None,
    available_only: bool = True,
    limit: int = Query(50, le=200),
):
    query = {}
    if category:
        query["category"] = category
    if available_only:
        query["is_available"] = True

    cursor = db.products.find(query).sort("name", 1).limit(limit)
    results = []
    async for p in cursor:
        p["id"] = p.pop("_id")
        results.append(p)
    return results


@app.get("/categories")
async def list_categories():
    categories = await db.products.distinct("category")
    return categories


# ── Stock Management ──

@app.put("/stock", response_model=dict)
async def update_stock(
    update: StockUpdate,
    user: dict = Depends(require_roles(["supervisor", "owner"])),
):
    """Update stock quantity (supervisor+ only)."""
    product = await db.products.find_one({"_id": update.product_id})
    if not product:
        raise HTTPException(404, "Product not found")

    new_qty = product.get("stock_quantity", 0) + update.quantity_change
    if new_qty < 0:
        raise HTTPException(400, "Insufficient stock")

    await db.products.update_one(
        {"_id": update.product_id},
        {"$set": {
            "stock_quantity": new_qty,
            "is_available": new_qty > 0,
            "updated_at": datetime.utcnow(),
        }},
    )

    # Log stock movement
    await db.stock_movements.insert_one({
        "product_id": update.product_id,
        "change": update.quantity_change,
        "new_quantity": new_qty,
        "reason": update.reason,
        "user_id": user["sub"],
        "timestamp": datetime.utcnow(),
    })

    return {"product_id": update.product_id, "new_quantity": new_qty, "is_available": new_qty > 0}


@app.get("/alerts/low-stock")
async def low_stock_alerts(
    threshold: int = Query(10),
    _: dict = Depends(require_roles(["supervisor", "owner"])),
):
    """Get products with stock below threshold."""
    cursor = db.products.find(
        {"stock_quantity": {"$lt": threshold}, "is_available": True},
    ).sort("stock_quantity", 1)

    results = []
    async for p in cursor:
        p["id"] = p.pop("_id")
        results.append(p)
    return results


@app.put("/products/{product_id}/location")
async def update_location(
    product_id: str,
    loc: LocationUpdate,
    _: dict = Depends(require_roles(["supervisor", "owner"])),
):
    result = await db.products.update_one(
        {"_id": product_id},
        {"$set": {"location_aisle": loc.aisle, "location_shelf": loc.shelf, "updated_at": datetime.utcnow()}},
    )
    if result.matched_count == 0:
        raise HTTPException(404, "Product not found")
    return {"status": "updated"}
