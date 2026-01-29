-- ===============================================
-- ADD MISSING ORDER COLUMNS FOR INTERNATIONAL ORDERS
-- Run this SQL to add new columns for international orders support
-- Execute in MySQL/phpMyAdmin
-- ===============================================

-- ===============================================
-- Method 1: Using IF NOT EXISTS (Recommended for MariaDB 10.0+)
-- ===============================================

-- Add unique_token column
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `unique_token` VARCHAR(64) DEFAULT NULL AFTER `order_number`;

-- Add shipping_postal_code column
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `shipping_postal_code` VARCHAR(10) DEFAULT NULL AFTER `shipping_province`;

-- Add shipping_country column
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `shipping_country` VARCHAR(100) DEFAULT 'Indonesia' AFTER `shipping_postal_code`;

-- Add currency column
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `currency` VARCHAR(10) DEFAULT 'IDR' AFTER `notes`;

-- Add exchange_rate column
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `exchange_rate` DECIMAL(15,2) DEFAULT NULL AFTER `currency`;

-- Add shipping columns on orders table
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `shipping_address` TEXT DEFAULT NULL AFTER `guest_email`;
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `shipping_city` VARCHAR(100) DEFAULT NULL AFTER `shipping_address`;
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `shipping_city_id` INT DEFAULT NULL AFTER `shipping_city`;
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `shipping_province` VARCHAR(100) DEFAULT NULL AFTER `shipping_city_id`;
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `shipping_method` VARCHAR(100) DEFAULT NULL AFTER `shipping_country`;
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `tracking_number` VARCHAR(100) DEFAULT NULL AFTER `shipping_method`;
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `courier` VARCHAR(100) DEFAULT NULL AFTER `tracking_number`;
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `warehouse_id` INT DEFAULT NULL AFTER `courier`;

-- Add customer info columns
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `customer_name` VARCHAR(255) DEFAULT NULL AFTER `total_amount`;
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `customer_email` VARCHAR(255) DEFAULT NULL AFTER `customer_name`;
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `customer_phone` VARCHAR(20) DEFAULT NULL AFTER `customer_email`;

-- ===============================================
-- Method 2: Using PREPARE statement (For older MySQL versions)
-- Uncomment and run if Method 1 doesn't work
-- ===============================================

/*
SET @dbname = DATABASE();
SET @tablename = 'orders';

-- Add shipping_postal_code
SET @columnname = 'shipping_postal_code';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(10) DEFAULT NULL')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add shipping_country
SET @columnname = 'shipping_country';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(100) DEFAULT \'Indonesia\'')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add currency
SET @columnname = 'currency';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(10) DEFAULT \'IDR\'')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add exchange_rate
SET @columnname = 'exchange_rate';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' DECIMAL(15,2) DEFAULT NULL')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add unique_token
SET @columnname = 'unique_token';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(64) DEFAULT NULL')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;
*/

-- ===============================================
-- ADD INDEXES FOR BETTER PERFORMANCE
-- ===============================================

CREATE INDEX IF NOT EXISTS `idx_unique_token` ON `orders` (`unique_token`);
CREATE INDEX IF NOT EXISTS `idx_shipping_city` ON `orders` (`shipping_city`);
CREATE INDEX IF NOT EXISTS `idx_currency` ON `orders` (`currency`);

-- ===============================================
-- VERIFICATION
-- Run this to verify columns exist
-- ===============================================
-- SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT 
-- FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_NAME = 'orders' 
-- AND COLUMN_NAME IN ('shipping_postal_code', 'shipping_country', 'currency', 'exchange_rate', 'unique_token');

