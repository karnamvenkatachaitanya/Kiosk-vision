# ═══════════════════════════════════════
# Kiosk Vision – Database Seeder (Windows/PowerShell)
# Seeds categories, products, users into local MongoDB
# ═══════════════════════════════════════

Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Kiosk Vision – Database Seeder        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan

$MONGO_URI = if ($env:MONGO_URI) { $env:MONGO_URI } else { "mongodb://localhost:27017" }

# ── 1. Seed categories ──
Write-Host ""
Write-Host "▸ [1/3] Seeding categories..." -ForegroundColor Yellow

mongosh "$MONGO_URI" --quiet --eval '
db = db.getSiblingDB("kiosk_inventory");
db.categories.deleteMany({});
db.categories.insertMany([
  { _id: "grains",        name: "Grains & Cereals",    parent_id: null, icon: "wheat",    sort_order: 1, is_active: true, created_at: new Date() },
  { _id: "pulses",        name: "Pulses & Lentils",    parent_id: null, icon: "beans",    sort_order: 2, is_active: true, created_at: new Date() },
  { _id: "oils",          name: "Oils & Ghee",          parent_id: null, icon: "oil",      sort_order: 3, is_active: true, created_at: new Date() },
  { _id: "dairy",         name: "Dairy",                parent_id: null, icon: "milk",     sort_order: 4, is_active: true, created_at: new Date() },
  { _id: "bakery",        name: "Bakery",               parent_id: null, icon: "bread",    sort_order: 5, is_active: true, created_at: new Date() },
  { _id: "beverages",     name: "Beverages",            parent_id: null, icon: "tea",      sort_order: 6, is_active: true, created_at: new Date() },
  { _id: "snacks",        name: "Snacks",               parent_id: null, icon: "cookie",   sort_order: 7, is_active: true, created_at: new Date() },
  { _id: "essentials",    name: "Kitchen Essentials",    parent_id: null, icon: "salt",     sort_order: 8, is_active: true, created_at: new Date() },
  { _id: "personal_care", name: "Personal Care",        parent_id: null, icon: "lotion",   sort_order: 9, is_active: true, created_at: new Date() },
  { _id: "cleaning",      name: "Cleaning & Household", parent_id: null, icon: "broom",    sort_order: 10, is_active: true, created_at: new Date() },
]);
print("  done: 10 categories");
'

Write-Host "  ✓ Categories seeded" -ForegroundColor Green

# ── 2. Seed products ──
Write-Host ""
Write-Host "▸ [2/3] Seeding products..." -ForegroundColor Yellow

