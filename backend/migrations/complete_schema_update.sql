-- ===============================================
-- COMPLETE DATABASE SCHEMA UPDATE
-- Run this SQL to add all missing columns for production deployment
-- Execute in MySQL/phpMyAdmin
-- ===============================================

-- ===============================================
-- 1. UPDATE ORDERS TABLE - Add missing columns
-- ===============================================

-- Add unique_token column if not exists
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `unique_token` VARCHAR(64) DEFAULT NULL AFTER `order_number`;

-- Add approved_at and approved_by columns
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `approved_at` DATETIME DEFAULT NULL AFTER `status`;
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `approved_by` INT DEFAULT NULL AFTER `approved_at`;

-- Add payment_method column
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `payment_method` VARCHAR(50) DEFAULT 'bank_transfer' AFTER `payment_status`;

-- Add tax column if not exists
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `tax` DECIMAL(12,2) DEFAULT 0.00 COMMENT 'Total tax' AFTER `shipping_cost`;

-- Fix total_amount column name (some places use 'total', some use 'total_amount')
-- First check which exists and ensure both work

-- Add customer info columns for guest orders
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `customer_name` VARCHAR(255) DEFAULT NULL AFTER `total_amount`;
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `customer_email` VARCHAR(255) DEFAULT NULL AFTER `customer_name`;
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `customer_phone` VARCHAR(20) DEFAULT NULL AFTER `customer_email`;

-- Add shipping columns directly on orders table (for compatibility)
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `shipping_address` TEXT DEFAULT NULL AFTER `customer_phone`;
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `shipping_city` VARCHAR(100) DEFAULT NULL AFTER `shipping_address`;
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `shipping_city_id` INT DEFAULT NULL COMMENT 'Reference to cities table' AFTER `shipping_city`;
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `shipping_province` VARCHAR(100) DEFAULT NULL AFTER `shipping_city_id`;
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `shipping_postal_code` VARCHAR(10) DEFAULT NULL AFTER `shipping_province`;
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `shipping_country` VARCHAR(100) DEFAULT 'Indonesia' AFTER `shipping_postal_code`;
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `shipping_method` VARCHAR(100) DEFAULT NULL AFTER `shipping_country`;

-- Add warehouse and shipping cost references
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `warehouse_id` INT DEFAULT NULL COMMENT 'Source warehouse for shipping' AFTER `shipping_method`;
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `shipping_cost_id` INT DEFAULT NULL COMMENT 'Reference to shipping_costs table' AFTER `warehouse_id`;
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `courier` VARCHAR(100) DEFAULT NULL COMMENT 'Courier name (JNE, JNT, etc)' AFTER `shipping_cost_id`;
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `tracking_number` VARCHAR(100) DEFAULT NULL AFTER `courier`;

-- Add currency and exchange rate for international orders
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `currency` VARCHAR(10) DEFAULT 'IDR' AFTER `notes`;
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `exchange_rate` DECIMAL(15,2) DEFAULT NULL AFTER `currency`;

-- Add created_by for admin-created orders
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `created_by` INT DEFAULT NULL AFTER `exchange_rate`;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS `idx_unique_token` ON `orders` (`unique_token`);
CREATE INDEX IF NOT EXISTS `idx_warehouse` ON `orders` (`warehouse_id`);
CREATE INDEX IF NOT EXISTS `idx_courier` ON `orders` (`courier`);
CREATE INDEX IF NOT EXISTS `idx_tracking` ON `orders` (`tracking_number`);
CREATE INDEX IF NOT EXISTS `idx_currency` ON `orders` (`currency`);

-- ===============================================
-- 2. UPDATE ORDER_ITEMS TABLE - Add missing columns
-- ===============================================

