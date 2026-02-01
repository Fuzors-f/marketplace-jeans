-- Add discount columns to products table
ALTER TABLE `products` 
ADD COLUMN `discount_percentage` DECIMAL(5,2) DEFAULT NULL COMMENT 'Discount percentage (0-100)' AFTER `base_price`,
ADD COLUMN `discount_start_date` DATETIME DEFAULT NULL COMMENT 'Discount start date' AFTER `discount_percentage`,
ADD COLUMN `discount_end_date` DATETIME DEFAULT NULL COMMENT 'Discount end date' AFTER `discount_start_date`;

-- Example: Set 20% discount on product id 1
-- UPDATE products SET discount_percentage = 20, discount_start_date = NOW(), discount_end_date = DATE_ADD(NOW(), INTERVAL 30 DAY) WHERE id = 1;
