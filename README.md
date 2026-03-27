# 🛒 Kiosk Vision – AI Powered Inclusive Self-Service Kiosk

> An offline-first, LAN-deployed, AI-powered kiosk system enabling specially-abled users to interact with self-service kiosks using **voice**, **gesture**, and **visual guidance**.

## ✨ Features

- 🎙️ **Voice-based ordering** – Speak your shopping list
- 📷 **OCR scanning** – Scan printed or handwritten shopping lists
- 📊 **Barcode scanning** – Instant product lookup
- 🤌 **Gesture interaction** – Navigate hands-free
- 🗺️ **Product location mapping** – Find items in-store
- 💳 **UPI QR payments** – Offline payment QR generation
- 📦 **Inventory management** – Real-time stock tracking
- 📈 **CRM & Analytics** – Sales dashboards and customer insights
- 🔒 **Fully offline** – No internet required, runs on LAN

## 🏗️ Architecture

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite (PWA) |
| Backend | Python FastAPI (6 microservices) |
| AI Engine | Ollama (Mistral 7B), Whisper, Tesseract, MediaPipe, Piper TTS |
| Database | MongoDB 7 |
| Cache | Redis 7 |
| Storage | MinIO |
| Infra | Docker Compose |

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose v2
- 16 GB RAM minimum (32 GB recommended)
- 256 GB SSD storage

### Setup

```bash
# 1. Clone and configure
cp .env.example .env
# Edit .env with your shop details

# 2. Download AI models (one-time, requires internet)
./scripts/download-models.sh

# 3. Start all services
docker compose up -d

# 4. Seed initial data
./scripts/seed-db.sh

# 5. Generate shop entry QR code
python scripts/generate-qr.py
```

### Access
- **Kiosk UI:** https://192.168.1.10 (from shop WiFi)
- **Admin Dashboard:** https://192.168.1.10/admin
- **API Docs:** https://192.168.1.10/api/docs

## 📂 Project Structure

```
kiosk-vision/
├── frontend/          # React PWA
├── gateway/           # Nginx reverse proxy
├── services/
│   ├── auth/          # Auth & User Service (port 8001)
│   ├── orders/        # Order & Billing (port 8002)
│   ├── inventory/     # Inventory Management (port 8003)
│   ├── ai/            # AI Inference Engine (port 8004)
│   ├── payment/       # UPI Payment (port 8005)
│   └── crm/           # CRM & Analytics (port 8006)
├── shared/            # Shared Python utilities
├── scripts/           # Setup & utility scripts
└── docker-compose.yml
```

## 👥 User Roles

| Role | Access |
|------|--------|
| Guest | Browse, order, voice/gesture |
| Daily Customer | + Order history, preferences |
| Supervisor | + Payment confirm, inventory |
| Owner | + Analytics, system config |

## 📄 License

MIT License – Built for Hackathon 2026
