-- Create telemetry cache table for multi-layer caching strategy
-- This table stores telemetry data with session and driver context
-- Cache keys use format: sessionKey_driverNumber (e.g., "9158_1")

CREATE TABLE telemetry_cache (
    id BIGSERIAL PRIMARY KEY,
    session_key VARCHAR(50) NOT NULL,           -- e.g., "9158"
    driver_number INTEGER NOT NULL,           -- e.g., 1, 2, 3
    meeting_key VARCHAR(20) NOT NULL,        -- e.g., "1217"
    telemetry_json JSONB NOT NULL,             -- Complete telemetry data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Composite index for efficient cache lookups
    UNIQUE (session_key, driver_number)
);

-- Add indexes for performance
CREATE INDEX idx_telemetry_cache_session_driver ON telemetry_cache(session_key, driver_number);
CREATE INDEX idx_telemetry_cache_created_at ON telemetry_cache(created_at);
CREATE INDEX idx_telemetry_cache_last_accessed ON telemetry_cache(last_accessed);

-- Add comment for documentation
COMMENT ON TABLE telemetry_cache IS 'Multi-layer cache for telemetry data with session and driver context';
