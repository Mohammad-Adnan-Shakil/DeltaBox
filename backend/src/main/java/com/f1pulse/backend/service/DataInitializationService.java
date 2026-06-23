package com.f1pulse.backend.service;

/**
 * DISABLED - Disabled on 2026-05-05
 *
 * Reason: caused a JPA/database access conflict during application startup, because it ran before the
 * datasource was fully initialized in production.
 *
 * Condition for re-enabling: confirm Postgres connection pool / datasource initialization order is
 * resolved first (note that the app has since migrated to Neon Postgres, which may have changed startup
 * timing — re-verify before re-enabling, don't assume the original conflict still applies as-is).
 *
 * Do not silently re-enable without re-testing production startup.
 */
public class DataInitializationService {
}
