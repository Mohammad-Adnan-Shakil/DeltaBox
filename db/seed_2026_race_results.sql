-- DeltaBox 2026 Race Results Seed Data
-- Populates the historical_result table with podium finishers for the first 3 completed races
-- Run this script after seed_2026_season.sql

BEGIN;

-- Ensure we're working with clean data
DELETE FROM historical_result WHERE race_id IN (1, 2, 3);

-- Get team IDs (needed for constructor associations)
-- These will be populated based on the driver's team as defined in the driver table

-- RACE 1: Australian Grand Prix (Round 1)
-- Using race_id = 1, driver_id based on seed data
-- Top 3 finishers with realistic F1 results
INSERT INTO historical_result (race_id, driver_id, constructor_id, grid_position, finish_position, points, status, fastest_lap_time, created_at, updated_at)
VALUES
-- P1: Max Verstappen (driver_id=1, Red Bull Racing)
(1, 1, NULL, 1, 1, 25.00, 'Finished', '1:27.245', NOW(), NOW()),
-- P2: Lewis Hamilton (driver_id=4, Ferrari) 
(1, 4, NULL, 3, 2, 18.00, 'Finished', '1:27.512', NOW(), NOW()),
-- P3: Charles Leclerc (driver_id=3, Ferrari)
(1, 3, NULL, 2, 3, 15.00, 'Finished', '1:27.789', NOW(), NOW()),

-- RACE 2: Chinese Grand Prix (Round 2)
-- race_id = 2
-- Different winner to show variety
INSERT INTO historical_result (race_id, driver_id, constructor_id, grid_position, finish_position, points, status, fastest_lap_time, created_at, updated_at)
VALUES
-- P1: Charles Leclerc (driver_id=3, Ferrari)
(2, 3, NULL, 2, 1, 25.00, 'Finished', '1:34.123', NOW(), NOW()),
-- P2: Max Verstappen (driver_id=1, Red Bull Racing)
(2, 1, NULL, 1, 2, 18.00, 'Finished', '1:34.456', NOW(), NOW()),
-- P3: Lando Norris (driver_id=5, McLaren)
(2, 5, NULL, 4, 3, 15.00, 'Finished', '1:34.678', NOW(), NOW()),

-- RACE 3: Japanese Grand Prix (Round 3)
-- race_id = 3
-- Another variation of winners
INSERT INTO historical_result (race_id, driver_id, constructor_id, grid_position, finish_position, points, status, fastest_lap_time, created_at, updated_at)
VALUES
-- P1: Lando Norris (driver_id=5, McLaren)
(3, 5, NULL, 1, 1, 25.00, 'Finished', '1:28.901', NOW(), NOW()),
-- P2: Oscar Piastri (driver_id=6, McLaren)
(3, 6, NULL, 3, 2, 18.00, 'Finished', '1:29.234', NOW(), NOW()),
-- P3: Max Verstappen (driver_id=1, Red Bull Racing)
(3, 1, NULL, 2, 3, 15.00, 'Finished', '1:29.567', NOW(), NOW());

COMMIT;