ALTER TABLE `order_items` ADD COLUMN IF NOT EXISTS `product_id` INT DEFAULT NULL AFTER `order_id`;
ALTER TABLE `order_items` ADD COLUMN IF NOT EXISTS `size_id` INT DEFAULT NULL AFTER `product_variant_id`;
ALTER TABLE `order_items` ADD COLUMN IF NOT EXISTS `warehouse_id` INT DEFAULT NULL COMMENT 'Source warehouse for this item' AFTER `size_id`;
ALTER TABLE `order_items` ADD COLUMN IF NOT EXISTS `unit_cost` DECIMAL(12,2) DEFAULT NULL COMMENT 'Cost price for profit calculation' AFTER `unit_price`;

-- Ensure we have both price and unit_price columns
ALTER TABLE `order_items` ADD COLUMN IF NOT EXISTS `price` DECIMAL(12,2) DEFAULT NULL AFTER `quantity`;
ALTER TABLE `order_items` ADD COLUMN IF NOT EXISTS `unit_price` DECIMAL(12,2) DEFAULT NULL AFTER `price`;
ALTER TABLE `order_items` ADD COLUMN IF NOT EXISTS `total` DECIMAL(12,2) DEFAULT NULL AFTER `subtotal`;

-- ===============================================
-- 3. UPDATE ORDER_SHIPPING TABLE - Ensure all columns exist
-- ===============================================

-- These should already exist but ensure they do
ALTER TABLE `order_shipping` ADD COLUMN IF NOT EXISTS `country` VARCHAR(100) DEFAULT 'Indonesia' AFTER `postal_code`;
ALTER TABLE `order_shipping` ADD COLUMN IF NOT EXISTS `shipping_method` VARCHAR(100) DEFAULT NULL AFTER `country`;
ALTER TABLE `order_shipping` ADD COLUMN IF NOT EXISTS `courier` VARCHAR(100) DEFAULT NULL AFTER `shipping_method`;
ALTER TABLE `order_shipping` ADD COLUMN IF NOT EXISTS `tracking_number` VARCHAR(100) DEFAULT NULL AFTER `courier`;
ALTER TABLE `order_shipping` ADD COLUMN IF NOT EXISTS `shipping_cost` DECIMAL(12,2) DEFAULT 0.00 AFTER `tracking_number`;
ALTER TABLE `order_shipping` ADD COLUMN IF NOT EXISTS `warehouse_id` INT DEFAULT NULL AFTER `shipping_cost`;
ALTER TABLE `order_shipping` ADD COLUMN IF NOT EXISTS `shipped_at` DATETIME DEFAULT NULL AFTER `warehouse_id`;
ALTER TABLE `order_shipping` ADD COLUMN IF NOT EXISTS `delivered_at` DATETIME DEFAULT NULL AFTER `shipped_at`;
ALTER TABLE `order_shipping` ADD COLUMN IF NOT EXISTS `estimated_delivery` DATETIME DEFAULT NULL AFTER `delivered_at`;

-- ===============================================
-- 4. UPDATE PAYMENTS TABLE - Add Midtrans columns
-- ===============================================

ALTER TABLE `payments` ADD COLUMN IF NOT EXISTS `snap_token` VARCHAR(255) DEFAULT NULL AFTER `response_data`;
ALTER TABLE `payments` ADD COLUMN IF NOT EXISTS `va_number` VARCHAR(100) DEFAULT NULL AFTER `snap_token`;
ALTER TABLE `payments` ADD COLUMN IF NOT EXISTS `bill_key` VARCHAR(100) DEFAULT NULL AFTER `va_number`;
ALTER TABLE `payments` ADD COLUMN IF NOT EXISTS `biller_code` VARCHAR(100) DEFAULT NULL AFTER `bill_key`;
ALTER TABLE `payments` ADD COLUMN IF NOT EXISTS `qr_code_url` TEXT DEFAULT NULL AFTER `biller_code`;
ALTER TABLE `payments` ADD COLUMN IF NOT EXISTS `redirect_url` TEXT DEFAULT NULL AFTER `qr_code_url`;
ALTER TABLE `payments` ADD COLUMN IF NOT EXISTS `fraud_status` VARCHAR(50) DEFAULT NULL AFTER `redirect_url`;

