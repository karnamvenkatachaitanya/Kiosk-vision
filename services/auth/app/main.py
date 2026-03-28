"""
Auth & User Service – Kiosk Vision
Handles authentication, user management, QR sessions, and accessibility preferences.
"""

import os
import uuid
from datetime import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import Optional

import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from shared.middleware.auth import create_token, get_current_user, require_roles
from shared.schemas.models import UserRole, UserCreate, UserResponse, TokenResponse

# ──────────────────────────────────────
# Configuration
# ──────────────────────────────────────

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGO_DB_AUTH", "kiosk_auth")

db = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global db
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]
    # Create indexes
    await db.users.create_index("phone", unique=True, sparse=True)
    await db.sessions.create_index("token", unique=True)
    await db.sessions.create_index("expires_at", expireAfterSeconds=0)
    yield
    client.close()


app = FastAPI(
    title="Kiosk Vision – Auth Service",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────────────────
# Request / Response Models
# ──────────────────────────────────────

class QRSessionRequest(BaseModel):
    device_id: Optional[str] = None


class LoginRequest(BaseModel):
    phone: str
    pin: str


class AccessibilityPreferences(BaseModel):
    high_contrast: bool = False
    large_text: bool = False
    voice_enabled: bool = True
    gesture_enabled: bool = True
    language: str = "en"
    tts_speed: float = 1.0


# ──────────────────────────────────────
# Routes
# ──────────────────────────────────────

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "auth"}


@app.post("/qr-session", response_model=TokenResponse)
async def create_qr_session(req: QRSessionRequest):
    """Create a guest session when user scans the shop QR code."""
    user_id = f"guest_{uuid.uuid4().hex[:12]}"

    # Store guest session
    await db.sessions.insert_one({
        "_id": user_id,
        "role": UserRole.GUEST,
        "device_id": req.device_id,
        "created_at": datetime.utcnow(),
    })

    token = create_token(user_id, UserRole.GUEST)

    return TokenResponse(
        access_token=token,
        role=UserRole.GUEST,
        user_id=user_id,
        expires_in=1800,
    )


@app.post("/register", response_model=UserResponse)
async def register_user(user: UserCreate):
    """Register a new daily customer."""
    if user.phone:
        existing = await db.users.find_one({"phone": user.phone})
        if existing:
            raise HTTPException(status_code=409, detail="Phone already registered")

    user_id = str(uuid.uuid4())
    user_doc = {
        "_id": user_id,
        "name": user.name,
        "phone": user.phone,
        "role": user.role or UserRole.DAILY_CUSTOMER,
        "pin": user.pin,  # In production: hash this
        "accessibility_preferences": user.accessibility_preferences,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    await db.users.insert_one(user_doc)

    return UserResponse(
        id=user_id,
        name=user.name,
        phone=user.phone,
        role=user_doc["role"],
        accessibility_preferences=user.accessibility_preferences,
        created_at=user_doc["created_at"],
    )


@app.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    """Login with phone + PIN."""
    user = await db.users.find_one({"phone": req.phone})
    if not user or user.get("pin") != req.pin:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token(user["_id"], user["role"])

    return TokenResponse(
        access_token=token,
        role=user["role"],
        user_id=user["_id"],
        expires_in=1800,
    )


@app.get("/users/me")
async def get_me(user: dict = Depends(get_current_user)):
    """Get current user profile."""
    user_doc = await db.users.find_one({"_id": user["sub"]})
    if not user_doc:
        return {"id": user["sub"], "role": user["role"]}

    return UserResponse(
        id=user_doc["_id"],
        name=user_doc.get("name"),
        phone=user_doc.get("phone"),
        role=user_doc["role"],
        accessibility_preferences=user_doc.get("accessibility_preferences", {}),
        created_at=user_doc["created_at"],
    )


@app.put("/users/me/preferences")
async def update_preferences(
    prefs: AccessibilityPreferences,
    user: dict = Depends(get_current_user),
):
    """Update accessibility preferences."""
    await db.users.update_one(
        {"_id": user["sub"]},
        {"$set": {
            "accessibility_preferences": prefs.model_dump(),
            "updated_at": datetime.utcnow(),
        }},
        upsert=True,
    )
    return {"status": "updated"}


@app.get("/users/{user_id}")
async def get_user(
    user_id: str,
    _: dict = Depends(require_roles(["supervisor", "owner"])),
):
    """Get a user by ID (supervisor+ only)."""
    user_doc = await db.users.find_one({"_id": user_id})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")

    return UserResponse(
        id=user_doc["_id"],
        name=user_doc.get("name"),
        phone=user_doc.get("phone"),
        role=user_doc["role"],
        accessibility_preferences=user_doc.get("accessibility_preferences", {}),
        created_at=user_doc["created_at"],
    )
