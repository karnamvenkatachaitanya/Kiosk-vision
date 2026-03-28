
FROM python:3.11-bullseye

WORKDIR /app

# Install system dependencies for OCR, barcode, and computer vision
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-eng \
    libzbar0 \
    libgl1-mesa-glx \
    libglib2.0-0 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

COPY services/ai/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY shared/ /app/shared/
COPY services/ai/app/ /app/app/

# Create models directory
RUN mkdir -p /app/models/whisper /app/models/piper /app/models/mediapipe

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
