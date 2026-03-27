"""
Payment Service – Kiosk Vision
UPI QR generation (offline), payment tracking, and cash billing fallback.
"""

import os
import uuid
import base64
import io
from datetime import datetime, timedelta
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import Optional

import sys
sys.path.insert(0, "/app")
from shared.middleware.auth import get_current_user, require_roles
from shared.schemas.models import PaymentMethod, UPIQRRequest, UPIQRResponse, PaymentConfirm

MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongodb:27017")
DB_NAME = os.getenv("MONGO_DB_PAYMENT", "kiosk_payment")
UPI_MERCHANT_ID = os.getenv("UPI_MERCHANT_ID", "merchant@upi")
UPI_MERCHANT_NAME = os.getenv("UPI_MERCHANT_NAME", "KioskShop")

db = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global db
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]
    await db.payments.create_index("order_id", unique=True)
    yield
    client.close()


app = FastAPI(title="Kiosk Vision – Payment Service", version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


def generate_upi_qr_base64(upi_uri: str) -> str:
    """Generate a QR code as base64 PNG. Uses qrcode library (offline)."""
    try:
        import qrcode
        qr = qrcode.QRCode(version=1, box_size=10, border=4)
        qr.add_data(upi_uri)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        return base64.b64encode(buffer.getvalue()).decode("utf-8")
    except ImportError:
        # Fallback: return the URI as-is if qrcode lib not available
        return base64.b64encode(upi_uri.encode()).decode("utf-8")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "payment"}


@app.post("/upi-qr", response_model=UPIQRResponse)
async def generate_upi_qr(req: UPIQRRequest, user: dict = Depends(get_current_user)):
    """Generate offline UPI QR code for payment."""
    # Build UPI intent URI (works offline – phone handles actual payment)
    upi_uri = (
        f"upi://pay?"
        f"pa={UPI_MERCHANT_ID}"
        f"&pn={UPI_MERCHANT_NAME}"
        f"&am={req.amount:.2f}"
        f"&cu=INR"
        f"&tn=Order-{req.order_id[:8]}"
    )

    qr_base64 = generate_upi_qr_base64(upi_uri)
    expires_at = datetime.utcnow() + timedelta(minutes=15)

    # Store payment record
    payment_id = str(uuid.uuid4())
    await db.payments.insert_one({
        "_id": payment_id,
        "order_id": req.order_id,
        "amount": req.amount,
        "upi_uri": upi_uri,
        "status": "pending",
        "method": PaymentMethod.UPI,
        "created_by": user["sub"],
        "expires_at": expires_at,
        "created_at": datetime.utcnow(),
    })

    return UPIQRResponse(
        order_id=req.order_id,
        qr_code_base64=qr_base64,
        upi_uri=upi_uri,
        amount=req.amount,
        expires_at=expires_at,
    )


@app.post("/confirm")
async def confirm_payment(
    req: PaymentConfirm,
    user: dict = Depends(require_roles(["supervisor", "owner"])),
):
    """Supervisor confirms payment received (offline verification)."""
    payment = await db.payments.find_one({"order_id": req.order_id})
    if not payment:
        # Create cash payment record
        payment_id = str(uuid.uuid4())
        await db.payments.insert_one({
            "_id": payment_id,
            "order_id": req.order_id,
            "status": "confirmed",
            "method": req.payment_method,
            "confirmed_by": user["sub"],
            "confirmed_at": datetime.utcnow(),
            "created_at": datetime.utcnow(),
        })
    else:
        await db.payments.update_one(
            {"order_id": req.order_id},
            {"$set": {
                "status": "confirmed",
                "method": req.payment_method,
                "confirmed_by": user["sub"],
                "confirmed_at": datetime.utcnow(),
            }},
        )

    return {"status": "confirmed", "order_id": req.order_id}


@app.get("/status/{order_id}")
async def payment_status(order_id: str, user: dict = Depends(get_current_user)):
    payment = await db.payments.find_one({"order_id": order_id})
    if not payment:
        raise HTTPException(404, "Payment not found")
    return {
        "order_id": order_id,
        "status": payment["status"],
        "method": payment.get("method"),
        "amount": payment.get("amount"),
        "confirmed_at": payment.get("confirmed_at"),
    }
