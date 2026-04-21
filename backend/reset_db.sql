-- ⚠️ CAUTION: This script DROPS ALL TABLES
-- Only run this if you want to reset the database completely

-- Drop flyway history
DROP TABLE IF EXISTS flyway_schema_history;

-- Drop historical tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS historical_result;
DROP TABLE IF EXISTS historical_race;
DROP TABLE IF EXISTS historical_constructor;
DROP TABLE IF EXISTS historical_driver;
DROP TABLE IF EXISTS historical_season;

-- Drop existing 2026 season tables
DROP TABLE IF EXISTS result;
DROP TABLE IF EXISTS race;
DROP TABLE IF EXISTS driver_team;
DROP TABLE IF EXISTS driver;
DROP TABLE IF EXISTS team;
DROP TABLE IF EXISTS constructor;
DROP TABLE IF EXISTS users;

-- Create users table (base table)
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE,
    role VARCHAR(50) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMIT;
