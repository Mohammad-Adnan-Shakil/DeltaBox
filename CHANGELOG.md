# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-19

### Added

- **Phase 3 — Apex Intelligence presets, guide cards, Race Engineer polish** ([23dc4cb](https://github.com/Mohammad-Adnan-Shakil/DeltaBox/commit/23dc4cb))
- **Phase 2 — Scenario Engine with 6 live strategy calculators** ([598c8f6](https://github.com/Mohammad-Adnan-Shakil/DeltaBox/commit/598c8f6))
- **Phase 1 — OpenF1 live/replay data pipeline for Race Engineer** ([d2684e9](https://github.com/Mohammad-Adnan-Shakil/DeltaBox/commit/d2684e9))
- Dashboard DRIVERS and RACES stat cards now clickable ([5d19134](https://github.com/Mohammad-Adnan-Shakil/DeltaBox/commit/5d19134))
- User activity history with 20-per-tool cap across all 3 AI features ([07a3811](https://github.com/Mohammad-Adnan-Shakil/DeltaBox/commit/07a3811))
- DriverDetail page at /drivers/:driverId with real data ([73cf8e3](https://github.com/Mohammad-Adnan-Shakil/DeltaBox/commit/73cf8e3))
- Removed Race Progress chart, added clickable driver/race names ([0169396](https://github.com/Mohammad-Adnan-Shakil/DeltaBox/commit/0169396))

### Fixed

- Extended grid position support from 20 to 22 for 2026 season ([f109667](https://github.com/Mohammad-Adnan-Shakil/DeltaBox/commit/f109667))
- Resolved race status from single authoritative source ([630f034](https://github.com/Mohammad-Adnan-Shakil/DeltaBox/commit/630f034))
- Updated README.md ([be5c617](https://github.com/Mohammad-Adnan-Shakil/DeltaBox/commit/be5c617))
- Repointed prediction features to live sync source, removed V13 static seed ([dbefee2](https://github.com/Mohammad-Adnan-Shakil/DeltaBox/commit/dbefee2))
- Seeded race table with per-driver results, added clamping + insufficientData flag ([b1e4fe1](https://github.com/Mohammad-Adnan-Shakil/DeltaBox/commit/b1e4fe1))
- Preset titles grounded in ML test results + full design system audit fixes ([361c13c](https://github.com/Mohammad-Adnan-Shakil/DeltaBox/commit/361c13c))
- Added @JdbcTypeCode(SqlTypes.JSON) to payload field for jsonb mapping ([476d929](https://github.com/Mohammad-Adnan-Shakil/DeltaBox/commit/476d929))
- Removed duplicate /api prefix in history frontend calls ([649d639](https://github.com/Mohammad-Adnan-Shakil/DeltaBox/commit/649d639))
- Wired driver cards and race results table, removed Google OAuth remnant ([d78107d](https://github.com/Mohammad-Adnan-Shakil/DeltaBox/commit/d78107d))
- Updated remaining /actuator/health references to /api/health ([1100a9b](https://github.com/Mohammad-Adnan-Shakil/DeltaBox/commit/1100a9b))
- Switched health check from /actuator/health to /api/health ([eb81928](https://github.com/Mohammad-Adnan-Shakil/DeltaBox/commit/eb81928))
- Permitted /actuator/health and /actuator/** in SecurityConfig ([17febd4](https://github.com/Mohammad-Adnan-Shakil/DeltaBox/commit/17febd4))

### Removed

- Removed Path B (driver-intelligence) and GraalVM leftovers ([956883a](https://github.com/Mohammad-Adnan-Shakil/DeltaBox/commit/956883a))

### Changed

- Reordered changelog

### Security

- JWT authentication with access (24h) + refresh (7d) tokens
- Role-based access control on all API endpoints
- Custom database URL EnvironmentPostProcessor for secure credential handling
