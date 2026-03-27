"""
AI Inference Service – Kiosk Vision
Orchestrates all local AI models: STT (Whisper), TTS (Piper), OCR (Tesseract),
LLM intent parsing (Ollama), gesture recognition (MediaPipe), barcode decoding.
"""

import os
import json
import base64
import io
import logging
from datetime import datetime
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import sys
sys.path.insert(0, "/app")
from shared.schemas.models import (
    STTRequest, STTResponse, TTSRequest,
    OCRRequest, OCRResponse, IntentRequest, IntentResponse,
    GestureType, GestureResponse,
)

logger = logging.getLogger("ai-service")

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://ollama:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "mistral:7b-instruct-v0.3-q4_K_M")
WHISPER_MODEL = os.getenv("WHISPER_MODEL", "small")
WHISPER_DEVICE = os.getenv("WHISPER_DEVICE", "cpu")

# Lazy-loaded model references
_whisper_model = None
_mediapipe_hands = None


def get_whisper():
    global _whisper_model
    if _whisper_model is None:
        try:
            from faster_whisper import WhisperModel
            _whisper_model = WhisperModel(WHISPER_MODEL, device=WHISPER_DEVICE, compute_type="int8")
            logger.info(f"Whisper model '{WHISPER_MODEL}' loaded on {WHISPER_DEVICE}")
        except ImportError:
            logger.warning("faster-whisper not installed, STT will be unavailable")
    return _whisper_model


def get_mediapipe():
    global _mediapipe_hands
    if _mediapipe_hands is None:
        try:
            import mediapipe as mp
            _mediapipe_hands = mp.solutions.hands.Hands(
                static_image_mode=False,
                max_num_hands=2,
                min_detection_confidence=0.7,
            )
            logger.info("MediaPipe Hands model loaded")
        except ImportError:
            logger.warning("mediapipe not installed, gesture recognition unavailable")
    return _mediapipe_hands


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-load models at startup
    logger.info("Pre-loading AI models...")
    get_whisper()
    get_mediapipe()
    logger.info("AI models ready")
    yield
    logger.info("Shutting down AI service")


app = FastAPI(title="Kiosk Vision – AI Inference Service", version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "ai",
        "models": {
            "whisper": _whisper_model is not None,
            "mediapipe": _mediapipe_hands is not None,
        },
    }


# ──────────────────────────────────────
# Speech-to-Text (Whisper)
# ──────────────────────────────────────

@app.post("/speech-to-text", response_model=STTResponse)
async def speech_to_text(req: STTRequest):
    """Convert audio to text using Whisper."""
    model = get_whisper()
    if model is None:
        raise HTTPException(503, "Whisper model not available")

    audio_bytes = base64.b64decode(req.audio_base64)
    audio_file = io.BytesIO(audio_bytes)

    segments, info = model.transcribe(audio_file, language=req.language if req.language != "auto" else None)
    text = " ".join([segment.text for segment in segments])

    return STTResponse(
        text=text.strip(),
        confidence=round(info.language_probability, 3) if info.language_probability else 0.0,
        language=info.language or req.language,
    )


@app.post("/speech-to-text/upload")
async def speech_to_text_upload(file: UploadFile = File(...)):
    """Upload audio file for STT."""
    model = get_whisper()
    if model is None:
        raise HTTPException(503, "Whisper model not available")

    audio_bytes = await file.read()
    audio_file = io.BytesIO(audio_bytes)

    segments, info = model.transcribe(audio_file)
    text = " ".join([segment.text for segment in segments])

    return STTResponse(
        text=text.strip(),
        confidence=round(info.language_probability, 3) if info.language_probability else 0.0,
        language=info.language or "en",
    )


# ──────────────────────────────────────
# Text-to-Speech (Piper)
# ──────────────────────────────────────