-- ===============================================
-- 5. UPDATE USERS TABLE - Add missing columns
-- ===============================================

ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `profile_picture` VARCHAR(500) DEFAULT NULL AFTER `password`;
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `member_discount` DECIMAL(5,2) DEFAULT 0.00 AFTER `is_active`;
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `last_login` DATETIME DEFAULT NULL AFTER `member_discount`;
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `email_verified_at` DATETIME DEFAULT NULL AFTER `last_login`;
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `reset_password_token` VARCHAR(255) DEFAULT NULL AFTER `email_verified_at`;
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `reset_password_expires` DATETIME DEFAULT NULL AFTER `reset_password_token`;

-- ===============================================
-- 6. UPDATE PRODUCT_VARIANTS TABLE - Add missing columns
-- ===============================================

ALTER TABLE `product_variants` ADD COLUMN IF NOT EXISTS `warehouse_id` INT DEFAULT NULL AFTER `size_id`;
ALTER TABLE `product_variants` ADD COLUMN IF NOT EXISTS `min_stock` INT DEFAULT 5 AFTER `stock_quantity`;
ALTER TABLE `product_variants` ADD COLUMN IF NOT EXISTS `weight` INT DEFAULT 500 COMMENT 'Weight in grams' AFTER `min_stock`;
ALTER TABLE `product_variants` ADD COLUMN IF NOT EXISTS `barcode` VARCHAR(100) DEFAULT NULL AFTER `weight`;

-- ===============================================
-- 7. UPDATE PRODUCTS TABLE - Add missing columns
-- ===============================================

ALTER TABLE `products` ADD COLUMN IF NOT EXISTS `master_cost_price` DECIMAL(12,2) DEFAULT NULL COMMENT 'Default cost price' AFTER `base_price`;
ALTER TABLE `products` ADD COLUMN IF NOT EXISTS `weight` INT DEFAULT 500 COMMENT 'Default weight in grams' AFTER `master_cost_price`;
ALTER TABLE `products` ADD COLUMN IF NOT EXISTS `meta_title` VARCHAR(255) DEFAULT NULL AFTER `is_featured`;
ALTER TABLE `products` ADD COLUMN IF NOT EXISTS `meta_description` TEXT DEFAULT NULL AFTER `meta_title`;
ALTER TABLE `products` ADD COLUMN IF NOT EXISTS `meta_keywords` VARCHAR(500) DEFAULT NULL AFTER `meta_description`;

-- ===============================================
-- 8. UPDATE SETTINGS TABLE - Add group column
-- ===============================================

ALTER TABLE `settings` ADD COLUMN IF NOT EXISTS `setting_group` VARCHAR(50) DEFAULT 'general' AFTER `setting_key`;
ALTER TABLE `settings` ADD COLUMN IF NOT EXISTS `is_public` TINYINT(1) DEFAULT 0 COMMENT 'If true, setting is accessible without auth' AFTER `is_editable`;

-- ===============================================
-- 9. UPDATE COUPONS TABLE - Ensure all columns exist
-- ===============================================

ALTER TABLE `coupons` ADD COLUMN IF NOT EXISTS `minimum_purchase` DECIMAL(12,2) DEFAULT 0.00 AFTER `max_discount`;
ALTER TABLE `coupons` ADD COLUMN IF NOT EXISTS `max_uses` INT DEFAULT NULL AFTER `minimum_purchase`;
ALTER TABLE `coupons` ADD COLUMN IF NOT EXISTS `used_count` INT DEFAULT 0 AFTER `max_uses`;
ALTER TABLE `coupons` ADD COLUMN IF NOT EXISTS `max_uses_per_user` INT DEFAULT 1 AFTER `used_count`;
ALTER TABLE `coupons` ADD COLUMN IF NOT EXISTS `applicable_products` TEXT DEFAULT NULL COMMENT 'JSON array of product IDs' AFTER `max_uses_per_user`;
ALTER TABLE `coupons` ADD COLUMN IF NOT EXISTS `applicable_categories` TEXT DEFAULT NULL COMMENT 'JSON array of category IDs' AFTER `applicable_products`;
ALTER TABLE `coupons` ADD COLUMN IF NOT EXISTS `user_restriction` ENUM('all', 'new', 'existing', 'specific') DEFAULT 'all' AFTER `applicable_categories`;

