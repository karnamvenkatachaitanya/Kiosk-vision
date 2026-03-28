"""
Shared Pydantic schemas used across microservices.
Mirrors the MongoDB collection schemas defined in docs/mongodb-schema.md.
"""

from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict
from pydantic import BaseModel, Field


# ══════════════════════════════════════
# Enums
# ══════════════════════════════════════

class UserRole(str, Enum):
    GUEST = "guest"
    DAILY_CUSTOMER = "daily_customer"
    SUPERVISOR = "supervisor"
    OWNER = "owner"


class OrderStatus(str, Enum):
    DRAFT = "draft"
    CONFIRMED = "confirmed"
    BILLING = "billing"
    PAYMENT_PENDING = "payment_pending"
    PAID = "paid"
    PREPARING = "preparing"
    OUT_FOR_DELIVERY = "out_for_delivery"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class DeliveryType(str, Enum):
    PICKUP = "pickup"
    SERVICE_BOY = "service_boy"
    HOME_DELIVERY = "home_delivery"


class PaymentMethod(str, Enum):
    UPI = "upi"
    CASH = "cash"
    CARD = "card"
    POINTS_ONLY = "points_only"


class PaymentStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    FAILED = "failed"
    REFUNDED = "refunded"


class RewardType(str, Enum):
    EARN = "earn"
    REDEEM = "redeem"
    EXPIRE = "expire"
    BONUS = "bonus"
    ADJUSTMENT = "adjustment"


class CustomerTier(str, Enum):
    BRONZE = "bronze"
    SILVER = "silver"
    GOLD = "gold"
    PLATINUM = "platinum"


class StockMovementType(str, Enum):
    RESTOCK = "restock"
    SALE = "sale"
    DAMAGE = "damage"
    EXPIRED = "expired"
    RETURN = "return"
    ADJUSTMENT = "adjustment"


class ExpiryAlertLevel(str, Enum):
    WARNING = "warning"       # ≤30 days
    CRITICAL = "critical"     # ≤7 days
    EXPIRED = "expired"       # ≤0 days


class InputSource(str, Enum):
    VOICE = "voice"
    BARCODE = "barcode"
    OCR = "ocr"
    OCR_LIST = "ocr_list"
    MANUAL = "manual"
    GESTURE = "gesture"
    MIXED = "mixed"


class AttendanceStatus(str, Enum):
    PRESENT = "present"
    LATE = "late"
    HALF_DAY = "half_day"
    ABSENT = "absent"


class GestureType(str, Enum):
    SWIPE_LEFT = "swipe_left"
    SWIPE_RIGHT = "swipe_right"
    THUMBS_UP = "thumbs_up"
    THUMBS_DOWN = "thumbs_down"
    POINT = "point"
    WAVE = "wave"
    PINCH = "pinch"
    OPEN_PALM = "open_palm"


# ══════════════════════════════════════
# Base Mixins
# ══════════════════════════════════════

class TimestampMixin(BaseModel):
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ══════════════════════════════════════
# User Schemas (kiosk_auth.users)
# ══════════════════════════════════════

class AccessibilityPreferences(BaseModel):
    high_contrast: bool = False
    large_text: bool = False
    voice_enabled: bool = True
    gesture_enabled: bool = True
    language: str = "en"
    tts_speed: float = 1.0
    font_scale: float = 1.0


