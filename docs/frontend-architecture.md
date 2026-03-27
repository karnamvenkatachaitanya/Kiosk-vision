# Kiosk Vision – Frontend Architecture

> **Stack:** React 18 + TypeScript + Vite + Zustand + Vanilla CSS  
> **Design:** Accessibility-first for illiterate & specially-abled users

---

## 1. Project Folder Structure

```
frontend/src/
├── App.tsx                          # Root router with role-based routing
├── main.tsx                         # Vite entry point
├── index.css                        # Complete design system (600+ lines)
├── vite-env.d.ts
│
├── components/
│   ├── layout/
│   │   ├── TopBar.tsx               # Brand logo + accessibility toggles
│   │   └── BottomNav.tsx            # Role-aware icon navigation (5 tabs)
│   │
│   └── voice/
│       ├── VoiceFAB.tsx             # Floating microphone button
│       └── VoiceOverlay.tsx         # Full-screen voice command modal
│
├── pages/
│   ├── guest/                       # Guest user pages
│   │   ├── HomePage.tsx             # Mega-button grid (6 actions)
│   │   ├── BrowsePage.tsx           # Category chips + product cards
│   │   ├── VoicePage.tsx            # Giant mic + example utterances
│   │   ├── ScanPage.tsx             # Barcode / Label OCR / List OCR
│   │   ├── CartPage.tsx             # Items + qty controls + totals
│   │   ├── CheckoutPage.tsx         # Delivery type → Payment → Done
│   │   ├── StoreMapPage.tsx         # Interactive aisle grid + find item
│   │   └── GesturePage.tsx          # Camera viewport + gesture guide
│   │
│   ├── customer/                    # Daily customer extras
│   │   ├── OrderHistoryPage.tsx     # Past orders + stats
│   │   └── ProfilePage.tsx          # Reward points + accessibility settings
│   │
│   ├── supervisor/                  # Supervisor dashboard
│   │   ├── SupervisorHome.tsx       # 4 action buttons + today stats
│   │   ├── BillingPage.tsx          # Pending payments + confirm
│   │   ├── InventoryPage.tsx        # Stock levels + add product
│   │   └── ExpiryAlertsPage.tsx     # Critical/warning expiry list
│   │
│   └── owner/                       # Shop owner dashboard
│       ├── OwnerHome.tsx            # Revenue stats + AI usage
│       ├── AnalyticsPage.tsx        # Bar chart + trending + payment split
│       └── StaffPage.tsx            # Attendance chart + staff cards
│
├── services/
│   └── api.ts                       # Axios client for all 6 microservices
│
└── store/
    └── useStore.ts                  # Zustand global state
```

---

## 2. Component Structure

### Reusable Design System Components (CSS-only)

| Component | CSS Class | Purpose |
|-----------|-----------|---------|
| **Mega Button** | `.mega-btn` | 72px+ touch targets with large icons |
| **Mega Grid** | `.mega-grid` | 2-column responsive grid of mega buttons |
| **Product Card** | `.product-card` | Image + name + price + action button |
| **Category Chip** | `.chip` | Scrollable category filter with icons |
| **Quantity Control** | `.qty-control` + `.qty-btn` | Large +/– buttons |
| **Stat Card** | `.stat-card` | Dashboard metric (icon + value + label) |
| **Alert** | `.alert` | Warning/danger/success/info banners |
| **Badge** | `.badge` | Status indicators (green/red/orange/blue) |
| **Store Map** | `.store-map` + `.map-cell` | Interactive grid layout |
| **Gesture Viewport** | `.gesture-viewport` | Camera frame with overlay |
| **Voice Ring** | `.voice-ring` | Pulsing microphone button |

### React Components

| Component | Props/State | Purpose |
|-----------|-------------|---------|
| `TopBar` | reads: isHighContrast, isLargeText | Header with a11y toggles |
| `BottomNav` | reads: role, cartItems.length | Role-aware navigation |
| `VoiceFAB` | reads: isVoiceOverlayOpen | Floating action button |
| `VoiceOverlay` | reads: isVoiceActive, lastTranscript | Full-screen voice UI |

---

## 3. Page Routing

```
ROUTE                        PAGE                    ROLE ACCESS
─────────────────────────────────────────────────────────────────
/                            HomePage                all
/browse                      BrowsePage              all
/voice                       VoicePage               all
/scan                        ScanPage                all
/cart                        CartPage                all
/checkout                    CheckoutPage            all
/map                         StoreMapPage            all
/gesture                     GesturePage             all
/history                     OrderHistoryPage        customer+
/profile                     ProfilePage             all

/supervisor                  SupervisorHome          supervisor, owner
/supervisor/billing          BillingPage             supervisor, owner
/supervisor/inventory        InventoryPage           supervisor, owner
/supervisor/expiry           ExpiryAlertsPage        supervisor, owner

/owner                       OwnerHome               owner only
/owner/analytics             AnalyticsPage           owner only
/owner/staff                 StaffPage               owner only
```

