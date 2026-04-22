-- DeltaBox 2026 baseline seed
-- Run manually in PostgreSQL when the local DB is empty or needs reset.
-- This script intentionally marks only the first 3 rounds as COMPLETED.

BEGIN;

TRUNCATE TABLE race RESTART IDENTITY;
TRUNCATE TABLE driver RESTART IDENTITY;
TRUNCATE TABLE team RESTART IDENTITY CASCADE;

INSERT INTO team (name, nationality) VALUES
('Red Bull Racing', 'Austrian'),
('Ferrari', 'Italian'),
('McLaren', 'British'),
('Mercedes', 'German'),
('Aston Martin', 'British'),
('Alpine F1 Team', 'French'),
('Williams', 'British'),
('RB F1 Team', 'Italian'),
('Stake F1 Team Kick Sauber', 'Swiss'),
('Haas F1 Team', 'American');

INSERT INTO driver (code, name, nationality, team, points, season)
VALUES
('VER', 'Max Verstappen', 'Dutch', 'Red Bull Racing', 0, 2026),
('TSU', 'Yuki Tsunoda', 'Japanese', 'Red Bull Racing', 0, 2026),
('LEC', 'Charles Leclerc', 'Monegasque', 'Ferrari', 0, 2026),
('HAM', 'Lewis Hamilton', 'British', 'Ferrari', 0, 2026),
('NOR', 'Lando Norris', 'British', 'McLaren', 0, 2026),
('PIA', 'Oscar Piastri', 'Australian', 'McLaren', 0, 2026),
('RUS', 'George Russell', 'British', 'Mercedes', 0, 2026),
('ANT', 'Andrea Kimi Antonelli', 'Italian', 'Mercedes', 0, 2026),
('ALO', 'Fernando Alonso', 'Spanish', 'Aston Martin', 0, 2026),
('STR', 'Lance Stroll', 'Canadian', 'Aston Martin', 0, 2026),
('GAS', 'Pierre Gasly', 'French', 'Alpine F1 Team', 0, 2026),
('DOO', 'Jack Doohan', 'Australian', 'Alpine F1 Team', 0, 2026),
('ALB', 'Alexander Albon', 'Thai', 'Williams', 0, 2026),
('SAI', 'Carlos Sainz', 'Spanish', 'Williams', 0, 2026),
('LAW', 'Liam Lawson', 'New Zealander', 'RB F1 Team', 0, 2026),
('HAD', 'Isack Hadjar', 'French', 'RB F1 Team', 0, 2026),
('HUL', 'Nico Hulkenberg', 'German', 'Stake F1 Team Kick Sauber', 0, 2026),
('BOR', 'Gabriel Bortoleto', 'Brazilian', 'Stake F1 Team Kick Sauber', 0, 2026),
('OCO', 'Esteban Ocon', 'French', 'Haas F1 Team', 0, 2026),
('BEA', 'Oliver Bearman', 'British', 'Haas F1 Team', 0, 2026);

INSERT INTO race (driver_id, round, race_name, circuit_name, location, country, date, season, status, position)
VALUES
(NULL, 1, 'Australian Grand Prix', 'Albert Park Grand Prix Circuit', 'Melbourne', 'Australia', '2026-03-15', 2026, 'COMPLETED', NULL),
(NULL, 2, 'Chinese Grand Prix', 'Shanghai International Circuit', 'Shanghai', 'China', '2026-03-22', 2026, 'COMPLETED', NULL),
(NULL, 3, 'Japanese Grand Prix', 'Suzuka Circuit', 'Suzuka', 'Japan', '2026-04-05', 2026, 'COMPLETED', NULL),
(NULL, 4, 'Miami Grand Prix', 'Miami International Autodrome', 'Miami', 'USA', '2026-05-03', 2026, 'SCHEDULED', NULL),
(NULL, 5, 'Emilia Romagna Grand Prix', 'Autodromo Enzo e Dino Ferrari', 'Imola', 'Italy', '2026-05-17', 2026, 'SCHEDULED', NULL),
(NULL, 6, 'Monaco Grand Prix', 'Circuit de Monaco', 'Monte Carlo', 'Monaco', '2026-05-24', 2026, 'SCHEDULED', NULL),
(NULL, 7, 'Spanish Grand Prix', 'Circuit de Barcelona-Catalunya', 'Barcelona', 'Spain', '2026-06-07', 2026, 'SCHEDULED', NULL),
(NULL, 8, 'Canadian Grand Prix', 'Circuit Gilles Villeneuve', 'Montreal', 'Canada', '2026-06-14', 2026, 'SCHEDULED', NULL),
(NULL, 9, 'Austrian Grand Prix', 'Red Bull Ring', 'Spielberg', 'Austria', '2026-06-28', 2026, 'SCHEDULED', NULL),
(NULL, 10, 'British Grand Prix', 'Silverstone Circuit', 'Silverstone', 'UK', '2026-07-05', 2026, 'SCHEDULED', NULL),
(NULL, 11, 'Belgian Grand Prix', 'Circuit de Spa-Francorchamps', 'Spa', 'Belgium', '2026-07-26', 2026, 'SCHEDULED', NULL),
(NULL, 12, 'Hungarian Grand Prix', 'Hungaroring', 'Budapest', 'Hungary', '2026-08-02', 2026, 'SCHEDULED', NULL),
(NULL, 13, 'Dutch Grand Prix', 'Circuit Zandvoort', 'Zandvoort', 'Netherlands', '2026-08-30', 2026, 'SCHEDULED', NULL),
(NULL, 14, 'Italian Grand Prix', 'Autodromo Nazionale Monza', 'Monza', 'Italy', '2026-09-06', 2026, 'SCHEDULED', NULL),
(NULL, 15, 'Azerbaijan Grand Prix', 'Baku City Circuit', 'Baku', 'Azerbaijan', '2026-09-20', 2026, 'SCHEDULED', NULL),
(NULL, 16, 'Singapore Grand Prix', 'Marina Bay Street Circuit', 'Singapore', 'Singapore', '2026-10-04', 2026, 'SCHEDULED', NULL),
(NULL, 17, 'United States Grand Prix', 'Circuit of the Americas', 'Austin', 'USA', '2026-10-18', 2026, 'SCHEDULED', NULL),
(NULL, 18, 'Mexico City Grand Prix', 'Autodromo Hermanos Rodriguez', 'Mexico City', 'Mexico', '2026-10-25', 2026, 'SCHEDULED', NULL),
(NULL, 19, 'Sao Paulo Grand Prix', 'Interlagos', 'Sao Paulo', 'Brazil', '2026-11-08', 2026, 'SCHEDULED', NULL),
(NULL, 20, 'Las Vegas Grand Prix', 'Las Vegas Strip Circuit', 'Las Vegas', 'USA', '2026-11-21', 2026, 'SCHEDULED', NULL),
(NULL, 21, 'Qatar Grand Prix', 'Lusail International Circuit', 'Lusail', 'Qatar', '2026-11-29', 2026, 'SCHEDULED', NULL),
(NULL, 22, 'Abu Dhabi Grand Prix', 'Yas Marina Circuit', 'Abu Dhabi', 'UAE', '2026-12-06', 2026, 'SCHEDULED', NULL);

COMMIT;