-- ===============================================
-- 10. CREATE COUPON_USAGE TABLE IF NOT EXISTS
-- ===============================================

CREATE TABLE IF NOT EXISTS `coupon_usages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `coupon_id` INT NOT NULL,
  `user_id` INT DEFAULT NULL,
  `order_id` INT NOT NULL,
  `discount_amount` DECIMAL(12,2) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_coupon` (`coupon_id`),
  INDEX `idx_user` (`user_id`),
  INDEX `idx_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===============================================
-- 11. UPDATE WAREHOUSES TABLE - Add missing columns
-- ===============================================

ALTER TABLE `warehouses` ADD COLUMN IF NOT EXISTS `city_id` INT DEFAULT NULL AFTER `province`;
ALTER TABLE `warehouses` ADD COLUMN IF NOT EXISTS `postal_code` VARCHAR(10) DEFAULT NULL AFTER `city`;
ALTER TABLE `warehouses` ADD COLUMN IF NOT EXISTS `contact_person` VARCHAR(100) DEFAULT NULL AFTER `postal_code`;
ALTER TABLE `warehouses` ADD COLUMN IF NOT EXISTS `contact_phone` VARCHAR(20) DEFAULT NULL AFTER `contact_person`;
ALTER TABLE `warehouses` ADD COLUMN IF NOT EXISTS `is_default` TINYINT(1) DEFAULT 0 AFTER `is_active`;
ALTER TABLE `warehouses` ADD COLUMN IF NOT EXISTS `latitude` DECIMAL(10,8) DEFAULT NULL AFTER `is_default`;
ALTER TABLE `warehouses` ADD COLUMN IF NOT EXISTS `longitude` DECIMAL(11,8) DEFAULT NULL AFTER `latitude`;

-- ===============================================
-- 12. UPDATE CITIES TABLE - Add missing columns
-- ===============================================

ALTER TABLE `cities` ADD COLUMN IF NOT EXISTS `country` VARCHAR(100) DEFAULT 'Indonesia' AFTER `province`;
ALTER TABLE `cities` ADD COLUMN IF NOT EXISTS `latitude` DECIMAL(10,8) DEFAULT NULL AFTER `is_active`;
ALTER TABLE `cities` ADD COLUMN IF NOT EXISTS `longitude` DECIMAL(11,8) DEFAULT NULL AFTER `latitude`;

-- ===============================================
-- 13. UPDATE SHIPPING_COSTS TABLE - Add missing columns
-- ===============================================

ALTER TABLE `shipping_costs` ADD COLUMN IF NOT EXISTS `courier` VARCHAR(100) DEFAULT NULL AFTER `destination_city_id`;
ALTER TABLE `shipping_costs` ADD COLUMN IF NOT EXISTS `service_type` VARCHAR(100) DEFAULT 'Regular' AFTER `courier`;
ALTER TABLE `shipping_costs` ADD COLUMN IF NOT EXISTS `estimated_days` VARCHAR(50) DEFAULT NULL AFTER `cost`;
ALTER TABLE `shipping_costs` ADD COLUMN IF NOT EXISTS `description` TEXT DEFAULT NULL AFTER `estimated_days`;

-- ===============================================
-- 14. UPDATE BANNERS TABLE - Add multilingual columns
-- ===============================================

ALTER TABLE `banners` ADD COLUMN IF NOT EXISTS `title_en` VARCHAR(255) DEFAULT NULL AFTER `title`;
ALTER TABLE `banners` ADD COLUMN IF NOT EXISTS `subtitle` VARCHAR(255) DEFAULT NULL AFTER `title_en`;
ALTER TABLE `banners` ADD COLUMN IF NOT EXISTS `subtitle_en` VARCHAR(255) DEFAULT NULL AFTER `subtitle`;
ALTER TABLE `banners` ADD COLUMN IF NOT EXISTS `button_text` VARCHAR(100) DEFAULT 'Shop Now' AFTER `link_url`;
ALTER TABLE `banners` ADD COLUMN IF NOT EXISTS `button_text_en` VARCHAR(100) DEFAULT 'Shop Now' AFTER `button_text`;

-- ===============================================
-- 15. UPDATE CATEGORIES TABLE - Add multilingual columns
-- ===============================================

ALTER TABLE `categories` ADD COLUMN IF NOT EXISTS `name_en` VARCHAR(100) DEFAULT NULL AFTER `name`;
ALTER TABLE `categories` ADD COLUMN IF NOT EXISTS `description_en` TEXT DEFAULT NULL AFTER `description`;

-- ===============================================
-- 16. UPDATE ACTIVITY_LOGS TABLE - Ensure all columns exist
-- ===============================================

ALTER TABLE `activity_logs` ADD COLUMN IF NOT EXISTS `ip_address` VARCHAR(45) DEFAULT NULL AFTER `description`;
ALTER TABLE `activity_logs` ADD COLUMN IF NOT EXISTS `user_agent` TEXT DEFAULT NULL AFTER `ip_address`;
ALTER TABLE `activity_logs` ADD COLUMN IF NOT EXISTS `request_url` VARCHAR(500) DEFAULT NULL AFTER `user_agent`;
ALTER TABLE `activity_logs` ADD COLUMN IF NOT EXISTS `request_method` VARCHAR(10) DEFAULT NULL AFTER `request_url`;
ALTER TABLE `activity_logs` ADD COLUMN IF NOT EXISTS `metadata` JSON DEFAULT NULL AFTER `request_method`;

-- ===============================================
-- 17. CREATE USER_ADDRESSES TABLE IF NOT EXISTS
-- ===============================================

CREATE TABLE IF NOT EXISTS `user_addresses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `label` VARCHAR(100) DEFAULT 'Home',
  `recipient_name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `address` TEXT NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `city_id` INT DEFAULT NULL,
  `province` VARCHAR(100) NOT NULL,
  `postal_code` VARCHAR(10) NOT NULL,
  `country` VARCHAR(100) DEFAULT 'Indonesia',
  `is_default` TINYINT(1) DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user` (`user_id`),
  INDEX `idx_default` (`user_id`, `is_default`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===============================================
-- 18. CREATE WISHLISTS TABLE IF NOT EXISTS
-- ===============================================

CREATE TABLE IF NOT EXISTS `wishlists` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_wishlist` (`user_id`, `product_id`),
  INDEX `idx_user` (`user_id`),
  INDEX `idx_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===============================================
-- 19. CREATE EXCHANGE_RATES TABLE IF NOT EXISTS
-- ===============================================

CREATE TABLE IF NOT EXISTS `exchange_rates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `currency_from` VARCHAR(3) NOT NULL DEFAULT 'IDR',
  `currency_to` VARCHAR(3) NOT NULL DEFAULT 'USD',
  `rate` DECIMAL(15,6) NOT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `updated_by` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_currency_pair` (`currency_from`, `currency_to`),
  INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default exchange rates
INSERT IGNORE INTO `exchange_rates` (`currency_from`, `currency_to`, `rate`, `is_active`) VALUES
('IDR', 'USD', 0.000063, 1),
('IDR', 'EUR', 0.000058, 1),
('IDR', 'SGD', 0.000085, 1),
('IDR', 'MYR', 0.000280, 1);

-- ===============================================
-- 20. CREATE EXCHANGE_RATE_LOGS TABLE IF NOT EXISTS
-- ===============================================

CREATE TABLE IF NOT EXISTS `exchange_rate_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `exchange_rate_id` INT NOT NULL,
  `currency_from` VARCHAR(3) NOT NULL,
  `currency_to` VARCHAR(3) NOT NULL,
  `old_rate` DECIMAL(15,6) NOT NULL,
  `new_rate` DECIMAL(15,6) NOT NULL,
  `changed_by` INT DEFAULT NULL,
  `change_reason` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_exchange_rate` (`exchange_rate_id`),
  INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===============================================
-- 21. CREATE CONTENT_PAGES TABLE IF NOT EXISTS
-- ===============================================

CREATE TABLE IF NOT EXISTS `content_pages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `title_en` VARCHAR(255) DEFAULT NULL,
  `content` LONGTEXT DEFAULT NULL,
  `content_en` LONGTEXT DEFAULT NULL,
  `meta_title` VARCHAR(255) DEFAULT NULL,
  `meta_description` TEXT DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_by` INT DEFAULT NULL,
  `updated_by` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_slug` (`slug`),
  INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default content pages
INSERT IGNORE INTO `content_pages` (`slug`, `title`, `title_en`, `content`, `content_en`) VALUES
('about-us', 'Tentang Kami', 'About Us', '<p>Marketplace Jeans adalah toko online terpercaya untuk kebutuhan jeans Anda.</p>', '<p>Marketplace Jeans is a trusted online store for all your jeans needs.</p>'),
('privacy-policy', 'Kebijakan Privasi', 'Privacy Policy', '<p>Kami menghormati privasi Anda dan berkomitmen untuk melindungi data pribadi Anda.</p>', '<p>We respect your privacy and are committed to protecting your personal data.</p>'),
('terms-conditions', 'Syarat dan Ketentuan', 'Terms & Conditions', '<p>Dengan menggunakan layanan kami, Anda setuju dengan syarat dan ketentuan yang berlaku.</p>', '<p>By using our services, you agree to these terms and conditions.</p>'),
('return-policy', 'Kebijakan Pengembalian', 'Return Policy', '<p>Anda dapat mengembalikan produk dalam waktu 14 hari setelah pembelian.</p>', '<p>You can return products within 14 days of purchase.</p>'),
('shipping-info', 'Informasi Pengiriman', 'Shipping Information', '<p>Kami mengirim ke seluruh Indonesia dengan berbagai pilihan kurir.</p>', '<p>We ship nationwide with various courier options.</p>');

-- ===============================================
-- 22. UPDATE STOCK_OPNAME TABLE - Add missing columns
-- ===============================================

ALTER TABLE `stock_opname` ADD COLUMN IF NOT EXISTS `warehouse_id` INT DEFAULT NULL AFTER `product_variant_id`;
ALTER TABLE `stock_opname` ADD COLUMN IF NOT EXISTS `system_stock` INT NOT NULL DEFAULT 0 AFTER `warehouse_id`;
ALTER TABLE `stock_opname` ADD COLUMN IF NOT EXISTS `physical_stock` INT NOT NULL DEFAULT 0 AFTER `system_stock`;
ALTER TABLE `stock_opname` ADD COLUMN IF NOT EXISTS `difference` INT DEFAULT 0 AFTER `physical_stock`;
ALTER TABLE `stock_opname` ADD COLUMN IF NOT EXISTS `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' AFTER `notes`;
ALTER TABLE `stock_opname` ADD COLUMN IF NOT EXISTS `approved_by` INT DEFAULT NULL AFTER `status`;
ALTER TABLE `stock_opname` ADD COLUMN IF NOT EXISTS `approved_at` DATETIME DEFAULT NULL AFTER `approved_by`;

-- ===============================================
-- 23. CREATE GUEST_ORDER_DETAILS TABLE IF NOT EXISTS
-- ===============================================

CREATE TABLE IF NOT EXISTS `guest_order_details` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `guest_name` VARCHAR(255) NOT NULL,
  `guest_email` VARCHAR(255) DEFAULT NULL,
  `guest_phone` VARCHAR(20) NOT NULL,
  `address` TEXT NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `province` VARCHAR(100) NOT NULL,
  `postal_code` VARCHAR(10) DEFAULT NULL,
  `country` VARCHAR(100) DEFAULT 'Indonesia',
  `latitude` DECIMAL(10,8) DEFAULT NULL COMMENT 'GPS latitude',
  `longitude` DECIMAL(11,8) DEFAULT NULL COMMENT 'GPS longitude',
  `address_notes` TEXT DEFAULT NULL COMMENT 'Additional address instructions',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_order` (`order_id`),
  INDEX `idx_email` (`guest_email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===============================================
-- 24. CREATE ORDER_DISCOUNTS TABLE IF NOT EXISTS
-- ===============================================

CREATE TABLE IF NOT EXISTS `order_discounts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `description` VARCHAR(255) NOT NULL COMMENT 'Discount description',
  `amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT 'Discount amount',
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===============================================
-- 25. CREATE ORDER_TAXES TABLE IF NOT EXISTS
-- ===============================================

CREATE TABLE IF NOT EXISTS `order_taxes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `description` VARCHAR(255) NOT NULL COMMENT 'Tax description/name',
  `amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT 'Tax amount',
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===============================================
-- 26. CREATE ORDER_TRACKING TABLE IF NOT EXISTS
-- ===============================================

CREATE TABLE IF NOT EXISTS `order_tracking` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `status` VARCHAR(50) NOT NULL COMMENT 'Status: pending, confirmed, processing, packed, shipped, in_transit, out_for_delivery, delivered, cancelled',
  `title` VARCHAR(255) NOT NULL COMMENT 'Status title for display',
  `description` TEXT DEFAULT NULL COMMENT 'Detailed description/notes',
  `location` VARCHAR(255) DEFAULT NULL COMMENT 'Location info if applicable',
  `created_by` INT DEFAULT NULL COMMENT 'Admin who created this update',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_order` (`order_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===============================================
-- 27. CREATE ORDER_SHIPPING_HISTORY TABLE IF NOT EXISTS
-- ===============================================

CREATE TABLE IF NOT EXISTS `order_shipping_history` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `status` VARCHAR(50) NOT NULL COMMENT 'Status: pending, approved, processing, packed, shipped, in_transit, out_for_delivery, delivered, cancelled',
  `title` VARCHAR(255) NOT NULL COMMENT 'Status title for display',
  `description` TEXT DEFAULT NULL COMMENT 'Manual description by admin',
  `location` VARCHAR(255) DEFAULT NULL COMMENT 'Location info',
  `created_by` INT DEFAULT NULL COMMENT 'Admin who created this update',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_order` (`order_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===============================================
-- 28. CREATE INVENTORY_MOVEMENTS TABLE IF NOT EXISTS
-- ===============================================

CREATE TABLE IF NOT EXISTS `inventory_movements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_variant_id` INT NOT NULL,
  `warehouse_id` INT DEFAULT NULL,
  `type` ENUM('in', 'out', 'adjustment', 'transfer') NOT NULL,
  `quantity` INT NOT NULL,
  `reference_type` VARCHAR(50) DEFAULT NULL COMMENT 'order, opname, transfer, adjustment',
  `reference_id` INT DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_by` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_variant` (`product_variant_id`),
  INDEX `idx_warehouse` (`warehouse_id`),
  INDEX `idx_type` (`type`),
  INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===============================================
-- 29. ADD FOREIGN KEY CONSTRAINTS (Run after all tables exist)
-- ===============================================

-- Note: Run these only if foreign keys don't exist
-- You may need to check and add them manually if there are errors

-- ALTER TABLE `guest_order_details` 
--   ADD CONSTRAINT `fk_guest_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

-- ALTER TABLE `order_discounts` 
--   ADD CONSTRAINT `fk_order_discount` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

-- ALTER TABLE `order_taxes` 
--   ADD CONSTRAINT `fk_order_tax` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

-- ALTER TABLE `order_tracking` 
--   ADD CONSTRAINT `fk_order_tracking` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

-- ALTER TABLE `order_shipping_history` 
--   ADD CONSTRAINT `fk_order_shipping_history` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

-- ===============================================
-- VERIFICATION QUERIES
-- Run these to verify the schema is correct
-- ===============================================

-- Check orders table structure
-- DESCRIBE orders;

-- Check order_shipping table structure
-- DESCRIBE order_shipping;

-- Check payments table structure
-- DESCRIBE payments;

-- List all tables
-- SHOW TABLES;

-- ===============================================
-- END OF SCHEMA UPDATE
-- ===============================================
