/**
 * Script to run coupon table migration
 * Run: node run-coupon-migration.js
 */

const { query } = require('./src/config/database');

async function runMigration() {
  console.log('Starting coupon table migration...');
  
  try {
    // Create coupons table
    console.log('Creating coupons table...');
    await query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        discount_type ENUM('percentage', 'fixed') NOT NULL DEFAULT 'percentage',
        discount_value DECIMAL(15,2) NOT NULL,
        max_discount DECIMAL(15,2) DEFAULT NULL,
        min_purchase DECIMAL(15,2) DEFAULT 0,
        start_date DATETIME DEFAULT NULL,
        end_date DATETIME DEFAULT NULL,
        usage_limit INT DEFAULT NULL COMMENT 'Total times coupon can be used (null = unlimited)',
        usage_limit_per_user INT DEFAULT 1 COMMENT 'Times each user can use this coupon',
        usage_count INT DEFAULT 0 COMMENT 'Total times coupon has been used',
        applicable_products JSON DEFAULT NULL,
        applicable_categories JSON DEFAULT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_by INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_code (code),
        INDEX idx_active (is_active),
        INDEX idx_dates (start_date, end_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Coupons table created');
    
    // Create coupon_usages table
    console.log('Creating coupon_usages table...');
    await query(`
      CREATE TABLE IF NOT EXISTS coupon_usages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        coupon_id INT NOT NULL,
        user_id INT DEFAULT NULL COMMENT 'NULL for guest users',
        guest_email VARCHAR(255) DEFAULT NULL,
        order_id INT NOT NULL,
        discount_amount DECIMAL(15,2) NOT NULL,
        used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_coupon (coupon_id),
        INDEX idx_user (user_id),
        INDEX idx_order (order_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Coupon_usages table created');
    
    // Add coupon columns to orders table
    console.log('Adding coupon columns to orders table...');
    try {
      await query(`ALTER TABLE orders ADD COLUMN coupon_id INT DEFAULT NULL`);
      console.log('✓ Added coupon_id column');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('• coupon_id column already exists');
      } else {
        throw err;
      }
    }
    
    try {
      await query(`ALTER TABLE orders ADD COLUMN coupon_code VARCHAR(50) DEFAULT NULL`);
      console.log('✓ Added coupon_code column');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('• coupon_code column already exists');
      } else {
        throw err;
      }
    }
    
    try {
      await query(`ALTER TABLE orders ADD COLUMN coupon_discount DECIMAL(15,2) DEFAULT 0`);
      console.log('✓ Added coupon_discount column');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('• coupon_discount column already exists');
      } else {
        throw err;
      }
    }
    
    console.log('\n✓ Migration completed successfully!');
    console.log('You can now use the coupon feature.');
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
