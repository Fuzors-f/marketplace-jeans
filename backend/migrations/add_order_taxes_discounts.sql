-- Migration: Add order taxes and discounts tables
-- Date: 2026-01-07
-- Description: Add tables for storing dynamic tax and discount details for orders

-- Add warehouse_id to orders table for tracking source warehouse
ALTER TABLE orders 
ADD COLUMN warehouse_id INT NULL AFTER shipping_method,
ADD COLUMN shipping_cost_id INT NULL AFTER warehouse_id,
ADD FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE SET NULL;

-- Create order_taxes table for dynamic tax items
CREATE TABLE IF NOT EXISTS order_taxes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  description VARCHAR(255) NOT NULL COMMENT 'Tax description/name (e.g., PPN 11%, PPH 2.5%)',
  amount DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT 'Tax amount in currency',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create order_discounts table for dynamic discount items
CREATE TABLE IF NOT EXISTS order_discounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  description VARCHAR(255) NOT NULL COMMENT 'Discount description (e.g., Member Discount, Promo New Year)',
  amount DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT 'Discount amount in currency',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Update orders table to have separate tax_amount column (total of all taxes)
-- and keep the original discount_amount as total of all discounts
ALTER TABLE orders 
MODIFY COLUMN tax DECIMAL(12,2) DEFAULT 0.00 COMMENT 'Total tax amount (sum of order_taxes)',
MODIFY COLUMN discount_amount DECIMAL(12,2) DEFAULT 0.00 COMMENT 'Total discount amount (sum of order_discounts)';
