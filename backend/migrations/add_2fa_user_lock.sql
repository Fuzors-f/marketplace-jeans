-- =====================================================
-- Migration: Add 2FA and User Lock features to users
-- =====================================================

-- 2FA columns
ALTER TABLE `users`
  ADD COLUMN IF NOT EXISTS `two_fa_enabled`      TINYINT(1)   NOT NULL DEFAULT 0 AFTER `is_active`,
  ADD COLUMN IF NOT EXISTS `two_fa_code`          VARCHAR(10)  DEFAULT NULL AFTER `two_fa_enabled`,
  ADD COLUMN IF NOT EXISTS `two_fa_code_expires`  DATETIME     DEFAULT NULL AFTER `two_fa_code`;

-- User lock columns
ALTER TABLE `users`
  ADD COLUMN IF NOT EXISTS `is_locked`      TINYINT(1)   NOT NULL DEFAULT 0 AFTER `two_fa_code_expires`,
  ADD COLUMN IF NOT EXISTS `locked_at`      DATETIME     DEFAULT NULL AFTER `is_locked`,
  ADD COLUMN IF NOT EXISTS `locked_reason`  VARCHAR(255) DEFAULT NULL AFTER `locked_at`;

-- Indexes for performance
ALTER TABLE `users`
  ADD INDEX IF NOT EXISTS `idx_users_is_locked` (`is_locked`),
  ADD INDEX IF NOT EXISTS `idx_users_two_fa_enabled` (`two_fa_enabled`);
