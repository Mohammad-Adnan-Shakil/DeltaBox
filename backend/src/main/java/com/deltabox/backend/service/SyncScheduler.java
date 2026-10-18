package com.deltabox.backend.service;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "security.enabled", havingValue = "true", matchIfMissing = true)
public class SyncScheduler {
    private final SyncService syncService;

    public SyncScheduler(SyncService syncService) {
        this.syncService = syncService;
    }

    @Scheduled(cron = "${sync.cron:0 0 6 * * *}", zone = "UTC")
    public void syncAllAutomatically() {
        syncService.syncTeams();
        syncService.syncDrivers();
        syncService.syncRaces();
        syncService.deduplicateScheduleRows(2026);
    }
}