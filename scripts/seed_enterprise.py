import os
import asyncio
import random
import uuid
import string
from datetime import datetime, timedelta
import motor.motor_asyncio

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

# ── Helpers ──
def get_random_date(days_ago=180):
    start = datetime.utcnow() - timedelta(days=days_ago)
    return start + timedelta(seconds=random.randint(0, days_ago * 86400))

def random_string(length=8):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

def random_name():
    firsts = ["Rahul", "Priya", "Amit", "Sneha", "Vikram", "Neha", "Rohan", "Anjali", "Karan", "Pooja", "Arjun", "Kavya"]
    lasts = ["Sharma", "Patel", "Singh", "Reddy", "Kumar", "Gupta", "Das", "Rao", "Jain", "Bose", "Nair", "Iyer"]
    return f"{random.choice(firsts)} {random.choice(lasts)}"

async def seed_enterprise():
    print("╔═════════════════════════════════════════════════════════════╗")
    print("║  Kiosk Vision – Enterprise Database Seeder (Stress Test)    ║")
    print("╚═════════════════════════════════════════════════════════════╝")
    print("Connecting to MongoDB:", MONGO_URI)
    
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
    now = datetime.utcnow()

    # Database handles
    db_auth = client["kiosk_auth"]
    db_inv = client["kiosk_inventory"]
    db_ord = client["kiosk_orders"]
    db_pay = client["kiosk_payment"]
    db_crm = client["kiosk_crm"]
    db_ai = client["kiosk_ai"]

    # ─────────────────────────────────────────────────────────────
    # 1. Clear All Databases (WIPE)
    # ─────────────────────────────────────────────────────────────
    print("\n[1/7] Wiping existing data & indexes...")
    for db in [db_auth, db_inv, db_ord, db_pay, db_crm, db_ai]:
        collections = await db.list_collection_names()
        for coll in collections:
            await db[coll].drop()
    print("      ✓ Cleaned all collections and indexes.")

    # ─────────────────────────────────────────────────────────────
    # 2. SEED AUTH & STAFF MANAGEMENT (50+ Users)
    # ─────────────────────────────────────────────────────────────
    print("\n[2/7] Seeding Users & Staff...")
    users = []
    
    # 1 Owner
    owner_id = "u-owner-001"
    users.append({
        "_id": owner_id, "name": "Admin Owner", "email": "owner@kioskvision.com", "phone": "9999900000", "pin": "0000",
        "role": "owner", "reward_points": 0, "lifetime_points": 0, "tier": "platinum",
        "date_of_birth": (now - timedelta(days=40*365)).strftime("%Y-%m-%d"), "marketing_opt_in": True,
        "accessibility_preferences": { "high_contrast": False, "large_text": False, "voice_enabled": True, "gesture_enabled": True, "language": "en", "tts_speed": 1.0, "font_scale": 1.0 },
        "employee_id": "OWNER", "shift": None, "is_active": True, "device_ids": [],
        "addresses": [{"address_id": "addr-001", "type": "store", "line1": "123 Main Street", "city": "Hyderabad", "zip": "500001", "is_default": True}],
        "created_at": get_random_date(180), "updated_at": now
    })

    # 5 Supervisors
    supervisors = []
    for i in range(1, 6):
        sid = f"u-sup-00{i}"
        supervisors.append(sid)
        name = f"{random_name()} (Supervisor)"
        users.append({
            "_id": sid, "name": name, "email": f"sup_{i}@kioskvision.com", "phone": f"999991000{i}", "pin": "1234",
            "role": "supervisor", "reward_points": 0, "lifetime_points": 0, "tier": "gold",
            "date_of_birth": (now - timedelta(days=random.randint(25*365, 50*365))).strftime("%Y-%m-%d"), "marketing_opt_in": True,
            "accessibility_preferences": { "high_contrast": False, "large_text": False, "voice_enabled": True, "gesture_enabled": True, "language": "en", "tts_speed": 1.0, "font_scale": 1.0 },
            "employee_id": f"EMP{100+i}", "shift": random.choice(["morning", "evening", "night"]),
            "is_active": True, "device_ids": [], 
            "addresses": [{"address_id": f"addr-{sid}", "type": "home", "line1": f"{random.randint(10, 99)} Park Avenue", "city": "Hyderabad", "zip": "500002", "is_default": True}],
            "created_at": get_random_date(180), "updated_at": now
        })

    # 100 Customers
    customers = []
    for i in range(1, 101):
        cid = f"u-cust-{i:03d}"
        customers.append(cid)
        lifepoints = random.randint(0, 5000)
        tier = "platinum" if lifepoints > 4000 else "gold" if lifepoints > 2000 else "silver" if lifepoints > 500 else "bronze"
        name = random_name()
        
        users.append({
            "_id": cid, "name": name, "email": f"{name.replace(' ', '.').lower()}@example.com", "phone": f"98765{i:05d}", "pin": "5678" if i==1 else f"{random.randint(1000, 9999)}",
            "role": "daily_customer", "reward_points": int(lifepoints * 0.1), "lifetime_points": lifepoints, "tier": tier,
            "date_of_birth": (now - timedelta(days=random.randint(18*365, 65*365))).strftime("%Y-%m-%d"), "marketing_opt_in": random.choice([True, False, True]),
            "accessibility_preferences": { "high_contrast": random.choice([True, False]), "large_text": random.choice([True, False]), "voice_enabled": True, "gesture_enabled": False, "language": "en", "tts_speed": 1.0, "font_scale": 1.0 },
            "employee_id": None, "shift": None, "is_active": True, "device_ids": [],
            "addresses": [
                {"address_id": f"addr-h-{cid}", "type": "home", "line1": f"{random.randint(1, 999)} Metro Station Road", "city": "Hyderabad", "zip": f"5000{random.randint(10, 99)}", "is_default": True},
                {"address_id": f"addr-w-{cid}", "type": "work", "line1": f"Tech Park Block {random.choice('ABCD')}", "city": "Hyderabad", "zip": f"5000{random.randint(10, 99)}", "is_default": False}
            ] if random.random() > 0.3 else [], # 70% users have addresses mapped
            "created_at": get_random_date(180), "updated_at": now
        })

    await db_auth.users.insert_many(users)
    print(f"      ✓ Inserted 1 Owner, 5 Supervisors, 100 Customers")

    # Staff Management records
    staff_records = [{"_id": sid, "user_id": sid, "department": "Store Front", "shift": u["shift"], "status": "active", "last_login": get_random_date(2), "total_sales_handled": random.randint(100, 5000)} for sid, u in zip(supervisors, users[1:6])]
    await db_auth.staff_management.insert_many(staff_records)
    print(f"      ✓ Provisioned {len(staff_records)} staff metrics")

    # ─────────────────────────────────────────────────────────────
    # 3. SEED INVENTORY & ALERTS (Categories + 150 Products)
    # ─────────────────────────────────────────────────────────────
    print("\n[3/7] Seeding Inventory & Catalog...")
    cats = [
        {"_id": "grains", "name": "Grains & Cereals", "icon": "wheat", "sort_order": 1, "created_at": now},
        {"_id": "dairy", "name": "Dairy & Eggs", "icon": "milk", "sort_order": 2, "created_at": now},
        {"_id": "snacks", "name": "Snacks & Munchies", "icon": "cookie", "sort_order": 3, "created_at": now},
        {"_id": "beverages", "name": "Beverages", "icon": "tea", "sort_order": 4, "created_at": now},
        {"_id": "personal_care", "name": "Personal Care", "icon": "lotion", "sort_order": 5, "created_at": now},
    ]
    await db_inv.categories.insert_many(cats)

    products = []
    
    # ── SPECIFIC REQUESTED SUPABASE DATA ──
    specific_items = [
        {"product_type": "snacks", "product_name": "Biscuits", "brand_name": "Sunfeast", "product_image_url": "https://gsnimtsvuqhqlorgnhyo.supabase.co/storage/v1/object/public/images/sunfeast.jpg", "price": 30.0, "stock": 42, "details": "Crunchy tea-time pack", "tags": ['biscuit','biscuits','cookie','cookies','బిస్కెట్']},
        {"product_type": "snacks", "product_name": "Chips", "brand_name": "Lays", "product_image_url": "https://gsnimtsvuqhqlorgnhyo.supabase.co/storage/v1/object/public/images/lays.jpg", "price": 20.0, "stock": 64, "details": "Salted potato chips", "tags": ['chips','crisps','చిప్స్']},
        {"product_type": "beverages", "product_name": "Soda", "brand_name": "Sprite", "product_image_url": "https://gsnimtsvuqhqlorgnhyo.supabase.co/storage/v1/object/public/images/sprite.jpg", "price": 40.0, "stock": 31, "details": "Chilled soft drink", "tags": ['soda','cool drink','soft drink','సోడా']},
        {"product_type": "beverages", "product_name": "Water", "brand_name": "Kinley", "product_image_url": "https://gsnimtsvuqhqlorgnhyo.supabase.co/storage/v1/object/public/images/kinley.jpg", "price": 20.0, "stock": 110, "details": "1L mineral water", "tags": ['water','నీళ్లు','paani']},
        {"product_type": "snacks", "product_name": "Candy", "brand_name": "Alpenliebe", "product_image_url": "https://gsnimtsvuqhqlorgnhyo.supabase.co/storage/v1/object/public/images/alpenliebe.jpg", "price": 10.0, "stock": 150, "details": "Fruit candy assortment", "tags": ['candy','toffee','టాఫీ']},
        {"product_type": "snacks", "product_name": "Chocolate", "brand_name": "Dairy Milk", "product_image_url": "https://gsnimtsvuqhqlorgnhyo.supabase.co/storage/v1/object/public/images/dairy-milk.jpg", "price": 50.0, "stock": 55, "details": "Milk chocolate bar", "tags": ['chocolate','చాక్లెట్']},
        {"product_type": "grains", "product_name": "Noodles", "brand_name": "Maggi", "product_image_url": "https://gsnimtsvuqhqlorgnhyo.supabase.co/storage/v1/object/public/images/maggi.jpg", "price": 35.0, "stock": 27, "details": "Instant masala noodles", "tags": ['noodles','maggi','నూడుల్స్']},
        {"product_type": "grains", "product_name": "Rice", "brand_name": "Sona Masuri", "product_image_url": "https://gsnimtsvuqhqlorgnhyo.supabase.co/storage/v1/object/public/images/sona-masuri.jpg", "price": 70.0, "stock": 90, "details": "Premium rice 1kg", "tags": ['rice','బియ్యం','chawal']}
    ]

    for idx, item in enumerate(specific_items):
        pid = f"p-sup-{idx:03d}"
        products.append({
            "_id": pid, "name": item["product_name"], "category": item["product_type"], "brand": item["brand_name"],
            "price": item["price"] * 1.05, "selling_price": float(item["price"]), "unit": "pack", "tax_rate": 5.0,
            "barcode": f"8902{random.randint(100000000, 999999999)}", "sku": f"SKU-{item['product_name'][:3].upper()}-{idx:03d}",
            "stock_quantity": item["stock"], "min_stock_level": 15, "max_stock_level": 200, "is_available": True,
            "location": {"aisle": "1", "shelf": "A", "section": "center", "floor": 0},
            "description": item["details"], "tags": item["tags"], "is_active": True,
            "product_image": item["product_image_url"], "product_image_url": item["product_image_url"],
            "created_at": get_random_date(360), "updated_at": now
        })

    brands = ["Tata", "Britannia", "Nestle", "Amul", "ITC", "Dabur", "Kellogg's", "Patanjali", "Parle", "Haldiram's", "Everest", "MDH", "Lipton"]
    adjectives = ["Premium", "Organic", "Fresh", "Classic", "Deluxe", "Economy", "Natural", "Spicy", "Homemade", "Farm Fresh", "Healthy"]
    item_types = {
        "grains": ["Rice", "Wheat Flour", "Oats", "Millet", "Quinoa", "Lentils", "Dal", "Chana", "Poha", "Dalia"],
        "dairy": ["Milk", "Cheese", "Butter", "Yogurt", "Paneer", "Ghee", "Cream", "Buttermilk"],
        "snacks": ["Chips", "Biscuits", "Namkeen", "Nuts", "Popcorn", "Chocolate", "Wafers", "Bhujia", "Murukku"],
        "beverages": ["Tea", "Coffee", "Juice", "Soda", "Energy Drink", "Water", "Syrup", "Green Tea", "Cola"],
        "personal_care": ["Soap", "Shampoo", "Toothpaste", "Lotion", "Deodorant", "Face Wash", "Sanitizer", "Hair Oil"]
    }
    
    product_ids = []
    alerts = []

    for c in cats:
        cat_id = c["_id"]
        for i in range(30):  # 30 items per category = 150 total
            pid = f"p-{cat_id}-{i:03d}"
            product_ids.append(pid)
            
            brand_name = random.choice(brands)
            base_type = random.choice(item_types[cat_id])
            adj = random.choice(adjectives)
            unit_size = random.choice(['1kg', '500g', '2L', 'Pack', '250g', '100g'])
            name = f"{brand_name} {adj} {base_type} ({unit_size})"
            
            stock = random.randint(2, 200)
            base_price = random.randint(20, 800)
            
            # Form clean strings for placeholders, e.g. "Tata Snacks"
            img_text = f"{brand_name}+{base_type}".replace(' ', '+')
            hex_color = "1E2A42" if i % 2 == 0 else "0F172A"
            image_url = f"https://placehold.co/400x400/{hex_color}/FFFFFF?text={img_text}"
            
            products.append({
                "_id": pid, "name": name, "category": cat_id, "brand": brand_name,
                "price": base_price + (base_price * 0.1), "selling_price": float(base_price),
                "unit": "pack", "tax_rate": random.choice([0.0, 5.0, 12.0, 18.0]),
                "barcode": f"8901{random.randint(100000000, 999999999)}",
                "sku": f"SKU-{cat_id[:3].upper()}-{i:03d}",
                "stock_quantity": stock, "min_stock_level": 15, "max_stock_level": 200,
                "is_available": stock > 0,
                "location": {"aisle": str(random.randint(1, 10)), "shelf": random.choice(["A", "B", "C", "D"]), "section": random.choice(["left", "center", "right"]), "floor": 0},
                "description": f"Experience the finest {adj.lower()} {base_type.lower()} exclusively selected for our daily kiosk shoppers. 100% assured quality.",
                "tags": [cat_id, base_type.lower(), adj.lower(), "staple", random.choice(["new", "bestseller", "sale", "trending"])],
                "is_active": True, 
                "product_image": image_url,
                "product_image_url": image_url,
                "created_at": get_random_date(360), "updated_at": now
            })

            # Check low stock alerts
            if stock < 15:
                alerts.append({
                    "_id": str(uuid.uuid4()), "type": "low_stock", "product_id": pid, "product_name": name,
                    "message": f"Stock level critically low ({stock} left).", "status": "unread", "created_at": get_random_date(1)
                })

    await db_inv.products.insert_many(products)
    if alerts:
        await db_inv.alerts.insert_many(alerts)
    print(f"      ✓ Inserted 5 Categories, 150 Products, {len(alerts)} Inventory Alerts")

    # Text Index
    await db_inv.products.create_index([("name", "text"), ("category", "text"), ("description", "text"), ("brand", "text")])

    # ─────────────────────────────────────────────────────────────
    # 4. SEED ORDERS, BILLING, PAYMENTS & CRM ANALYTICS (180 Days)
    # ─────────────────────────────────────────────────────────────
    print("\n[4/7] Generating Historical Transaction Fabric (180 Days)...")
    
    orders = []
    billings = []
    transactions = []
    crm_history = []
    notifications = []
    
    # Track metrics per day for Analytics
    daily_stats = {}

    start_date = datetime.utcnow() - timedelta(days=180)
    
    for day_offset in range(180):
        current_date = start_date + timedelta(days=day_offset)
        date_str = current_date.strftime("%Y-%m-%d")
        
        daily_sales = 0.0
        daily_orders = random.randint(5, 45) # 5 to 45 orders a day
        new_cust_today = 0
        ret_cust_today = 0
        
        for _ in range(daily_orders):
            oid = f"ORD-{current_date.strftime('%Y%m%d')}-{random_string(6)}"
            cid = random.choice(customers)
            
            # 80% returning, 20% new logic mock
            if random.random() > 0.8: new_cust_today += 1
            else: ret_cust_today += 1

            # Pick 1 to 8 random items
            order_items = []
            subtotal = 0.0
            tax_total = 0.0
            
            for _ in range(random.randint(1, 8)):
                p = random.choice(products)
                qty = random.randint(1, 3)
                line_total = p["selling_price"] * qty
                line_tax = line_total * (p["tax_rate"] / 100.0)
                
                order_items.append({
                    "product_id": p["_id"],
                    "product_name": p["name"],
                    "quantity": qty,
                    "unit_price": p["selling_price"],
                    "tax_rate": p["tax_rate"],
                    "tax_amount": line_tax,
                    "total_price": line_total
                })
                subtotal += line_total
                tax_total += line_tax
                
            discount = float(random.choice([0, 0, 0, subtotal * 0.05, subtotal * 0.1])) 
            grand_total = subtotal + tax_total - discount
            daily_sales += grand_total
            
            order_time = current_date + timedelta(hours=random.randint(8, 21), minutes=random.randint(0, 59))
            
            # 1. ORDRER
            orders.append({
                "_id": oid, "user_id": cid, "order_status": "completed", "payment_status": "paid",
                "items": order_items, "subtotal": subtotal, "tax_total": tax_total,
                "discount_total": discount, "grand_total": grand_total,
                "delivery_type": random.choice(["pickup", "pickup", "home_delivery"]),
                "notes": "", "created_at": order_time, "updated_at": order_time
            })
            
            # 2. BILLING INVOICE
            billings.append({
                "_id": f"INV-{oid}", "order_id": oid, "invoice_number": f"INV-{random_string(8)}",
                "tax_breakdown": {"GST": tax_total}, "issued_at": order_time
            })
            
            # 3. PAYMENT TRANSACTION
            method = random.choices(["upi", "cash", "card"], weights=[0.7, 0.2, 0.1])[0]
            status = random.choices(["success", "failed"], weights=[0.95, 0.05])[0]
            transactions.append({
                "_id": f"TXN-{oid}", "order_id": oid, "user_id": cid,
                "amount": grand_total, "currency": "INR", "payment_method": method,
                "status": status, "reference_id": f"REF{random.randint(1000000, 9999999)}",
                "created_at": order_time
            })
            
            # 4. CRM LEDGER (Points)
            if status == "success":
                points = int(grand_total * 0.1)
                crm_history.append({
                    "_id": str(uuid.uuid4()), "user_id": cid, "order_id": oid,
                    "points_earned": points, "points_redeemed": 0, "balance_after": points,
                    "created_at": order_time
                })
                
                # Random CRM push notification
                if random.random() > 0.95:
                    notifications.append({
                        "_id": str(uuid.uuid4()), "user_id": cid, "title": "Bonus Points Awarded! 🎉",
                        "message": f"You just earned {points} bonus points on your last order.",
                        "type": "promo", "is_read": random.choice([True, False]), "created_at": order_time
                    })

        # Daily Stats Aggregation
        daily_stats[date_str] = {
            "_id": date_str, "date": date_str, "total_sales": daily_sales,
            "total_orders": daily_orders, "new_customers": new_cust_today,
            "returning_customers": ret_cust_today
        }

    await db_ord.orders.insert_many(orders)
    await db_ord.billing.insert_many(billings)
    await db_pay.transactions.insert_many(transactions)
    await db_crm.customer_history.insert_many(crm_history)
    await db_crm.notifications.insert_many(notifications)
    
    # Insert Analytics
    analytics_list = list(daily_stats.values())
    await db_crm.analytics.insert_many(analytics_list)
    
    print(f"      ✓ Mined {len(orders)} Orders, Billing blocks, and Transactions.")
    print(f"      ✓ Generated {len(analytics_list)} Daily Analytic nodes and {len(crm_history)} CRM Ledgers.")

    # ─────────────────────────────────────────────────────────────
    # 5. SEED AI OCR LOGS & INTELLIGENCE DATA
    # ─────────────────────────────────────────────────────────────
    print("\n[5/7] Sourcing Mock AI Intelligence (OCR Logs)...")
    ai_logs = []
    fake_texts = [
        "2 kg sugar, 1 pack milk, tata salt",
        "atta 5kg, basmati rice brand india gate, oil",
        "3 packets cream biscuits, soap dove, toothpaste",
        "toor dal 1kg, snacks, green tea"
    ]
    for _ in range(50):
        t = get_random_date(30)
        raw_text = random.choice(fake_texts)
        ai_logs.append({
            "_id": str(uuid.uuid4()), "image_type": "handwritten_list",
            "ocr_text": raw_text, "entities_extracted": [{"product_name": "mock", "quantity": 1}],
            "confidence_score": round(random.uniform(0.7, 0.99), 2),
            "processing_time_ms": random.randint(300, 1200),
            "created_at": t
        })
    await db_ai.ocr_logs.insert_many(ai_logs)
    print("      ✓ Created 50 Historic AI OCR processing nodes.")

    # ─────────────────────────────────────────────────────────────
    # 6. ACTIVE CARTS (In-progress Sessions)
    # ─────────────────────────────────────────────────────────────
    print("\n[6/7] Staging Active Session Carts...")
    active_carts = []
    cart_customers = random.sample(customers, min(10, len(customers)))
    for cid in cart_customers:
        cart_items = []
        for _ in range(random.randint(1, 4)):
            p = random.choice(products)
            cart_items.append({
                "product_id": p["_id"], "product_name": p["name"], "product_emoji": "📦",
                "quantity": 1, "unit_price": p["selling_price"], "total_price": p["selling_price"],
                "added_via": random.choice(["touch", "voice", "scan"])
            })
        active_carts.append({
            "_id": cid, "user_id": cid, "items": cart_items, "updated_at": now
        })
    await db_ord.carts.delete_many({})
    await db_ord.carts.insert_many(active_carts)
    print("      ✓ Staged 10 concurrent active shopping carts.")

    # ─────────────────────────────────────────────────────────────
    # 7. INDEX CREATION & SANITY CHECKS
    # ─────────────────────────────────────────────────────────────
    print("\n[7/7] Verifying & Building B-Tree Search Indexes...")
    await db_ord.orders.create_index([("user_id", 1), ("created_at", -1)])
    await db_pay.transactions.create_index([("order_id", 1)])
    await db_crm.analytics.create_index([("date", -1)])
    print("      ✓ Indexes fully operational.")

    print("\n╔═════════════════════════════════════════════════════════════╗")
    print("║  ENTERPRISE SEED TARGET ALLOCATED SUCCESSFULLY!             ║")
    print("╚═════════════════════════════════════════════════════════════╝")
    print("\n[ Credentials for Dashboard Testing ]")
    print("      Owner      : phone=9999900000 pin=0000")
    print("      Supervisor : phone=9999910001 pin=1234")
    print(f"      Customer   : phone=9876500001 pin=5678 (Demo User 1)")
    print("\n(System ready. Refresh dashboards to digest new analytics.)\n")

if __name__ == "__main__":
    asyncio.run(seed_enterprise())
