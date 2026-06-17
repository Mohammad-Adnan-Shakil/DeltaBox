-- Create driver table for F1 drivers
CREATE TABLE IF NOT EXISTS driver (
    id IDENTITY PRIMARY KEY,
    code VARCHAR(10),
    name VARCHAR(255),
    nationality VARCHAR(100),
    team_id BIGINT,
    team VARCHAR(255),
    season INTEGER DEFAULT 2026,
    points DOUBLE PRECISION DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(code, season),
    FOREIGN KEY (team_id) REFERENCES team(id)
);

CREATE INDEX IF NOT EXISTS idx_driver_code ON driver(code);
CREATE INDEX IF NOT EXISTS idx_driver_season ON driver(season);
CREATE INDEX IF NOT EXISTS idx_driver_team_id ON driver(team_id);
