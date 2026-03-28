"""
CRM & Analytics Service – Kiosk Vision
Customer profiles, purchase history, sales analytics, and reporting dashboards.
"""

import os
from datetime import datetime, timedelta
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from shared.middleware.auth import get_current_user, require_roles
from shared.schemas.models import SalesSummary, CustomerProfile

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGO_DB_CRM", "kiosk_crm")
DB_ORDERS = os.getenv("MONGO_DB_ORDERS", "kiosk_orders")

db = None
orders_db = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global db, orders_db
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]
    orders_db = client[DB_ORDERS]
    await db.analytics_events.create_index("timestamp")
    await db.analytics_events.create_index("event_type")
    yield
    client.close()


app = FastAPI(title="Kiosk Vision – CRM & Analytics Service", version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": "crm"}


# ── Analytics Events ──

@app.post("/events")
async def track_event(event: dict, user: dict = Depends(get_current_user)):
    """Track an analytics event (called by other services)."""
    event_doc = {
        "event_type": event.get("type", "unknown"),
        "user_id": user.get("sub"),
        "data": event.get("data", {}),
        "timestamp": datetime.utcnow(),
    }
    await db.analytics_events.insert_one(event_doc)
    return {"status": "tracked"}


# ── Sales Analytics ──

@app.get("/analytics/sales")
async def sales_analytics(
    days: int = Query(7, ge=1, le=90),
    _: dict = Depends(require_roles(["supervisor", "owner"])),
):
    """Get sales summary for the last N days."""
    since = datetime.utcnow() - timedelta(days=days)

    pipeline = [
        {"$match": {"created_at": {"$gte": since}, "status": {"$in": ["paid", "completed"]}}},
        {"$group": {
            "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
            "total_orders": {"$sum": 1},
            "total_revenue": {"$sum": "$total"},
            "avg_order_value": {"$avg": "$total"},
        }},
        {"$sort": {"_id": 1}},
    ]

    results = []
    async for doc in orders_db.orders.aggregate(pipeline):
        results.append({
            "date": doc["_id"],
            "total_orders": doc["total_orders"],
            "total_revenue": round(doc["total_revenue"], 2),
            "avg_order_value": round(doc["avg_order_value"], 2),
        })
    return results


@app.get("/analytics/products/trending")
async def trending_products(
    days: int = Query(7, ge=1, le=30),
    limit: int = Query(10, le=50),
    _: dict = Depends(require_roles(["supervisor", "owner"])),
):
    """Get trending products by order frequency."""
    since = datetime.utcnow() - timedelta(days=days)

    pipeline = [
        {"$match": {"created_at": {"$gte": since}}},
        {"$unwind": "$items"},
        {"$group": {
            "_id": "$items.product_name",
            "total_quantity": {"$sum": "$items.quantity"},
            "total_revenue": {"$sum": "$items.total_price"},
            "order_count": {"$sum": 1},
        }},
        {"$sort": {"total_quantity": -1}},
        {"$limit": limit},
    ]

    results = []
    async for doc in orders_db.orders.aggregate(pipeline):
        results.append({
            "product_name": doc["_id"],
            "total_quantity": doc["total_quantity"],
            "total_revenue": round(doc["total_revenue"], 2),
            "order_count": doc["order_count"],
        })
    return results


@app.get("/analytics/accessibility")
async def accessibility_stats(
    _: dict = Depends(require_roles(["supervisor", "owner"])),
):
    """Get accessibility feature usage statistics."""
    pipeline = [
        {"$match": {"event_type": {"$in": ["voice_order", "gesture_nav", "ocr_scan", "barcode_scan", "tts_play"]}}},
        {"$group": {
            "_id": "$event_type",
            "count": {"$sum": 1},
            "unique_users": {"$addToSet": "$user_id"},
        }},
    ]

    results = []
    async for doc in db.analytics_events.aggregate(pipeline):
        results.append({
            "feature": doc["_id"],
            "usage_count": doc["count"],
            "unique_users": len(doc["unique_users"]),
        })
    return results


# ── Customer Profiles ──

@app.get("/customer/{user_id}/history")
async def customer_history(
    user_id: str,
    limit: int = Query(20, le=100),
    user: dict = Depends(get_current_user),
):
    """Get customer purchase history."""
    # Customers can see their own; supervisors can see anyone
    if user["sub"] != user_id and user.get("role") not in ("supervisor", "owner"):
        raise HTTPException(403, "Not authorized")

    cursor = orders_db.orders.find({"user_id": user_id}).sort("created_at", -1).limit(limit)
    orders = []
    async for o in cursor:
        o["id"] = o.pop("_id")
        orders.append(o)
    return orders


@app.get("/reports/daily")
async def daily_report(
    date: Optional[str] = None,
    _: dict = Depends(require_roles(["owner"])),
):
    """Generate daily summary report (owner only)."""
    if date:
        target_date = datetime.strptime(date, "%Y-%m-%d")
    else:
        target_date = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    next_day = target_date + timedelta(days=1)

    # Orders summary
    pipeline = [
        {"$match": {"created_at": {"$gte": target_date, "$lt": next_day}}},
        {"$group": {
            "_id": None,
            "total_orders": {"$sum": 1},
            "total_revenue": {"$sum": "$total"},
            "avg_order": {"$avg": "$total"},
            "total_items": {"$sum": {"$size": "$items"}},
        }},
    ]

    summary = {"date": target_date.strftime("%Y-%m-%d")}
    async for doc in orders_db.orders.aggregate(pipeline):
        summary.update({
            "total_orders": doc["total_orders"],
            "total_revenue": round(doc["total_revenue"], 2),
            "avg_order_value": round(doc["avg_order"], 2),
            "total_items_sold": doc["total_items"],
        })

    return summary
