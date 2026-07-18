-- ========================================
-- SEED RACE RESULTS INTO race TABLE
-- ========================================
-- V11 incorrectly seeded historical_result instead of race.
-- The race table had schedule rows (V10) with driver_id=null,
-- causing PredictionServiceImpl's feature queries to return
-- empty and all 12 features to default to 10.0.
--
-- This migration inserts per-driver result rows into the
-- correct race table for the 3 COMPLETED races, matching
-- what SyncService produces at runtime.

-- ===== RACE 1: AUSTRALIAN GRAND PRIX (round=1) =====
INSERT INTO race (round, race_name, circuit_name, location, country, date, season, status, driver_id, position) VALUES
(1, 'Australian Grand Prix', 'Albert Park Grand Prix Circuit', 'Melbourne', 'Australia', '2026-03-15', 2026, 'COMPLETED', 6, 1),
(1, 'Australian Grand Prix', 'Albert Park Grand Prix Circuit', 'Melbourne', 'Australia', '2026-03-15', 2026, 'COMPLETED', 1, 2),
(1, 'Australian Grand Prix', 'Albert Park Grand Prix Circuit', 'Melbourne', 'Australia', '2026-03-15', 2026, 'COMPLETED', 3, 3),
(1, 'Australian Grand Prix', 'Albert Park Grand Prix Circuit', 'Melbourne', 'Australia', '2026-03-15', 2026, 'COMPLETED', 7, 4),
(1, 'Australian Grand Prix', 'Albert Park Grand Prix Circuit', 'Melbourne', 'Australia', '2026-03-15', 2026, 'COMPLETED', 5, 5),
(1, 'Australian Grand Prix', 'Albert Park Grand Prix Circuit', 'Melbourne', 'Australia', '2026-03-15', 2026, 'COMPLETED', 4, 6),
(1, 'Australian Grand Prix', 'Albert Park Grand Prix Circuit', 'Melbourne', 'Australia', '2026-03-15', 2026, 'COMPLETED', 9, 7),
(1, 'Australian Grand Prix', 'Albert Park Grand Prix Circuit', 'Melbourne', 'Australia', '2026-03-15', 2026, 'COMPLETED', 13, 8),
(1, 'Australian Grand Prix', 'Albert Park Grand Prix Circuit', 'Melbourne', 'Australia', '2026-03-15', 2026, 'COMPLETED', 2, 9),
(1, 'Australian Grand Prix', 'Albert Park Grand Prix Circuit', 'Melbourne', 'Australia', '2026-03-15', 2026, 'COMPLETED', 15, 10);

-- ===== RACE 2: CHINESE GRAND PRIX (round=2) =====
INSERT INTO race (round, race_name, circuit_name, location, country, date, season, status, driver_id, position) VALUES
(2, 'Chinese Grand Prix', 'Shanghai International Circuit', 'Shanghai', 'China', '2026-03-22', 2026, 'COMPLETED', 1, 1),
(2, 'Chinese Grand Prix', 'Shanghai International Circuit', 'Shanghai', 'China', '2026-03-22', 2026, 'COMPLETED', 3, 2),
(2, 'Chinese Grand Prix', 'Shanghai International Circuit', 'Shanghai', 'China', '2026-03-22', 2026, 'COMPLETED', 6, 3),
(2, 'Chinese Grand Prix', 'Shanghai International Circuit', 'Shanghai', 'China', '2026-03-22', 2026, 'COMPLETED', 5, 4),
(2, 'Chinese Grand Prix', 'Shanghai International Circuit', 'Shanghai', 'China', '2026-03-22', 2026, 'COMPLETED', 7, 5),
(2, 'Chinese Grand Prix', 'Shanghai International Circuit', 'Shanghai', 'China', '2026-03-22', 2026, 'COMPLETED', 4, 6),
(2, 'Chinese Grand Prix', 'Shanghai International Circuit', 'Shanghai', 'China', '2026-03-22', 2026, 'COMPLETED', 8, 7),
(2, 'Chinese Grand Prix', 'Shanghai International Circuit', 'Shanghai', 'China', '2026-03-22', 2026, 'COMPLETED', 10, 8),
(2, 'Chinese Grand Prix', 'Shanghai International Circuit', 'Shanghai', 'China', '2026-03-22', 2026, 'COMPLETED', 17, 9),
(2, 'Chinese Grand Prix', 'Shanghai International Circuit', 'Shanghai', 'China', '2026-03-22', 2026, 'COMPLETED', 19, 10);

-- ===== RACE 3: JAPANESE GRAND PRIX (round=3) =====
INSERT INTO race (round, race_name, circuit_name, location, country, date, season, status, driver_id, position) VALUES
(3, 'Japanese Grand Prix', 'Suzuka Circuit', 'Suzuka', 'Japan', '2026-04-05', 2026, 'COMPLETED', 1, 1),
(3, 'Japanese Grand Prix', 'Suzuka Circuit', 'Suzuka', 'Japan', '2026-04-05', 2026, 'COMPLETED', 6, 2),
(3, 'Japanese Grand Prix', 'Suzuka Circuit', 'Suzuka', 'Japan', '2026-04-05', 2026, 'COMPLETED', 4, 3),
(3, 'Japanese Grand Prix', 'Suzuka Circuit', 'Suzuka', 'Japan', '2026-04-05', 2026, 'COMPLETED', 5, 4),
(3, 'Japanese Grand Prix', 'Suzuka Circuit', 'Suzuka', 'Japan', '2026-04-05', 2026, 'COMPLETED', 7, 5),
(3, 'Japanese Grand Prix', 'Suzuka Circuit', 'Suzuka', 'Japan', '2026-04-05', 2026, 'COMPLETED', 3, 6),
(3, 'Japanese Grand Prix', 'Suzuka Circuit', 'Suzuka', 'Japan', '2026-04-05', 2026, 'COMPLETED', 9, 7),
(3, 'Japanese Grand Prix', 'Suzuka Circuit', 'Suzuka', 'Japan', '2026-04-05', 2026, 'COMPLETED', 2, 8),
(3, 'Japanese Grand Prix', 'Suzuka Circuit', 'Suzuka', 'Japan', '2026-04-05', 2026, 'COMPLETED', 11, 9),
(3, 'Japanese Grand Prix', 'Suzuka Circuit', 'Suzuka', 'Japan', '2026-04-05', 2026, 'COMPLETED', 18, 10);