@app.post("/text-to-speech")
async def text_to_speech(req: TTSRequest):
    """Convert text to speech audio using Piper TTS."""
    try:
        import subprocess
        result = subprocess.run(
            ["piper", "--model", f"/app/models/piper/{req.voice}.onnx", "--output_raw"],
            input=req.text.encode(),
            capture_output=True,
            timeout=10,
        )
        if result.returncode != 0:
            raise HTTPException(500, "TTS generation failed")

        audio_b64 = base64.b64encode(result.stdout).decode()
        return {"audio_base64": audio_b64, "format": "raw", "sample_rate": 22050}
    except FileNotFoundError:
        # Fallback: return text (client can use browser TTS)
        return {"text": req.text, "fallback": True, "message": "Piper TTS not available, use browser speechSynthesis"}


# ──────────────────────────────────────
# OCR (Tesseract)
# ──────────────────────────────────────

@app.post("/ocr", response_model=OCRResponse)
async def perform_ocr(req: OCRRequest):
    """Extract text from image using Tesseract OCR."""
    try:
        import pytesseract
        from PIL import Image

        image_bytes = base64.b64decode(req.image_base64)
        image = Image.open(io.BytesIO(image_bytes))

        if req.mode == "handwritten":
            # Use specific config for handwriting
            config = "--psm 6 --oem 3"
        else:
            config = "--psm 3 --oem 3"

        text = pytesseract.image_to_string(image, config=config)
        data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT, config=config)

        # Calculate average confidence
        confidences = [int(c) for c in data["conf"] if int(c) > 0]
        avg_confidence = sum(confidences) / len(confidences) / 100 if confidences else 0.0

        return OCRResponse(text=text.strip(), items=[], confidence=round(avg_confidence, 3))
    except ImportError:
        raise HTTPException(503, "Tesseract/pytesseract not installed")


@app.post("/ocr/shopping-list")
async def ocr_shopping_list(req: OCRRequest):
    """Parse handwritten shopping list: OCR + LLM post-processing."""
    # Step 1: OCR
    ocr_result = await perform_ocr(OCRRequest(image_base64=req.image_base64, mode="handwritten"))

    # Step 2: LLM post-processing to parse items
    intent_result = await parse_intent(IntentRequest(
        text=f"Parse this handwritten shopping list into structured items with quantities: {ocr_result.text}",
        context={"task": "shopping_list_parse"},
    ))

    return {
        "raw_text": ocr_result.text,
        "parsed_items": intent_result.entities.get("items", []),
        "confidence": ocr_result.confidence,
    }


# ──────────────────────────────────────
# LLM Intent Parsing (Ollama)
# ──────────────────────────────────────

@app.post("/intent", response_model=IntentResponse)
async def parse_intent(req: IntentRequest):
    """Parse user text into structured intent using local LLM."""
    import httpx

    system_prompt = """You are a kiosk assistant AI. Parse user requests into structured JSON.
Output ONLY valid JSON with these fields:
- intent: one of [add_to_cart, remove_from_cart, search_product, get_location, checkout, help, greeting, unknown]
- entities: {product_name, quantity, category} as applicable
- action: brief description of what to do
- confidence: 0.0 to 1.0
- response_text: friendly response to speak to the user"""

    if req.context.get("task") == "shopping_list_parse":
        system_prompt = """Parse the following shopping list text into structured items.
Output ONLY valid JSON: {"items": [{"name": "...", "quantity": 1}, ...]}"""

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": OLLAMA_MODEL,
                    "prompt": req.text,
                    "system": system_prompt,
                    "stream": False,
                    "options": {"temperature": 0.1, "num_predict": 512},
                },
            )
            response.raise_for_status()
            result = response.json()
            llm_text = result.get("response", "{}")

            # Parse LLM JSON output
            try:
                parsed = json.loads(llm_text)
            except json.JSONDecodeError:
                parsed = {"intent": "unknown", "entities": {}, "action": "Could not parse", "confidence": 0.0, "response_text": llm_text}

            return IntentResponse(
                intent=parsed.get("intent", "unknown"),
                entities=parsed.get("entities", {}),
                action=parsed.get("action", ""),
                confidence=parsed.get("confidence", 0.5),
                response_text=parsed.get("response_text", "I'm not sure I understand."),
            )
    except Exception as e:
        logger.error(f"LLM inference error: {e}")
        return IntentResponse(
            intent="unknown", entities={}, action="error",
            confidence=0.0, response_text="Sorry, I couldn't process that. Please try again.",
        )


