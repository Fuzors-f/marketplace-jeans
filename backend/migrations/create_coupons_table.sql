-- Migration: Create coupons table for enhanced coupon/discount system
-- Run this SQL in your MySQL database

-- Drop old discounts table if exists (backup data first if needed)
-- ALTER TABLE discounts RENAME TO discounts_backup;

-- Create new coupons table with enhanced features
CREATE TABLE IF NOT EXISTS coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Discount type: 'percentage' or 'fixed'
  discount_type ENUM('percentage', 'fixed') NOT NULL DEFAULT 'percentage',
  discount_value DECIMAL(15,2) NOT NULL,
  
  -- Max discount for percentage type (optional)
  max_discount DECIMAL(15,2) DEFAULT NULL,
  
  -- Minimum purchase requirement (optional)
  min_purchase DECIMAL(15,2) DEFAULT 0,
  
  -- Validity period (optional - if null, always valid)
  start_date DATETIME DEFAULT NULL,
  end_date DATETIME DEFAULT NULL,
  
  -- Usage limits (optional)
  usage_limit INT DEFAULT NULL COMMENT 'Total times coupon can be used (null = unlimited)',
  usage_limit_per_user INT DEFAULT 1 COMMENT 'Times each user can use this coupon',
  usage_count INT DEFAULT 0 COMMENT 'Total times coupon has been used',
  
  -- Applicable products/categories (JSON array of IDs, null = all)
  applicable_products JSON DEFAULT NULL,
  applicable_categories JSON DEFAULT NULL,
  
  -- Conditions (AND/OR logic)
  -- Both date and limit must be satisfied (AND logic)
  -- If date is set: current date must be within range
  -- If limit is set: usage_count must be < usage_limit
  
  is_active BOOLEAN DEFAULT TRUE,
  created_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_code (code),
  INDEX idx_active (is_active),
  INDEX idx_dates (start_date, end_date),
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create coupon usage tracking table
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
  INDEX idx_order (order_id),
  FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add coupon fields to orders table (if not exists)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS coupon_id INT DEFAULT NULL AFTER notes,
ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50) DEFAULT NULL AFTER coupon_id,
ADD COLUMN IF NOT EXISTS coupon_discount DECIMAL(15,2) DEFAULT 0 AFTER coupon_code;

-- Add foreign key for coupon in orders
-- ALTER TABLE orders ADD CONSTRAINT fk_order_coupon FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL;

-- Insert sample coupons
INSERT INTO coupons (code, name, description, discount_type, discount_value, max_discount, min_purchase, start_date, end_date, usage_limit, usage_limit_per_user) VALUES
('WELCOME10', 'Welcome Discount', 'Diskon 10% untuk pengguna baru', 'percentage', 10.00, 50000, 200000, NULL, NULL, NULL, 1),
('FLAT50K', 'Flat 50K Off', 'Potongan langsung Rp 50.000', 'fixed', 50000.00, NULL, 500000, NULL, NULL, 100, 2),
('NEWYEAR25', 'New Year Sale', 'Diskon 25% untuk tahun baru', 'percentage', 25.00, 100000, 300000, '2026-01-01 00:00:00', '2026-01-31 23:59:59', 500, 1),
('MEMBER15', 'Member Exclusive', 'Diskon eksklusif 15% untuk member', 'percentage', 15.00, 75000, 150000, NULL, NULL, NULL, 3);
