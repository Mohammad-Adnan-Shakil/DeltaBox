-- ========================================
-- SEED HISTORICAL RACE RESULTS - 2026 Season
-- ========================================
-- Populate historical_result table for COMPLETED races (1-3)
-- Races reference:
--   Race 1: Australian Grand Prix (ID=1)
--   Race 2: Chinese Grand Prix (ID=2) 
--   Race 3: Japanese Grand Prix (ID=3)
-- Driver/Constructor mappings use IDs from seeded data

-- ===== RACE 1: AUSTRALIAN GRAND PRIX =====
INSERT INTO historical_result (race_id, driver_id, constructor_id, grid_position, finish_position, points, status) 
VALUES 
(1, 6, 3, 1, 1, 25.0, 'Finished'),    -- P1: Oscar Piastri (McLaren)
(1, 1, 1, 2, 2, 18.0, 'Finished'),    -- P2: Max Verstappen (Red Bull)
(1, 3, 2, 3, 3, 15.0, 'Finished'),    -- P3: Charles Leclerc (Ferrari)
(1, 7, 4, 4, 4, 12.0, 'Finished'),    -- P4: George Russell (Mercedes)
(1, 5, 3, 5, 5, 10.0, 'Finished'),    -- P5: Lando Norris (McLaren)
(1, 4, 2, 6, 6, 8.0, 'Finished'),     -- P6: Lewis Hamilton (Ferrari)
(1, 9, 5, 7, 7, 6.0, 'Finished'),     -- P7: Fernando Alonso (Aston Martin)
(1, 13, 7, 8, 8, 4.0, 'Finished'),    -- P8: Alexander Albon (Williams)
(1, 2, 1, 9, 9, 2.0, 'Finished'),     -- P9: Yuki Tsunoda (Red Bull)
(1, 15, 8, 10, 10, 1.0, 'Finished');  -- P10: Liam Lawson (RB)

-- ===== RACE 2: CHINESE GRAND PRIX =====
INSERT INTO historical_result (race_id, driver_id, constructor_id, grid_position, finish_position, points, status) 
VALUES 
(2, 1, 1, 1, 1, 25.0, 'Finished'),    -- P1: Max Verstappen (Red Bull)
(2, 3, 2, 2, 2, 18.0, 'Finished'),    -- P2: Charles Leclerc (Ferrari)
(2, 6, 3, 3, 3, 15.0, 'Finished'),    -- P3: Oscar Piastri (McLaren)
(2, 5, 3, 4, 4, 12.0, 'Finished'),    -- P4: Lando Norris (McLaren)
(2, 7, 4, 5, 5, 10.0, 'Finished'),    -- P5: George Russell (Mercedes)
(2, 4, 2, 6, 6, 8.0, 'Finished'),     -- P6: Lewis Hamilton (Ferrari)
(2, 8, 4, 7, 7, 6.0, 'Finished'),     -- P7: Andrea Antonelli (Mercedes)
(2, 10, 5, 8, 8, 4.0, 'Finished'),    -- P8: Lance Stroll (Aston Martin)
(2, 17, 9, 9, 9, 2.0, 'Finished'),    -- P9: Nico Hulkenberg (Stake)
(2, 19, 10, 10, 10, 1.0, 'Finished'); -- P10: Esteban Ocon (Haas)

-- ===== RACE 3: JAPANESE GRAND PRIX =====
INSERT INTO historical_result (race_id, driver_id, constructor_id, grid_position, finish_position, points, status) 
VALUES 
(3, 1, 1, 1, 1, 25.0, 'Finished'),    -- P1: Max Verstappen (Red Bull)
(3, 6, 3, 2, 2, 18.0, 'Finished'),    -- P2: Oscar Piastri (McLaren)
(3, 4, 2, 3, 3, 15.0, 'Finished'),    -- P3: Lewis Hamilton (Ferrari)
(3, 5, 3, 4, 4, 12.0, 'Finished'),    -- P4: Lando Norris (McLaren)
(3, 7, 4, 5, 5, 10.0, 'Finished'),    -- P5: George Russell (Mercedes)
(3, 3, 2, 6, 6, 8.0, 'Finished'),     -- P6: Charles Leclerc (Ferrari)
(3, 9, 5, 7, 7, 6.0, 'Finished'),     -- P7: Fernando Alonso (Aston Martin)
(3, 2, 1, 8, 8, 4.0, 'Finished'),     -- P8: Yuki Tsunoda (Red Bull)
(3, 11, 6, 9, 9, 2.0, 'Finished'),    -- P9: Pierre Gasly (Alpine)
(3, 18, 9, 10, 10, 1.0, 'Finished');  -- P10: Gabriel Bortoleto (Stake)
