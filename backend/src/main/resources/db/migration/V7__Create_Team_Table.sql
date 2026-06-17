-- Create team table for F1 teams
CREATE TABLE IF NOT EXISTS team (
    id IDENTITY PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    nationality VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_team_name ON team(name);
