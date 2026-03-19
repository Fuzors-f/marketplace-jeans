-- Migration: Add coupon terms/requirements columns for dynamic coupon activation rules
-- Run this SQL in your MySQL database

-- Add min_items column (minimum number of different items in cart)
ALTER TABLE coupons ADD COLUMN min_items INT DEFAULT NULL COMMENT 'Minimum number of different items in cart' AFTER min_purchase;

-- Add min_item_qty column (minimum total quantity of items in cart)
ALTER TABLE coupons ADD COLUMN min_item_qty INT DEFAULT NULL COMMENT 'Minimum total quantity of items in cart' AFTER min_items;

-- Add coupon_type column for activation type (manual code entry OR automatic)
ALTER TABLE coupons ADD COLUMN coupon_type ENUM('manual', 'automatic') DEFAULT 'manual' COMMENT 'manual=user enters code, automatic=applied when requirements met' AFTER applicable_categories;

-- Add requirements_text column for custom requirements description
ALTER TABLE coupons ADD COLUMN requirements_text TEXT DEFAULT NULL COMMENT 'Custom requirements description shown to users' AFTER coupon_type;
