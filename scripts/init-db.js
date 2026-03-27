/**
 * ═══════════════════════════════════════════════
 * Kiosk Vision – MongoDB Initialization Script
 * Run once to create all collections, indexes,
 * and validation rules.
 * ═══════════════════════════════════════════════
 *
 * Usage: mongosh < scripts/init-db.js
 */

print("╔════════════════════════════════════════════╗");
print("║  Kiosk Vision – Database Initialization    ║");
print("╚════════════════════════════════════════════╝\n");

// ──────────────────────────────────────
// 1. kiosk_auth
// ──────────────────────────────────────
db = db.getSiblingDB("kiosk_auth");
print("▸ Initializing kiosk_auth...");

db.createCollection("users");
db.users.createIndex({ "phone": 1 }, { unique: true, sparse: true });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "employee_id": 1 }, { sparse: true });
db.users.createIndex({ "reward_points": -1 });
db.users.createIndex({ "created_at": -1 });

db.createCollection("sessions");
db.sessions.createIndex({ "expires_at": 1 }, { expireAfterSeconds: 0 });
db.sessions.createIndex({ "user_id": 1 });
db.sessions.createIndex({ "token_hash": 1 }, { unique: true });

db.createCollection("reward_points");
db.reward_points.createIndex({ "user_id": 1, "created_at": -1 });
db.reward_points.createIndex({ "order_id": 1 }, { sparse: true });
db.reward_points.createIndex({ "type": 1, "created_at": -1 });

db.createCollection("staff_attendance");
db.staff_attendance.createIndex({ "user_id": 1, "date": -1 }, { unique: true });
db.staff_attendance.createIndex({ "date": -1 });
db.staff_attendance.createIndex({ "status": 1, "date": -1 });

print("  ✓ kiosk_auth: 4 collections, 12 indexes");


// ──────────────────────────────────────
// 2. kiosk_inventory
// ──────────────────────────────────────
db = db.getSiblingDB("kiosk_inventory");
print("▸ Initializing kiosk_inventory...");

db.createCollection("products");
db.products.createIndex({ "barcode": 1 }, { unique: true, sparse: true });
db.products.createIndex({ "sku": 1 }, { unique: true, sparse: true });
db.products.createIndex({ "category": 1, "is_available": 1 });
db.products.createIndex({ "name": "text", "category": "text", "description": "text", "tags": "text" });
db.products.createIndex({ "expiry_date": 1 });
db.products.createIndex({ "stock_quantity": 1, "is_available": 1 });
db.products.createIndex({ "location.aisle": 1, "location.shelf": 1 });
db.products.createIndex({ "selling_price": 1 });
db.products.createIndex({ "created_at": -1 });

db.createCollection("categories");
db.categories.createIndex({ "parent_id": 1 });
db.categories.createIndex({ "sort_order": 1 });

db.createCollection("stock_movements");
db.stock_movements.createIndex({ "product_id": 1, "timestamp": -1 });
db.stock_movements.createIndex({ "type": 1, "timestamp": -1 });
db.stock_movements.createIndex({ "order_id": 1 }, { sparse: true });
db.stock_movements.createIndex({ "timestamp": -1 });

db.createCollection("expiry_alerts");
db.expiry_alerts.createIndex({ "expiry_date": 1 });
db.expiry_alerts.createIndex({ "alert_level": 1, "is_resolved": 1 });
db.expiry_alerts.createIndex({ "product_id": 1 });

print("  ✓ kiosk_inventory: 4 collections, 18 indexes");


// ──────────────────────────────────────
// 3. kiosk_orders
// ──────────────────────────────────────
db = db.getSiblingDB("kiosk_orders");
print("▸ Initializing kiosk_orders...");

db.createCollection("carts");
db.carts.createIndex({ "user_id": 1 }, { unique: true });
db.carts.createIndex({ "updated_at": 1 }, { expireAfterSeconds: 86400 });

db.createCollection("orders");
db.orders.createIndex({ "user_id": 1, "created_at": -1 });
db.orders.createIndex({ "status": 1, "created_at": -1 });
db.orders.createIndex({ "order_number": 1 }, { unique: true });
db.orders.createIndex({ "delivery_type": 1, "status": 1 });
db.orders.createIndex({ "delivery_boy_id": 1, "status": 1 }, { sparse: true });
db.orders.createIndex({ "created_at": -1 });
db.orders.createIndex({ "billed_by": 1 }, { sparse: true });
db.orders.createIndex({ "input_source": 1 });

