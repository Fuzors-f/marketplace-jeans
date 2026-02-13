-- Migration: Add email notification settings
-- Date: 2026-02-04

-- Add email_smtp_secure setting
INSERT INTO settings (setting_key, setting_value, setting_type, description, is_public, setting_group)
SELECT 'email_smtp_secure', 'false', 'boolean', 'Gunakan SSL/TLS', false, 'email'
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE setting_key = 'email_smtp_secure');

-- Add admin email address setting
INSERT INTO settings (setting_key, setting_value, setting_type, description, is_public, setting_group)
SELECT 'email_admin_address', '', 'text', 'Email admin untuk notifikasi pesanan', false, 'email'
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE setting_key = 'email_admin_address');

-- Add admin order notification toggle
INSERT INTO settings (setting_key, setting_value, setting_type, description, is_public, setting_group)
SELECT 'email_notify_admin_order', 'true', 'boolean', 'Kirim email ke admin saat ada pesanan baru', false, 'email'
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE setting_key = 'email_notify_admin_order');

-- Add user order notification toggle
INSERT INTO settings (setting_key, setting_value, setting_type, description, is_public, setting_group)
SELECT 'email_notify_user_order', 'true', 'boolean', 'Kirim email ke customer saat checkout', false, 'email'
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE setting_key = 'email_notify_user_order');

-- Show result
SELECT 'Email notification settings added successfully' AS message;
