import os
from datetime import datetime
import motor.motor_asyncio
import asyncio

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

async def seed_db():
    print("╔════════════════════════════════════════╗")
    print("║  Kiosk Vision – Database Seeder        ║")
    print("╚════════════════════════════════════════╝")

    client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
    
    # ── 1. Seed categories ──
    print("\n▸ [1/3] Seeding categories...")
    inventory_db = client["kiosk_inventory"]
    await inventory_db.categories.delete_many({})
    
    now = datetime.utcnow()
    categories = [
        {"_id": "grains", "name": "Grains and Cereals", "parent_id": None, "icon": "wheat", "sort_order": 1, "is_active": True, "created_at": now},
        {"_id": "pulses", "name": "Pulses and Lentils", "parent_id": None, "icon": "beans", "sort_order": 2, "is_active": True, "created_at": now},
        {"_id": "oils", "name": "Oils and Ghee", "parent_id": None, "icon": "oil", "sort_order": 3, "is_active": True, "created_at": now},
        {"_id": "dairy", "name": "Dairy", "parent_id": None, "icon": "milk", "sort_order": 4, "is_active": True, "created_at": now},
        {"_id": "bakery", "name": "Bakery", "parent_id": None, "icon": "bread", "sort_order": 5, "is_active": True, "created_at": now},
        {"_id": "beverages", "name": "Beverages", "parent_id": None, "icon": "tea", "sort_order": 6, "is_active": True, "created_at": now},
        {"_id": "snacks", "name": "Snacks", "parent_id": None, "icon": "cookie", "sort_order": 7, "is_active": True, "created_at": now},
        {"_id": "essentials", "name": "Kitchen Essentials", "parent_id": None, "icon": "salt", "sort_order": 8, "is_active": True, "created_at": now},
        {"_id": "personal_care", "name": "Personal Care", "parent_id": None, "icon": "lotion", "sort_order": 9, "is_active": True, "created_at": now},
        {"_id": "cleaning", "name": "Cleaning and Household", "parent_id": None, "icon": "broom", "sort_order": 10, "is_active": True, "created_at": now},
    ]
    await inventory_db.categories.insert_many(categories)
    print("  done: 10 categories")

    # ── 2. Seed products ──
    print("\n▸ [2/3] Seeding products...")
    await inventory_db.products.delete_many({})
    
    products = [
        {"_id": "p001", "name": "Basmati Rice (5kg)", "category": "grains", "brand": "India Gate", "price": 400.0, "selling_price": 350.0, "unit": "bag", "tax_rate": 5.0, "barcode": "8901234567890", "sku": "GRN-RICE-5K", "stock_quantity": 50, "min_stock_level": 10, "max_stock_level": 100, "is_available": True, "location": {"aisle": "1", "shelf": "A", "section": "left", "floor": 0}, "description": "Premium basmati rice 5kg pack", "tags": ["staple", "daily-essential"], "is_active": True, "created_at": now, "updated_at": now},
        {"_id": "p002", "name": "Wheat Flour Atta (1kg)", "category": "grains", "brand": "Aashirvaad", "price": 52.0, "selling_price": 45.0, "unit": "pack", "tax_rate": 5.0, "barcode": "8901234567891", "sku": "GRN-ATTA-1K", "stock_quantity": 100, "min_stock_level": 15, "max_stock_level": 150, "is_available": True, "location": {"aisle": "1", "shelf": "B", "section": "left", "floor": 0}, "description": "Whole wheat atta 1kg", "tags": ["staple"], "is_active": True, "created_at": now, "updated_at": now},
        {"_id": "p003", "name": "Sugar (1kg)", "category": "essentials", "brand": None, "price": 45.0, "selling_price": 42.0, "unit": "pack", "tax_rate": 5.0, "barcode": "8901234567892", "sku": "ESS-SUGR-1K", "stock_quantity": 80, "min_stock_level": 15, "max_stock_level": 120, "is_available": True, "location": {"aisle": "1", "shelf": "C", "section": "right", "floor": 0}, "description": "White sugar 1kg", "tags": ["staple", "daily-essential"], "is_active": True, "created_at": now, "updated_at": now},
        {"_id": "p004", "name": "Toor Dal (1kg)", "category": "pulses", "brand": "Tata Sampann", "price": 150.0, "selling_price": 130.0, "unit": "pack", "tax_rate": 5.0, "barcode": "8901234567893", "sku": "PLS-TOOR-1K", "stock_quantity": 60, "min_stock_level": 10, "max_stock_level": 80, "is_available": True, "location": {"aisle": "2", "shelf": "A", "section": "left", "floor": 0}, "description": "Toor dal 1kg", "tags": ["protein", "daily-essential"], "is_active": True, "created_at": now, "updated_at": now},
        {"_id": "p005", "name": "Sunflower Oil (1L)", "category": "oils", "brand": "Fortune", "price": 170.0, "selling_price": 150.0, "unit": "bottle", "tax_rate": 5.0, "barcode": "8901234567894", "sku": "OIL-SUNF-1L", "stock_quantity": 40, "min_stock_level": 8, "max_stock_level": 60, "is_available": True, "location": {"aisle": "2", "shelf": "B", "section": "center", "floor": 0}, "description": "Refined sunflower oil 1L", "tags": ["cooking", "daily-essential"], "is_active": True, "created_at": now, "updated_at": now},
        {"_id": "p006", "name": "Milk (500ml)", "category": "dairy", "brand": "Amul", "price": 30.0, "selling_price": 28.0, "unit": "pack", "tax_rate": 0.0, "barcode": "8901234567895", "sku": "DRY-MILK-500", "stock_quantity": 30, "min_stock_level": 10, "max_stock_level": 50, "is_available": True, "location": {"aisle": "3", "shelf": "A", "section": "left", "floor": 0}, "description": "Full cream milk 500ml", "tags": ["fresh", "daily-essential"], "is_active": True, "created_at": now, "updated_at": now},
        {"_id": "p007", "name": "White Bread", "category": "bakery", "brand": "Britannia", "price": 45.0, "selling_price": 40.0, "unit": "pack", "tax_rate": 0.0, "barcode": "8901234567896", "sku": "BKR-BREAD-WT", "stock_quantity": 25, "min_stock_level": 5, "max_stock_level": 40, "is_available": True, "location": {"aisle": "3", "shelf": "B", "section": "center", "floor": 0}, "description": "White bread sliced loaf", "tags": ["fresh", "breakfast"], "is_active": True, "created_at": now, "updated_at": now},
        {"_id": "p008", "name": "Premium Tea (250g)", "category": "beverages", "brand": "Tata", "price": 140.0, "selling_price": 120.0, "unit": "pack", "tax_rate": 5.0, "barcode": "8901234567897", "sku": "BEV-TEA-250", "stock_quantity": 45, "min_stock_level": 10, "max_stock_level": 70, "is_available": True, "location": {"aisle": "4", "shelf": "A", "section": "left", "floor": 0}, "description": "Premium tea leaves 250g", "tags": ["beverage", "daily-essential"], "is_active": True, "created_at": now, "updated_at": now},
        {"_id": "p009", "name": "Bathing Soap Bar", "category": "personal_care", "brand": "Dove", "price": 50.0, "selling_price": 45.0, "unit": "piece", "tax_rate": 18.0, "barcode": "8901234567898", "sku": "PC-SOAP-DV", "stock_quantity": 70, "min_stock_level": 15, "max_stock_level": 100, "is_available": True, "location": {"aisle": "5", "shelf": "A", "section": "center", "floor": 0}, "description": "Moisturizing soap bar 100g", "tags": ["body-care"], "is_active": True, "created_at": now, "updated_at": now},
        {"_id": "p010", "name": "Toothpaste (100g)", "category": "personal_care", "brand": "Colgate", "price": 60.0, "selling_price": 55.0, "unit": "tube", "tax_rate": 18.0, "barcode": "8901234567899", "sku": "PC-TPSTE-CG", "stock_quantity": 55, "min_stock_level": 10, "max_stock_level": 80, "is_available": True, "location": {"aisle": "5", "shelf": "B", "section": "left", "floor": 0}, "description": "Fluoride toothpaste 100g", "tags": ["oral-care"], "is_active": True, "created_at": now, "updated_at": now},
        {"_id": "p011", "name": "Iodized Salt (1kg)", "category": "essentials", "brand": "Tata", "price": 22.0, "selling_price": 20.0, "unit": "pack", "tax_rate": 0.0, "barcode": "8901234567900", "sku": "ESS-SALT-1K", "stock_quantity": 90, "min_stock_level": 20, "max_stock_level": 150, "is_available": True, "location": {"aisle": "1", "shelf": "D", "section": "right", "floor": 0}, "description": "Iodized salt 1kg", "tags": ["staple", "daily-essential"], "is_active": True, "created_at": now, "updated_at": now},
        {"_id": "p012", "name": "Cream Biscuits", "category": "snacks", "brand": "Britannia", "price": 35.0, "selling_price": 30.0, "unit": "pack", "tax_rate": 12.0, "barcode": "8901234567901", "sku": "SNK-BISC-CR", "stock_quantity": 65, "min_stock_level": 10, "max_stock_level": 100, "is_available": True, "location": {"aisle": "4", "shelf": "B", "section": "center", "floor": 0}, "description": "Cream filled biscuits pack", "tags": ["snack", "kids"], "is_active": True, "created_at": now, "updated_at": now},
    ]
    await inventory_db.products.insert_many(products)
    print("  done: 12 products")

    # ── 3. Seed users ──
    print("\n▸ [3/3] Seeding users...")
    auth_db = client["kiosk_auth"]
    await auth_db.users.delete_many({})
    users = [
        {
            "_id": "u-owner-01", "name": "Shop Owner", "phone": "9999900000", "pin": "0000",
            "role": "owner", "reward_points": 0, "lifetime_points": 0, "tier": "platinum",
            "accessibility_preferences": { "high_contrast": False, "large_text": False, "voice_enabled": True, "gesture_enabled": True, "language": "en", "tts_speed": 1.0, "font_scale": 1.0 },
            "employee_id": "EMP001", "shift": None, "is_active": True,
            "device_ids": [], "created_at": now, "updated_at": now
        },
        {
            "_id": "u-supervisor-01", "name": "Shop Supervisor", "phone": "9999900001", "pin": "1234",
            "role": "supervisor", "reward_points": 0, "lifetime_points": 0, "tier": "gold",
            "accessibility_preferences": { "high_contrast": False, "large_text": False, "voice_enabled": True, "gesture_enabled": True, "language": "en", "tts_speed": 1.0, "font_scale": 1.0 },
            "employee_id": "EMP002", "shift": "morning", "is_active": True,
            "device_ids": [], "created_at": now, "updated_at": now
        },
        {
            "_id": "u-customer-01", "name": "Demo Customer", "phone": "9876543210", "pin": "5678",
            "role": "daily_customer", "reward_points": 250, "lifetime_points": 1450, "tier": "silver",
            "accessibility_preferences": { "high_contrast": False, "large_text": True, "voice_enabled": True, "gesture_enabled": False, "language": "en", "tts_speed": 0.8, "font_scale": 1.5 },
            "employee_id": None, "shift": None, "is_active": True,
            "device_ids": [], "created_at": datetime(2026, 1, 15), "updated_at": now
        }
    ]
    await auth_db.users.insert_many(users)
    print("  done: 3 users (owner, supervisor, customer)")

    # ── Create text indexes for search ──
    print("\n▸ Creating text indexes...")
    await inventory_db.products.create_index([("name", "text"), ("category", "text"), ("description", "text")])
    print("  done: text index on products")

    print("\n╔════════════════════════════════════════╗")
    print("║  Database seeding complete!            ║")
    print("╚════════════════════════════════════════╝\n")
    print("Login credentials:")
    print("  Owner:      phone=9999900000 pin=0000")
    print("  Supervisor: phone=9999900001 pin=1234")
    print("  Customer:   phone=9876543210 pin=5678")

if __name__ == "__main__":
    asyncio.run(seed_db())
