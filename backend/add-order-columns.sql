-- Run this SQL to add new columns for international orders support
-- Execute in MySQL/phpMyAdmin

-- Add shipping_country column if not exists
SET @dbname = DATABASE();
SET @tablename = 'orders';
SET @columnname = 'shipping_country';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
    AND TABLE_NAME = @tablename
    AND COLUMN_NAME = @columnname
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(100) DEFAULT \'Indonesia\' AFTER shipping_postal_code')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add currency column if not exists
SET @columnname = 'currency';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
    AND TABLE_NAME = @tablename
    AND COLUMN_NAME = @columnname
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(10) DEFAULT \'IDR\' AFTER notes')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add exchange_rate column if not exists
SET @columnname = 'exchange_rate';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
    AND TABLE_NAME = @tablename
    AND COLUMN_NAME = @columnname
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' DECIMAL(15,2) DEFAULT NULL AFTER currency')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Simple alternative (may throw error if columns exist):
-- ALTER TABLE orders ADD COLUMN shipping_country VARCHAR(100) DEFAULT 'Indonesia' AFTER shipping_postal_code;
-- ALTER TABLE orders ADD COLUMN currency VARCHAR(10) DEFAULT 'IDR' AFTER notes;
-- ALTER TABLE orders ADD COLUMN exchange_rate DECIMAL(15,2) DEFAULT NULL AFTER currency;
