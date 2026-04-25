-- Migration: Enhanced user & guest activity tracking
-- Date: 2026-04-25
-- Description: Add session_id for guest tracking, user_type column, and performance indexes

-- Add session_id for guest tracking (sent from frontend as x-session-id header)
ALTER TABLE activity_logs
ADD COLUMN IF NOT EXISTS session_id VARCHAR(100) NULL AFTER user_id;

-- Add user_type to quickly differentiate guest vs registered vs admin
ALTER TABLE activity_logs
ADD COLUMN IF NOT EXISTS user_type ENUM('guest','member','admin','admin_stok') NULL AFTER session_id;

-- Add page_path for front-end page visit tracking
ALTER TABLE activity_logs
ADD COLUMN IF NOT EXISTS page_path VARCHAR(500) NULL AFTER metadata;

-- Indexes for common query patterns
ALTER TABLE activity_logs
ADD INDEX IF NOT EXISTS idx_session_id (session_id),
ADD INDEX IF NOT EXISTS idx_user_type (user_type),
ADD INDEX IF NOT EXISTS idx_created_at_user (created_at, user_id),
ADD INDEX IF NOT EXISTS idx_action_date (action, created_at);
