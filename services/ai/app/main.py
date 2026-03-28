"""
Lightweight AI Inference Service – Kiosk Vision
Focuses on basic OCR (Tesseract) and Barcode (PyZBar) with minimal overhead.
Speech and LLM features are offloaded to Browser APIs or simplified.
"""

import os
import json
import base64
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import sys
# Dynamic path for local execution
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from shared.schemas.models import (
    STTRequest, STTResponse, TTSRequest,
    OCRRequest, OCRResponse, IntentRequest, IntentResponse,
)

logger = logging.getLogger("ai-service")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Lightweight AI service starting up...")
    yield
    logger.info("Shutting down AI service")

app = FastAPI(title="Kiosk Vision – Lightweight AI Service", version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.get("/health")
async def health():
    return {"status": "ok", "mode": "lightweight", "service": "ai"}

# ──────────────────────────────────────
# Speech-to-Text (REMOVED - Use Browser API)
# ──────────────────────────────────────

@app.post("/speech-to-text", response_model=STTResponse)
async def speech_to_text(req: STTRequest):
    """Redirect to Browser Web Speech API."""
    raise HTTPException(status_code=501, detail="Use browser-based Web Speech API (SpeechRecognition) for lightweight STT.")

# ──────────────────────────────────────
# Text-to-Speech (REMOVED - Use Browser API)
# ──────────────────────────────────────

@app.post("/text-to-speech")
async def text_to_speech(req: TTSRequest):
    """Redirect to Browser SpeechSynthesis."""
    return {
        "text": req.text,
        "fallback": True,
        "message": "Use browser-based window.speechSynthesis for lightweight TTS."
    }

# ──────────────────────────────────────
# OCR (Simplified)
# ──────────────────────────────────────

@app.post("/ocr", response_model=OCRResponse)
async def perform_ocr(req: OCRRequest):
    """Extract text from image using Tesseract."""
    from .utils.ocr_pipeline import process_generic_ocr
    try:
        image_bytes = base64.b64decode(req.image_base64)
        result = process_generic_ocr(image_bytes, mode=req.mode)
        return OCRResponse(text=result["text"], items=[], confidence=result["confidence"])
    except Exception as e:
        logger.exception("OCR failed")
        raise HTTPException(500, str(e))

@app.post("/ocr/shopping-list")
async def ocr_shopping_list(req: OCRRequest):
    """Simple OCR + Keyword parsing for shopping lists."""
    ocr_result = await perform_ocr(req)
    # Simple newline splitting as items
    items = [line.strip() for line in ocr_result.text.split("\n") if line.strip()]
    return {
        "raw_text": ocr_result.text,
        "parsed_items": [{"name": it, "quantity": 1} for it in items],
        "confidence": ocr_result.confidence,
    }

# ──────────────────────────────────────
# Intent Parsing (Rule-based + Entity Extraction)
# ──────────────────────────────────────

import re

# Common units people say when ordering
_UNIT_WORDS = r'(?:kg|kgs|kilogram|kilograms|g|grams|gram|l|litre|litres|liter|liters|ml|packet|packets|pack|packs|piece|pieces|bottle|bottles|bag|bags|box|boxes|dozen|can|cans|tube|tubes)'
# Filler words to strip when extracting product name
_FILLER_WORDS = {"please", "can", "you", "i", "want", "need", "get", "me", "some", "a", "an", "the", "of", "and", "to", "my", "cart", "put", "into", "in"}

def _extract_entities(text: str) -> dict:
    """Extract product_name and quantity from natural speech text."""
    text = text.lower().strip()
    entities: dict = {}

    # Try pattern: <quantity> [unit] [of] <product>
    # e.g. "2 kg rice", "3 packets of sugar", "1 litre milk"
    qty_pattern = re.compile(
        r'(\d+(?:\.\d+)?)\s*' + _UNIT_WORDS + r'?\s*(?:of\s+)?(.+)',
        re.IGNORECASE
    )
    m = qty_pattern.search(text)
    if m:
        entities["quantity"] = int(float(m.group(1)))
        raw_product = m.group(2).strip()
    else:
        # Try pattern: <quantity> <product> (no unit)
        m2 = re.search(r'(\d+)\s+(.+)', text)
        if m2:
            entities["quantity"] = int(m2.group(1))
            raw_product = m2.group(2).strip()
        else:
            entities["quantity"] = 1
            raw_product = text

    # Strip command verbs and filler words from the product name
    # Remove leading action words like "add", "buy", "get", "order"
    raw_product = re.sub(r'^(?:add|buy|order|get|put|search|find|show|where\s+is|remove|delete|take\s+out)\s+', '', raw_product, flags=re.IGNORECASE)
    
    # Remove trailing cart slang
    raw_product = re.sub(r'\s+(?:from|on|in|out of)\s+(?:cart|curt|the cart|my cart)$', '', raw_product, flags=re.IGNORECASE)
    
    # Remove filler words
    words = raw_product.split()
    cleaned = [w for w in words if w not in _FILLER_WORDS]
    product_name = " ".join(cleaned).strip().rstrip(".,!?")

    # Handle multi-product "X and Y" – take the first product
    if " and " in product_name:
        parts = [p.strip() for p in product_name.split(" and ") if p.strip()]
        if parts:
            product_name = parts[0]
            # Store all products for future multi-add support
            entities["all_products"] = parts

    if product_name:
        entities["product_name"] = product_name

    return entities


@app.post("/intent", response_model=IntentResponse)
async def parse_intent(req: IntentRequest):
    """Rule-based intent + entity extraction from natural speech."""
    text = req.text.lower().strip()
    intent = "unknown"
    action = "I'm not sure how to help with that."
    entities: dict = {}

    if any(k in text for k in ["add", "buy", "order", "want", "need", "get me", "put", "into cart", "i need"]):
        intent = "add_to_cart"
        entities = _extract_entities(text)
        product = entities.get("product_name", "item")
        qty = entities.get("quantity", 1)
        action = f"Adding {qty} {product} to your cart."
    elif any(k in text for k in ["remove", "delete", "take out", "take off"]):
        intent = "remove_from_cart"
        entities = _extract_entities(text)
        product = entities.get("product_name", "item")
        action = f"Removing {product} from cart."
    elif any(k in text for k in ["search", "find", "where is", "look for", "do you have", "show me"]):
        intent = "search_product"
        entities = _extract_entities(text)
        product = entities.get("product_name", "item")
        action = f"Searching for {product}."
    elif any(k in text for k in ["checkout", "pay", "bill", "done shopping", "finish"]):
        intent = "checkout"
        action = "Proceeding to checkout."
    elif any(k in text for k in ["cheapest", "lowest price", "inexpensive"]):
        intent = "find_cheapest"
        action = "Finding the cheapest item for you."
    elif any(k in text for k in ["orders", "past orders", "order history"]):
        intent = "view_orders"
        action = "Opening your orders history."
    elif any(k in text for k in ["account", "profile", "my account"]):
        intent = "view_account"
        action = "Opening your account profile."
    elif any(k in text for k in ["show cart", "my cart", "view cart", "what's in my cart"]):
        intent = "view_cart"
        action = "Here's your cart."
    elif any(k in text for k in ["hi", "hello", "hey", "good morning", "good evening"]):
        intent = "greeting"
        action = "Hello! How can I help you today?"
    elif any(k in text for k in ["help", "what can you do", "how to"]):
        intent = "help"
        action = "You can say things like 'Add 2 kg rice', 'Find toothpaste', or 'Show my cart'."
    else:
        # Last resort: try to extract entities anyway; treat as add_to_cart if product found
        entities = _extract_entities(text)
        if entities.get("product_name"):
            intent = "add_to_cart"
            product = entities["product_name"]
            qty = entities.get("quantity", 1)
            action = f"Adding {qty} {product} to your cart."

    return IntentResponse(
        intent=intent,
        entities=entities,
        action=action,
        confidence=0.9 if intent != "unknown" else 0.1,
        response_text=action
    )

# ──────────────────────────────────────
# Barcode Scanning (PyZBar)
# ──────────────────────────────────────

@app.post("/barcode")
async def decode_barcode(req: dict):
    """Decode barcode using PyZBar."""
    from .utils.ocr_pipeline import process_barcode
    try:
        image_bytes = base64.b64decode(req.get("image_base64", ""))
        result = process_barcode(image_bytes)
        if not result.get("barcodes"):
            raise HTTPException(404, "No barcode detected")
        return result
    except Exception as e:
        logger.exception("Barcode failed")
        if isinstance(e, HTTPException): raise
        raise HTTPException(500, str(e))

# ──────────────────────────────────────
# WebSocket Stream (Minimal)
# ──────────────────────────────────────

@app.websocket("/stream")
async def websocket_stream(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            data = await ws.receive_json()
            msg_type = data.get("type")
            if msg_type == "gesture":
                 await ws.send_json({"type": "error", "message": "Gesture recognition removed in lightweight mode."})
            elif msg_type == "intent":
                result = await parse_intent(IntentRequest(text=data["payload"]))
                await ws.send_json({"type": "intent_result", "data": result.model_dump()})
    except WebSocketDisconnect:
        pass