mongosh "$MONGO_URI" --quiet --eval '
db = db.getSiblingDB("kiosk_inventory");
db.products.deleteMany({});
db.products.insertMany([
  { _id: "p001", name: "Basmati Rice (5kg)", category: "grains", brand: "India Gate", price: 400, selling_price: 350, unit: "bag", tax_rate: 5, barcode: "8901234567890", sku: "GRN-RICE-5K", stock_quantity: 50, min_stock_level: 10, max_stock_level: 100, is_available: true, location: { aisle: "1", shelf: "A", section: "left", floor: 0 }, description: "Premium basmati rice 5kg pack", tags: ["staple", "daily-essential"], is_active: true, created_at: new Date(), updated_at: new Date() },
  { _id: "p002", name: "Wheat Flour Atta (1kg)", category: "grains", brand: "Aashirvaad", price: 52, selling_price: 45, unit: "pack", tax_rate: 5, barcode: "8901234567891", sku: "GRN-ATTA-1K", stock_quantity: 100, min_stock_level: 15, max_stock_level: 150, is_available: true, location: { aisle: "1", shelf: "B", section: "left", floor: 0 }, description: "Whole wheat atta 1kg", tags: ["staple"], is_active: true, created_at: new Date(), updated_at: new Date() },
  { _id: "p003", name: "Sugar (1kg)", category: "essentials", brand: null, price: 45, selling_price: 42, unit: "pack", tax_rate: 5, barcode: "8901234567892", sku: "ESS-SUGR-1K", stock_quantity: 80, min_stock_level: 15, max_stock_level: 120, is_available: true, location: { aisle: "1", shelf: "C", section: "right", floor: 0 }, description: "White sugar 1kg", tags: ["staple", "daily-essential"], is_active: true, created_at: new Date(), updated_at: new Date() },
  { _id: "p004", name: "Toor Dal (1kg)", category: "pulses", brand: "Tata Sampann", price: 150, selling_price: 130, unit: "pack", tax_rate: 5, barcode: "8901234567893", sku: "PLS-TOOR-1K", stock_quantity: 60, min_stock_level: 10, max_stock_level: 80, is_available: true, location: { aisle: "2", shelf: "A", section: "left", floor: 0 }, description: "Toor dal 1kg", tags: ["protein", "daily-essential"], is_active: true, created_at: new Date(), updated_at: new Date() },
  { _id: "p005", name: "Sunflower Oil (1L)", category: "oils", brand: "Fortune", price: 170, selling_price: 150, unit: "bottle", tax_rate: 5, barcode: "8901234567894", sku: "OIL-SUNF-1L", stock_quantity: 40, min_stock_level: 8, max_stock_level: 60, is_available: true, location: { aisle: "2", shelf: "B", section: "center", floor: 0 }, description: "Refined sunflower oil 1L", tags: ["cooking", "daily-essential"], is_active: true, created_at: new Date(), updated_at: new Date() },
  { _id: "p006", name: "Milk (500ml)", category: "dairy", brand: "Amul", price: 30, selling_price: 28, unit: "pack", tax_rate: 0, barcode: "8901234567895", sku: "DRY-MILK-500", stock_quantity: 30, min_stock_level: 10, max_stock_level: 50, is_available: true, location: { aisle: "3", shelf: "A", section: "left", floor: 0 }, description: "Full cream milk 500ml", tags: ["fresh", "daily-essential"], is_active: true, created_at: new Date(), updated_at: new Date() },
  { _id: "p007", name: "White Bread", category: "bakery", brand: "Britannia", price: 45, selling_price: 40, unit: "pack", tax_rate: 0, barcode: "8901234567896", sku: "BKR-BREAD-WT", stock_quantity: 25, min_stock_level: 5, max_stock_level: 40, is_available: true, location: { aisle: "3", shelf: "B", section: "center", floor: 0 }, description: "White bread sliced loaf", tags: ["fresh", "breakfast"], is_active: true, created_at: new Date(), updated_at: new Date() },
  { _id: "p008", name: "Premium Tea (250g)", category: "beverages", brand: "Tata", price: 140, selling_price: 120, unit: "pack", tax_rate: 5, barcode: "8901234567897", sku: "BEV-TEA-250", stock_quantity: 45, min_stock_level: 10, max_stock_level: 70, is_available: true, location: { aisle: "4", shelf: "A", section: "left", floor: 0 }, description: "Premium tea leaves 250g", tags: ["beverage", "daily-essential"], is_active: true, created_at: new Date(), updated_at: new Date() },
  { _id: "p009", name: "Bathing Soap Bar", category: "personal_care", brand: "Dove", price: 50, selling_price: 45, unit: "piece", tax_rate: 18, barcode: "8901234567898", sku: "PC-SOAP-DV", stock_quantity: 70, min_stock_level: 15, max_stock_level: 100, is_available: true, location: { aisle: "5", shelf: "A", section: "center", floor: 0 }, description: "Moisturizing soap bar 100g", tags: ["body-care"], is_active: true, created_at: new Date(), updated_at: new Date() },
  { _id: "p010", name: "Toothpaste (100g)", category: "personal_care", brand: "Colgate", price: 60, selling_price: 55, unit: "tube", tax_rate: 18, barcode: "8901234567899", sku: "PC-TPSTE-CG", stock_quantity: 55, min_stock_level: 10, max_stock_level: 80, is_available: true, location: { aisle: "5", shelf: "B", section: "left", floor: 0 }, description: "Fluoride toothpaste 100g", tags: ["oral-care"], is_active: true, created_at: new Date(), updated_at: new Date() },
  { _id: "p011", name: "Iodized Salt (1kg)", category: "essentials", brand: "Tata", price: 22, selling_price: 20, unit: "pack", tax_rate: 0, barcode: "8901234567900", sku: "ESS-SALT-1K", stock_quantity: 90, min_stock_level: 20, max_stock_level: 150, is_available: true, location: { aisle: "1", shelf: "D", section: "right", floor: 0 }, description: "Iodized salt 1kg", tags: ["staple", "daily-essential"], is_active: true, created_at: new Date(), updated_at: new Date() },
  { _id: "p012", name: "Cream Biscuits", category: "snacks", brand: "Britannia", price: 35, selling_price: 30, unit: "pack", tax_rate: 12, barcode: "8901234567901", sku: "SNK-BISC-CR", stock_quantity: 65, min_stock_level: 10, max_stock_level: 100, is_available: true, location: { aisle: "4", shelf: "B", section: "center", floor: 0 }, description: "Cream filled biscuits pack", tags: ["snack", "kids"], is_active: true, created_at: new Date(), updated_at: new Date() },
]);
print("  done: 12 products");
'

