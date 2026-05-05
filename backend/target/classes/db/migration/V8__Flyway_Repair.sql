-- Flyway repair migration
-- This migration addresses any remaining Flyway metadata issues

-- Ensure favorite_driver column exists (idempotent)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS favorite_driver VARCHAR(20);

-- Create index for performance (idempotent)
CREATE INDEX IF NOT EXISTS idx_users_favorite_driver ON users(favorite_driver);
