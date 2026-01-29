-- Migration: Add columns for Midtrans payment integration
-- Run this migration to add necessary columns to the payments table

-- Add snap_token column for Midtrans Snap
ALTER TABLE payments ADD COLUMN IF NOT EXISTS snap_token VARCHAR(255) NULL AFTER payment_url;

-- Add va_number column for Virtual Account payments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS va_number VARCHAR(100) NULL AFTER snap_token;

-- Update existing settings with new Midtrans settings
INSERT INTO settings (setting_key, setting_value, setting_type, description, is_public, setting_group) VALUES
('payment_midtrans_enabled', 'false', 'boolean', 'Aktifkan Midtrans', 0, 'payment'),
('payment_midtrans_server_key', '', 'password', 'Midtrans Server Key', 0, 'payment'),
('payment_midtrans_client_key', '', 'text', 'Midtrans Client Key', 1, 'payment'),
('payment_midtrans_sandbox', 'true', 'boolean', 'Gunakan Sandbox Mode', 0, 'payment'),
('email_smtp_host', '', 'text', 'SMTP Host', 0, 'email'),
('email_smtp_port', '587', 'text', 'SMTP Port', 0, 'email'),
('email_smtp_user', '', 'text', 'SMTP Username', 0, 'email'),
('email_smtp_pass', '', 'password', 'SMTP Password', 0, 'email'),
('email_from_name', '', 'text', 'Nama pengirim email', 0, 'email'),
('email_from_address', '', 'text', 'Alamat email pengirim', 0, 'email')
ON DUPLICATE KEY UPDATE setting_key = setting_key;
