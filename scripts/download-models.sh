#!/bin/bash
# ═══════════════════════════════════════
# Kiosk Vision – AI Model Downloader
# Run this ONCE with internet to download all required AI models.
# ═══════════════════════════════════════

set -e

echo "╔════════════════════════════════════════╗"
echo "║  Kiosk Vision – Model Download Script  ║"
echo "╚════════════════════════════════════════╝"

MODELS_DIR="./services/ai/models"
mkdir -p "$MODELS_DIR/whisper" "$MODELS_DIR/piper" "$MODELS_DIR/mediapipe"

# ── 1. Download Whisper model via faster-whisper ──
echo ""
echo "▸ [1/4] Downloading Whisper 'small' model..."
echo "  (This will be auto-downloaded on first use by faster-whisper)"
echo "  Pre-caching model..."
python3 -c "
from faster_whisper import WhisperModel
model = WhisperModel('small', device='cpu', compute_type='int8')
print('  ✓ Whisper small model cached')
" 2>/dev/null || echo "  ⚠ Install faster-whisper first: pip install faster-whisper"

# ── 2. Download Piper TTS voice ──
echo ""
echo "▸ [2/4] Downloading Piper TTS voice (en_US-lessac-medium)..."
PIPER_URL="https://github.com/rhasspy/piper/releases/download/v1.2.0"
if [ ! -f "$MODELS_DIR/piper/en_US-lessac-medium.onnx" ]; then
    curl -L "$PIPER_URL/voice-en_US-lessac-medium.tar.gz" | tar xz -C "$MODELS_DIR/piper/" 2>/dev/null \
        && echo "  ✓ Piper TTS voice downloaded" \
        || echo "  ⚠ Could not download Piper voice. Download manually."
else
    echo "  ✓ Already exists"
fi

# ── 3. Pull Ollama LLM model ──
echo ""
echo "▸ [3/4] Pulling Mistral 7B model via Ollama..."
echo "  Starting Ollama container temporarily..."
docker compose up -d ollama 2>/dev/null || docker-compose up -d ollama 2>/dev/null
sleep 5

docker exec kiosk-ollama ollama pull mistral:7b-instruct-v0.3-q4_K_M \
    && echo "  ✓ Mistral 7B model pulled" \
    || echo "  ⚠ Could not pull model. Run: docker exec kiosk-ollama ollama pull mistral:7b-instruct-v0.3-q4_K_M"

# ── 4. Download MediaPipe models ──
echo ""
echo "▸ [4/4] MediaPipe models..."
echo "  ✓ MediaPipe models are bundled with the pip package (auto-downloaded)"

echo ""
echo "╔════════════════════════════════════════╗"
echo "║  ✅ Model download complete!           ║"
echo "║  You can now run offline.              ║"
echo "╚════════════════════════════════════════╝"