---

## 4. Global State Management (Zustand)

```typescript
AppState {
  // Auth
  token, userId, role, userName, rewardPoints, isAuthenticated

  // Cart
  cartItems[], cartTotal, deliveryType

  // Accessibility / UI
  isVoiceActive, isVoiceOverlayOpen
  isHighContrast, isLargeText
  voiceEnabled, gestureEnabled
  language, ttsSpeed

  // Voice
  lastTranscript, lastIntent

  // Actions
  setAuth(), logout()
  addToCart(), updateQuantity(), removeFromCart(), clearCart()
  setDeliveryType()
  openVoiceOverlay(), closeVoiceOverlay(), toggleVoice()
  toggleHighContrast(), toggleLargeText()
  setTranscript(), setIntent(), setRewardPoints()
}
```

**Persistence:** `token`, `userId`, `role`, `name`, `highContrast`, `largeText` are persisted to `localStorage`.

---

## 5. UI Wireframe Suggestions

### Guest Home (Mobile)
```
┌──────────────────────────┐
│ 👁️ Kiosk Vision    [◐][A+]│ ← Top bar + a11y
├──────────────────────────┤
│         👋                │
│    Welcome!               │
│  How can I help you?      │
├──────────┬───────────────┤
│  🎙️      │  🛍️           │
│  VOICE   │  BROWSE       │ ← 72px mega buttons
├──────────┼───────────────┤
│  📷      │  🛒           │
│  SCAN    │  CART         │
├──────────┼───────────────┤
│  🗺️      │  🤌           │
│  FIND    │  GESTURE      │
├──────────┴───────────────┤
│                     [🎙️] │ ← Floating voice FAB
├──────────────────────────┤
│ 🏠  🛍️  📷  🛒  👤      │ ← Bottom nav (icon-first)
└──────────────────────────┘
```

### Voice Overlay
```
┌──────────────────────────┐
│    (full screen dark bg)  │
│                           │
│         ┌─────┐           │
│         │ 🎙️  │ ← 140px  │
│         │pulse│   ring    │
│         └─────┘           │
│                           │
│  ┌─────────────────────┐  │
│  │ "2 kg rice and      │  │
│  │  1 kg sugar"        │  │ ← Live transcript
│  └─────────────────────┘  │
│                           │
│  ✕ Close                  │
└──────────────────────────┘
```

### Owner Analytics
```
┌──────────────────────────┐
│ 📊 Analytics              │
├──────────────────────────┤
│ Weekly Revenue            │
│ ▓▓  ▓ ▓▓▓▓ ▓▓ ▓▓▓▓▓ ▓▓▓│ ← CSS bar chart
│ Mo Tu We Th Fr Sa Su      │
├──────────────────────────┤
│ Payment Methods           │
│ 📱 UPI ████████░░  68%   │
│ 💵 Cash ████░░░░░░  32%  │
├──────────────────────────┤
│ 🔥 Trending Products     │
│ #1 🌾 Rice     ₹15.8K   │
│ #2 🫘 Dal      ₹4.9K    │
│ #3 🥛 Milk     ₹3.4K    │
└──────────────────────────┘
```

---

## 6. Reusable Component Design Principles

### Touch Target Sizing
- **Minimum 72px** for all interactive elements (WCAG AAA)
- `--btn-min-size: 72px` enforced via CSS variable

### Icon-First Navigation
- All navigation uses emoji icons as primary signifiers
- Labels are uppercase, tiny, and optional — the icon carries meaning
- Category chips show icon above label

### Voice as First-Class Citizen
- Global floating `VoiceFAB` on every page
- Full-screen `VoiceOverlay` with large pulsing ring
- Visual example hints (icon + text) for common commands

### High Contrast Mode (toggle)
- Pure black background
- White borders (0.4 opacity → 0.7 active)
- 3px border on interactive elements
- Activated via `body.high-contrast` CSS class

### Large Text Mode (toggle)
- Base font increases from 18px → 24px
- Icons scale proportionally
- Activated via `body.large-text` CSS class

### Gesture Support
- Camera viewport component with overlay
- Visual gesture guide (6 recognized gestures)
- Confidence badge display

### Store Map
- CSS Grid-based aisle layout
- Tap-to-highlight product location
- Blinking animation for found item
- Legend with entry/aisle/highlight markers