Write-Host "  ✓ Products seeded" -ForegroundColor Green

# ── 3. Seed users ──
Write-Host ""
Write-Host "▸ [3/3] Seeding users..." -ForegroundColor Yellow

mongosh "$MONGO_URI" --quiet --eval '
db = db.getSiblingDB("kiosk_auth");
db.users.deleteMany({});
db.users.insertMany([
  {
    _id: "u-owner-01", name: "Shop Owner", phone: "9999900000", pin: "0000",
    role: "owner", reward_points: 0, lifetime_points: 0, tier: "platinum",
    accessibility_preferences: { high_contrast: false, large_text: false, voice_enabled: true, gesture_enabled: true, language: "en", tts_speed: 1.0, font_scale: 1.0 },
    employee_id: "EMP001", shift: null, is_active: true,
    device_ids: [], created_at: new Date(), updated_at: new Date()
  },
  {
    _id: "u-supervisor-01", name: "Shop Supervisor", phone: "9999900001", pin: "1234",
    role: "supervisor", reward_points: 0, lifetime_points: 0, tier: "gold",
    accessibility_preferences: { high_contrast: false, large_text: false, voice_enabled: true, gesture_enabled: true, language: "en", tts_speed: 1.0, font_scale: 1.0 },
    employee_id: "EMP002", shift: "morning", is_active: true,
    device_ids: [], created_at: new Date(), updated_at: new Date()
  },
  {
    _id: "u-customer-01", name: "Demo Customer", phone: "9876543210", pin: "5678",
    role: "daily_customer", reward_points: 250, lifetime_points: 1450, tier: "silver",
    accessibility_preferences: { high_contrast: false, large_text: true, voice_enabled: true, gesture_enabled: false, language: "en", tts_speed: 0.8, font_scale: 1.5 },
    employee_id: null, shift: null, is_active: true,
    device_ids: [], created_at: new Date("2026-01-15"), updated_at: new Date()
  }
]);
print("  done: 3 users");
'

Write-Host "  ✓ Users seeded" -ForegroundColor Green

Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ Database seeding complete!         ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Login credentials:" -ForegroundColor Cyan
Write-Host "  Owner:      phone=9999900000 pin=0000"
Write-Host "  Supervisor: phone=9999900001 pin=1234"
Write-Host "  Customer:   phone=9876543210 pin=5678"
Write-Host ""
