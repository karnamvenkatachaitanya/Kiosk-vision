import io
import cv2
import base64
import numpy as np
import logging
from PIL import Image

logger = logging.getLogger("ai-service.ocr-pipeline")

def decode_image(image_bytes: bytes) -> np.ndarray:
    """Decode raw image bytes into an OpenCV BGR array."""
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img


def preprocess_for_tesseract(img: np.ndarray) -> Image.Image:
    """Clean image specifically for Tesseract OCR."""
    # Resize if too large
    max_dim = 1024
    h, w = img.shape[:2]
    if max(h, w) > max_dim:
        scale = max_dim / max(h, w)
        img = cv2.resize(img, (int(w * scale), int(h * scale)))

    # Grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Enhancing contrast
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    gray = clahe.apply(gray)
    
    # Thresholding to get black and white
    thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]
    
    return Image.fromarray(thresh)


def process_generic_ocr(image_bytes: bytes, mode: str = "printed") -> dict:
    """Extract text using Tesseract OCR (Lightweight fallback)."""
    try:
        import pytesseract
    except ImportError:
        raise Exception("pytesseract not installed")

    img = decode_image(image_bytes)
    if img is None:
        raise ValueError("Invalid image")

    pil_img = preprocess_for_tesseract(img)
    
    # PSM 6 for sparse text (handwritten/lists), PSM 3 for fully automatic
    config = "--psm 6 --oem 3" if mode == "handwritten" else "--psm 3 --oem 3"
    
    text = pytesseract.image_to_string(pil_img, config=config)
    data = pytesseract.image_to_data(pil_img, output_type=pytesseract.Output.DICT, config=config)
    
    confidences = [int(c) for c in data["conf"] if int(c) > 0]
    avg_conf = sum(confidences) / len(confidences) / 100 if confidences else 0.0

    return {
        "text": text.strip(),
        "confidence": round(avg_conf, 3)
    }


def process_barcode(image_bytes: bytes) -> dict:
    """Extract barcodes using PyZBar (Lightweight)."""
    try:
        from pyzbar import pyzbar
    except ImportError:
        raise Exception("pyzbar not installed")

    img = decode_image(image_bytes)
    if img is None:
        raise ValueError("Invalid image")
        
    # Convert to PIL for pyzbar
    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    pil_img = Image.fromarray(rgb)
    barcodes = pyzbar.decode(pil_img)

    # Attempt enhancement if nothing found
    if not barcodes:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
        barcodes = pyzbar.decode(Image.fromarray(thresh))

    results = []
    for b in barcodes:
        results.append({
            "data": b.data.decode("utf-8"),
            "type": b.type,
            "rect": {"x": b.rect.left, "y": b.rect.top, "w": b.rect.width, "h": b.rect.height}
        })
        
    return {"barcodes": results}
