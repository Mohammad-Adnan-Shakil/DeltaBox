-- Add favorite_driver column to users table
-- This migration fixes any missing favorite_driver column issues

ALTER TABLE users
ADD COLUMN IF NOT EXISTS favorite_driver VARCHAR(20);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_users_favorite_driver ON users(favorite_driver);