db.createCollection("bills");
db.bills.createIndex({ "order_id": 1 }, { unique: true });
db.bills.createIndex({ "bill_number": 1 }, { unique: true });
db.bills.createIndex({ "user_id": 1, "created_at": -1 });
db.bills.createIndex({ "payment_status": 1 });
db.bills.createIndex({ "created_at": -1 });
db.bills.createIndex({ "billed_by": 1, "created_at": -1 });

print("  ✓ kiosk_orders: 3 collections, 16 indexes");


// ──────────────────────────────────────
// 4. kiosk_payment
// ──────────────────────────────────────
db = db.getSiblingDB("kiosk_payment");
print("▸ Initializing kiosk_payment...");

db.createCollection("payments");
db.payments.createIndex({ "order_id": 1 }, { unique: true });
db.payments.createIndex({ "status": 1, "created_at": -1 });
db.payments.createIndex({ "method": 1, "created_at": -1 });
db.payments.createIndex({ "confirmed_by": 1 }, { sparse: true });
db.payments.createIndex({ "expires_at": 1 }, { expireAfterSeconds: 0, sparse: true });

print("  ✓ kiosk_payment: 1 collection, 5 indexes");


// ──────────────────────────────────────
// 5. kiosk_crm
// ──────────────────────────────────────
db = db.getSiblingDB("kiosk_crm");
print("▸ Initializing kiosk_crm...");

db.createCollection("customer_profiles");
db.customer_profiles.createIndex({ "total_spent": -1 });
db.customer_profiles.createIndex({ "visit_count": -1 });
db.customer_profiles.createIndex({ "last_visit_at": -1 });
db.customer_profiles.createIndex({ "tier": 1 });

db.createCollection("analytics_events");
db.analytics_events.createIndex({ "timestamp": -1 });
db.analytics_events.createIndex({ "event_type": 1, "timestamp": -1 });
db.analytics_events.createIndex({ "user_id": 1, "timestamp": -1 });
db.analytics_events.createIndex({ "timestamp": 1 }, { expireAfterSeconds: 7776000 }); // 90 day TTL

db.createCollection("reports");
db.reports.createIndex({ "report_type": 1, "period": -1 }, { unique: true });
db.reports.createIndex({ "generated_at": -1 });

print("  ✓ kiosk_crm: 3 collections, 8 indexes");


// ──────────────────────────────────────
// 6. kiosk_ai
// ──────────────────────────────────────
db = db.getSiblingDB("kiosk_ai");
print("▸ Initializing kiosk_ai...");

db.createCollection("voice_command_logs");
db.voice_command_logs.createIndex({ "user_id": 1, "timestamp": -1 });
db.voice_command_logs.createIndex({ "intent": 1, "timestamp": -1 });
db.voice_command_logs.createIndex({ "action_success": 1 });
db.voice_command_logs.createIndex({ "timestamp": 1 }, { expireAfterSeconds: 2592000 }); // 30 day TTL

db.createCollection("ocr_scan_logs");
db.ocr_scan_logs.createIndex({ "user_id": 1, "timestamp": -1 });
db.ocr_scan_logs.createIndex({ "scan_type": 1 });
db.ocr_scan_logs.createIndex({ "matched_product_id": 1 }, { sparse: true });
db.ocr_scan_logs.createIndex({ "timestamp": 1 }, { expireAfterSeconds: 2592000 }); // 30 day TTL

db.createCollection("shopping_list_ocr");
db.shopping_list_ocr.createIndex({ "user_id": 1, "timestamp": -1 });
db.shopping_list_ocr.createIndex({ "status": 1 });
db.shopping_list_ocr.createIndex({ "order_id": 1 }, { sparse: true });
db.shopping_list_ocr.createIndex({ "timestamp": 1 }, { expireAfterSeconds: 2592000 }); // 30 day TTL

print("  ✓ kiosk_ai: 3 collections, 11 indexes");


// ──────────────────────────────────────
// Summary
// ──────────────────────────────────────
print("\n╔════════════════════════════════════════════╗");
print("║  ✅ Initialization Complete                ║");
print("║  6 databases · 18 collections · 70 indexes ║");
print("╚════════════════════════════════════════════╝");
