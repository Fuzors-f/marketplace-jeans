-- Migration: Add cost_price column to inventory_movements and margin calculation setting
-- Date: 2026-02-27

-- 1. Add cost_price column to inventory_movements for HPP tracking per movement
ALTER TABLE inventory_movements ADD COLUMN cost_price DECIMAL(12,2) NULL DEFAULT NULL AFTER quantity;

-- 2. Backfill cost_price from product_variants for existing 'in' movements
UPDATE inventory_movements im
JOIN product_variants pv ON im.product_variant_id = pv.id
SET im.cost_price = pv.cost_price
WHERE im.type = 'in' AND im.cost_price IS NULL AND pv.cost_price > 0;

-- 3. Insert margin calculation method setting
INSERT INTO settings (setting_key, setting_value, setting_group, is_public)
VALUES ('margin_calculation_method', 'latest', 'report', 0)
ON DUPLICATE KEY UPDATE setting_key = setting_key;
