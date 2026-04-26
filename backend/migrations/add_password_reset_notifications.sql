-- Migration: Add password reset tokens + notifications table
-- Date: Phase 2

-- 1. Password reset tokens on users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255) NULL AFTER password,
  ADD COLUMN IF NOT EXISTS password_reset_expires DATETIME NULL AFTER password_reset_token;

CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(password_reset_token);

-- 2. Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL COMMENT 'NULL = admin notification',
  type VARCHAR(50) NOT NULL COMMENT 'new_order, payment_received, order_status_update, order_delivered, etc.',
  title VARCHAR(255) NOT NULL,
  message TEXT NULL,
  reference_id INT NULL COMMENT 'order_id or related entity id',
  reference_type VARCHAR(50) NULL COMMENT 'order, payment, etc.',
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  for_admin TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 = visible to admin, 0 = visible to user',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notif_user_id (user_id),
  INDEX idx_notif_admin (for_admin, is_read),
  INDEX idx_notif_created (created_at),
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