class UserBase(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    role: UserRole = UserRole.GUEST
    accessibility_preferences: AccessibilityPreferences = Field(
        default_factory=AccessibilityPreferences
    )


class UserCreate(UserBase):
    pin: Optional[str] = None
    email: Optional[str] = None


class UserResponse(UserBase):
    id: str
    reward_points: int = 0
    lifetime_points: int = 0
    tier: CustomerTier = CustomerTier.BRONZE
    last_login_at: Optional[datetime] = None
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: UserRole
    user_id: str
    expires_in: int


# ══════════════════════════════════════
# Reward Points (kiosk_auth.reward_points)
# ══════════════════════════════════════

class RewardTransaction(BaseModel):
    user_id: str
    order_id: Optional[str] = None
    type: RewardType
    points: int
    balance_after: int
    description: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str = "system"


# ══════════════════════════════════════
# Staff Attendance (kiosk_auth.staff_attendance)
# ══════════════════════════════════════

class AttendanceRecord(BaseModel):
    user_id: str
    date: str               # "2026-03-28"
    clock_in: datetime
    clock_out: Optional[datetime] = None
    break_minutes: int = 0
    total_hours: Optional[float] = None
    status: AttendanceStatus = AttendanceStatus.PRESENT
    notes: Optional[str] = None


# ══════════════════════════════════════
# Product Schemas (kiosk_inventory.products)
# ══════════════════════════════════════

class ProductLocation(BaseModel):
    aisle: str
    shelf: str
    section: Optional[str] = None
    floor: int = 0


class ProductBase(BaseModel):
    name: str
    category: str
    sub_category: Optional[str] = None
    brand: Optional[str] = None
    price: float                        # MRP
    selling_price: Optional[float] = None
    unit: str = "piece"
    tax_rate: float = 5.0
    barcode: Optional[str] = None
    sku: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    tags: List[str] = Field(default_factory=list)


class ProductCreate(ProductBase):
    stock_quantity: int = 0
    min_stock_level: int = 10
    max_stock_level: int = 100
    cost_price: Optional[float] = None
    manufacturing_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    batch_number: Optional[str] = None
    location: Optional[ProductLocation] = None


class ProductResponse(ProductBase):
    id: str
    stock_quantity: int
    min_stock_level: int = 10
    location: Optional[ProductLocation] = None
    manufacturing_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    is_available: bool = True


# ══════════════════════════════════════
# Stock Movement (kiosk_inventory.stock_movements)
# ══════════════════════════════════════

class StockMovement(BaseModel):
    product_id: str
    type: StockMovementType
    quantity_change: int
    quantity_before: int
    quantity_after: int
    batch_number: Optional[str] = None
    reason: str = ""
    order_id: Optional[str] = None
    user_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ══════════════════════════════════════
# Expiry Alert (kiosk_inventory.expiry_alerts)
# ══════════════════════════════════════

class ExpiryAlert(BaseModel):
    product_id: str
    product_name: str
    batch_number: Optional[str] = None
    expiry_date: datetime
    days_until_expiry: int
    alert_level: ExpiryAlertLevel
    stock_quantity: int
    is_resolved: bool = False
    resolved_action: Optional[str] = None
    resolved_by: Optional[str] = None


# ══════════════════════════════════════
# Cart Schemas (kiosk_orders.carts)
# ══════════════════════════════════════

class CartItem(BaseModel):
    product_id: str
    product_name: str
    barcode: Optional[str] = None
    quantity: float = 1
    unit: str = "piece"
    unit_price: float
    total_price: float
    added_via: InputSource = InputSource.MANUAL


class CartResponse(BaseModel):
    user_id: str
    items: List[CartItem] = Field(default_factory=list)
    subtotal: float = 0
    item_count: int = 0
    points_available: int = 0
    points_to_apply: int = 0


# ══════════════════════════════════════
# Order Schemas (kiosk_orders.orders)
# ══════════════════════════════════════

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    barcode: Optional[str] = None
    quantity: float
    unit: str = "piece"
    unit_price: float
    tax_rate: float = 5.0
    tax_amount: float = 0
    total_price: float
    added_via: InputSource = InputSource.MANUAL


class DeliveryAddress(BaseModel):
    line1: str
    line2: Optional[str] = None
    pincode: str
    landmark: Optional[str] = None


class OrderCreate(BaseModel):
    items: List[OrderItem]
    delivery_type: DeliveryType = DeliveryType.PICKUP
    delivery_address: Optional[DeliveryAddress] = None
    delivery_notes: Optional[str] = None
    points_to_redeem: int = 0
    notes: Optional[str] = None
    input_source: InputSource = InputSource.MANUAL


class OrderResponse(BaseModel):
    id: str
    order_number: Optional[str] = None
    user_id: str
    items: List[OrderItem]
    subtotal: float
    tax_amount: float = 0
    tax: float = 0
    discount_amount: float = 0
    points_redeemed: int = 0
    points_value: float = 0
    points_earned: int = 0
    total: float
    status: OrderStatus
    delivery_type: DeliveryType = DeliveryType.PICKUP
    delivery_address: Optional[DeliveryAddress] = None
    input_source: InputSource = InputSource.MANUAL
    created_at: datetime


# ══════════════════════════════════════
# Billing Schemas (kiosk_orders.bills)
# ══════════════════════════════════════

class BillGenerate(BaseModel):
    order_id: str
    payment_method: PaymentMethod = PaymentMethod.UPI


class BillResponse(BaseModel):
    id: str
    bill_number: Optional[str] = None
    order_id: str
    subtotal: float
    tax_percent: float
    tax_amount: float
    discount_amount: float = 0
    points_redeemed: int = 0
    points_discount: float = 0
    total: float = 0
    grand_total: float = 0
    payment_method: PaymentMethod
    payment_status: PaymentStatus = PaymentStatus.PENDING
    receipt_url: Optional[str] = None


# ══════════════════════════════════════
# Payment Schemas (kiosk_payment.payments)
# ══════════════════════════════════════

class UPIQRRequest(BaseModel):
    order_id: str
    amount: float
    merchant_name: Optional[str] = None


class UPIQRResponse(BaseModel):
    order_id: str
    qr_code_base64: str
    upi_uri: str
    amount: float
    expires_at: datetime


class PaymentConfirm(BaseModel):
    order_id: str
    payment_method: PaymentMethod
    confirmed_by: str
    confirmation_note: Optional[str] = None


# ══════════════════════════════════════
# AI Schemas
# ══════════════════════════════════════

class STTRequest(BaseModel):
    audio_base64: str
    language: str = "en"


class STTResponse(BaseModel):
    text: str
    confidence: float
    language: str


class TTSRequest(BaseModel):
    text: str
    voice: str = "en_US-lessac-medium"


class OCRRequest(BaseModel):
    image_base64: str
    mode: str = "printed"       # "printed" | "handwritten"


class OCRResponse(BaseModel):
    text: str
    items: List[dict] = Field(default_factory=list)
    confidence: float


class IntentRequest(BaseModel):
    text: str
    context: dict = Field(default_factory=dict)


class IntentResponse(BaseModel):
    intent: str
    entities: dict = Field(default_factory=dict)
    action: str
    confidence: float
    response_text: str


class GestureResponse(BaseModel):
    gesture: GestureType
    confidence: float
    landmarks: Optional[List[dict]] = None


# ══════════════════════════════════════
# AI Log Schemas (kiosk_ai collections)
# ══════════════════════════════════════

class VoiceCommandLog(BaseModel):
    user_id: str
    session_id: Optional[str] = None
    audio_duration_ms: int
    language: str = "en"
    transcript: str
    stt_confidence: float
    stt_model: str = "whisper-small"
    stt_latency_ms: int
    intent: str
    entities: dict = Field(default_factory=dict)
    llm_confidence: float
    llm_model: str = "mistral-7b-q4"
    llm_latency_ms: int
    action_taken: Optional[str] = None
    action_success: bool = False
    response_text: Optional[str] = None
    tts_generated: bool = False
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class OCRScanLog(BaseModel):
    user_id: str
    session_id: Optional[str] = None
    scan_type: str          # "product_label" | "price_tag" | "barcode"
    raw_text: str
    ocr_confidence: float
    ocr_engine: str = "tesseract-5"
    ocr_latency_ms: int
    parsed_product: dict = Field(default_factory=dict)
    matched_product_id: Optional[str] = None
    match_confidence: Optional[float] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ShoppingListOCRItem(BaseModel):
    raw_text: str
    name: str
    quantity: float = 1
    unit: Optional[str] = None
    matched_product_id: Optional[str] = None
    match_confidence: Optional[float] = None
    is_ambiguous: bool = False


class ShoppingListOCR(BaseModel):
    user_id: str
    session_id: Optional[str] = None
    raw_text: str
    ocr_confidence: float
    parsed_items: List[ShoppingListOCRItem] = Field(default_factory=list)
    llm_model: str = "mistral-7b-q4"
    llm_latency_ms: int = 0
    total_items_detected: int = 0
    total_items_matched: int = 0
    status: str = "processed"
    order_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ══════════════════════════════════════
# Analytics / CRM Schemas
# ══════════════════════════════════════

class SalesSummary(BaseModel):
    date: str
    total_orders: int
    total_revenue: float
    avg_order_value: float
    top_products: List[dict] = Field(default_factory=list)


class CustomerProfile(BaseModel):
    user_id: str
    name: Optional[str] = None
    phone: Optional[str] = None
    total_orders: int = 0
    total_spent: float = 0
    avg_order_value: float = 0
    favorite_products: List[dict] = Field(default_factory=list)
    favorite_categories: List[dict] = Field(default_factory=list)
    preferred_delivery: Optional[str] = None
    preferred_payment: Optional[str] = None
    visit_count: int = 0
    last_visit_at: Optional[datetime] = None
    current_points: int = 0
    tier: CustomerTier = CustomerTier.BRONZE
    voice_orders_count: int = 0
    ocr_orders_count: int = 0
