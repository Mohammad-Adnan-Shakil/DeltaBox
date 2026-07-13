-- V6: Add favorite_driver column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS favorite_driver VARCHAR(255);
