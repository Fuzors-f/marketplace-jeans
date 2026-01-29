/**
 * Add missing columns to orders table
 * Run: node add-missing-columns.js
 */

const db = require('./src/config/database');

const columns = [
  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address TEXT DEFAULT NULL AFTER guest_email",
  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_city VARCHAR(100) DEFAULT NULL AFTER shipping_address",
  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_city_id INT DEFAULT NULL AFTER shipping_city",
  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_province VARCHAR(100) DEFAULT NULL AFTER shipping_city_id",
  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_postal_code VARCHAR(10) DEFAULT NULL AFTER shipping_province",
  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_country VARCHAR(100) DEFAULT 'Indonesia' AFTER shipping_postal_code",
  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_method VARCHAR(100) DEFAULT NULL AFTER shipping_country",
  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100) DEFAULT NULL AFTER shipping_method",
  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier VARCHAR(100) DEFAULT NULL AFTER tracking_number",
  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS warehouse_id INT DEFAULT NULL AFTER courier",
  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'IDR' AFTER notes",
  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(15,2) DEFAULT NULL AFTER currency",
  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'bank_transfer' AFTER payment_status",
  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255) DEFAULT NULL AFTER total_amount",
  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255) DEFAULT NULL AFTER customer_name",
  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20) DEFAULT NULL AFTER customer_email",
  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_by INT DEFAULT NULL AFTER exchange_rate",
  // Payments table
  "ALTER TABLE payments ADD COLUMN IF NOT EXISTS snap_token VARCHAR(255) DEFAULT NULL AFTER response_data",
  "ALTER TABLE payments ADD COLUMN IF NOT EXISTS va_number VARCHAR(100) DEFAULT NULL AFTER snap_token",
  "ALTER TABLE payments ADD COLUMN IF NOT EXISTS bill_key VARCHAR(100) DEFAULT NULL AFTER va_number",
  "ALTER TABLE payments ADD COLUMN IF NOT EXISTS redirect_url TEXT DEFAULT NULL AFTER bill_key",
  // Order items
  "ALTER TABLE order_items ADD COLUMN IF NOT EXISTS warehouse_id INT DEFAULT NULL AFTER size_name",
  "ALTER TABLE order_items ADD COLUMN IF NOT EXISTS unit_cost DECIMAL(12,2) DEFAULT NULL AFTER unit_price",
  // Order shipping
  "ALTER TABLE order_shipping ADD COLUMN IF NOT EXISTS courier VARCHAR(100) DEFAULT NULL AFTER shipping_method",
  "ALTER TABLE order_shipping ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(12,2) DEFAULT 0.00 AFTER tracking_number",
  "ALTER TABLE order_shipping ADD COLUMN IF NOT EXISTS warehouse_id INT DEFAULT NULL AFTER shipping_cost",
  // Users table
  "ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(500) DEFAULT NULL AFTER password",
  "ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login DATETIME DEFAULT NULL AFTER member_discount",
  // Products table
  "ALTER TABLE products ADD COLUMN IF NOT EXISTS master_cost_price DECIMAL(12,2) DEFAULT NULL AFTER base_price",
  "ALTER TABLE products ADD COLUMN IF NOT EXISTS weight INT DEFAULT 500 AFTER master_cost_price",
  // Settings
  "ALTER TABLE settings ADD COLUMN IF NOT EXISTS setting_group VARCHAR(50) DEFAULT 'general' AFTER setting_key",
  "ALTER TABLE settings ADD COLUMN IF NOT EXISTS is_public TINYINT(1) DEFAULT 0 AFTER is_editable",
];

async function runMigrations() {
  console.log('🚀 Starting database migration...\n');
  
  let success = 0;
  let skipped = 0;
  
  for (const sql of columns) {
    try {
      await db.query(sql);
      const match = sql.match(/ADD COLUMN IF NOT EXISTS (\w+)/);
      const colName = match ? match[1] : 'unknown';
      console.log(`✅ Added: ${colName}`);
      success++;
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        const match = sql.match(/ADD COLUMN IF NOT EXISTS (\w+)/);
        const colName = match ? match[1] : 'unknown';
        console.log(`⏭️  Exists: ${colName}`);
        skipped++;
      } else {
        console.log(`❌ Error: ${e.message}`);
      }
    }
  }
  
  console.log(`\n📊 Migration complete: ${success} added, ${skipped} already exist`);
  process.exit(0);
}

runMigrations().catch(e => {
  console.error('Migration failed:', e);
  process.exit(1);
});
