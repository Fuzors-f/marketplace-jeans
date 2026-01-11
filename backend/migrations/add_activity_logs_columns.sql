-- Migration: Add missing columns to activity_logs table
-- Date: 2026-01-11
-- Description: Add request_url, request_method, and metadata columns to activity_logs

-- Add request_url column for storing the API endpoint accessed
ALTER TABLE activity_logs 
ADD COLUMN IF NOT EXISTS request_url VARCHAR(500) NULL AFTER user_agent;

-- Add request_method column for storing HTTP method (GET, POST, PUT, DELETE)
ALTER TABLE activity_logs 
ADD COLUMN IF NOT EXISTS request_method VARCHAR(10) NULL AFTER request_url;

-- Add metadata column for storing additional JSON data
ALTER TABLE activity_logs 
ADD COLUMN IF NOT EXISTS metadata JSON NULL AFTER request_method;

-- Add index for faster queries on request_url
ALTER TABLE activity_logs
ADD INDEX IF NOT EXISTS idx_request_url (request_url(255));

-- Verify the columns were added
-- SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
-- FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_NAME = 'activity_logs' 
-- AND COLUMN_NAME IN ('request_url', 'request_method', 'metadata');