# ──────────────────────────────────────
# Gesture Recognition (MediaPipe)
# ──────────────────────────────────────

@app.post("/gesture", response_model=GestureResponse)
async def recognize_gesture(req: dict):
    """Recognize hand gesture from image frame."""
    try:
        import cv2
        import numpy as np

        hands = get_mediapipe()
        if hands is None:
            raise HTTPException(503, "MediaPipe not available")

        image_bytes = base64.b64decode(req.get("image_base64", ""))
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        results = hands.process(rgb)

        if not results.multi_hand_landmarks:
            return GestureResponse(gesture=GestureType.OPEN_PALM, confidence=0.0)

        # Simple gesture classification based on landmarks
        landmarks = results.multi_hand_landmarks[0]
        landmark_list = [{"x": lm.x, "y": lm.y, "z": lm.z} for lm in landmarks.landmark]

        # Basic: check if thumb is up
        thumb_tip = landmarks.landmark[4]
        index_tip = landmarks.landmark[8]
        wrist = landmarks.landmark[0]

        if thumb_tip.y < wrist.y and index_tip.y > wrist.y:
            gesture = GestureType.THUMBS_UP
            confidence = 0.85
        elif index_tip.y < wrist.y:
            gesture = GestureType.POINT
            confidence = 0.75
        else:
            gesture = GestureType.OPEN_PALM
            confidence = 0.6

        return GestureResponse(gesture=gesture, confidence=confidence, landmarks=landmark_list)
    except ImportError:
        raise HTTPException(503, "OpenCV/MediaPipe not installed")


# ──────────────────────────────────────
# Barcode Scanning
# ──────────────────────────────────────

@app.post("/barcode")
async def decode_barcode(req: dict):
    """Decode barcode from image."""
    try:
        from pyzbar import pyzbar
        from PIL import Image

        image_bytes = base64.b64decode(req.get("image_base64", ""))
        image = Image.open(io.BytesIO(image_bytes))

        barcodes = pyzbar.decode(image)
        results = []
        for barcode in barcodes:
            results.append({
                "data": barcode.data.decode("utf-8"),
                "type": barcode.type,
                "rect": {"x": barcode.rect.left, "y": barcode.rect.top, "w": barcode.rect.width, "h": barcode.rect.height},
            })

        if not results:
            raise HTTPException(404, "No barcode detected")

        return {"barcodes": results}
    except ImportError:
        raise HTTPException(503, "pyzbar not installed")


# ──────────────────────────────────────
# WebSocket – Real-time Voice & Gesture
# ──────────────────────────────────────

@app.websocket("/stream")
async def websocket_stream(ws: WebSocket):
    """Real-time WebSocket for streaming voice and gesture data."""
    await ws.accept()
    try:
        while True:
            data = await ws.receive_json()
            msg_type = data.get("type")

            if msg_type == "audio":
                # Process audio chunk
                try:
                    result = await speech_to_text(STTRequest(
                        audio_base64=data["payload"],
                        language=data.get("language", "en"),
                    ))
                    await ws.send_json({"type": "stt_result", "data": result.model_dump()})
                except Exception as e:
                    await ws.send_json({"type": "error", "message": str(e)})

            elif msg_type == "gesture":
                # Process gesture frame
                try:
                    result = await recognize_gesture({"image_base64": data["payload"]})
                    await ws.send_json({"type": "gesture_result", "data": result.model_dump()})
                except Exception as e:
                    await ws.send_json({"type": "error", "message": str(e)})

            elif msg_type == "intent":
                # Parse intent
                try:
                    result = await parse_intent(IntentRequest(text=data["payload"]))
                    await ws.send_json({"type": "intent_result", "data": result.model_dump()})
                except Exception as e:
                    await ws.send_json({"type": "error", "message": str(e)})

    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")
