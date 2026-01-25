-- Add setting_group column to settings table
ALTER TABLE settings ADD COLUMN setting_group VARCHAR(50) DEFAULT 'general' AFTER is_public;

-- Create index for faster group queries
CREATE INDEX idx_setting_group ON settings(setting_group);
