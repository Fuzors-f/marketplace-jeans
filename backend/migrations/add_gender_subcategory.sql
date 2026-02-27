-- ===============================================
-- ADD GENDER TO CATEGORIES AND PRODUCTS
-- ADD SUBCATEGORY SUPPORT
-- ===============================================

-- Add gender column to categories
ALTER TABLE `categories` ADD COLUMN IF NOT EXISTS `gender` ENUM('pria', 'wanita', 'both') DEFAULT 'both' AFTER `description`;

-- Add gender column to products
ALTER TABLE `products` ADD COLUMN IF NOT EXISTS `gender` ENUM('pria', 'wanita', 'both') DEFAULT 'both' AFTER `category_id`;

-- Update existing categories with gender based on name
UPDATE `categories` SET `gender` = 'pria' WHERE LOWER(`name`) LIKE '%men%' AND LOWER(`name`) NOT LIKE '%women%';
UPDATE `categories` SET `gender` = 'wanita' WHERE LOWER(`name`) LIKE '%women%';

-- Update existing products based on their category
UPDATE `products` p 
  JOIN `categories` c ON p.category_id = c.id 
  SET p.gender = c.gender;

-- Add index for gender filtering
CREATE INDEX IF NOT EXISTS `idx_categories_gender` ON `categories` (`gender`);
CREATE INDEX IF NOT EXISTS `idx_products_gender` ON `products` (`gender`);
