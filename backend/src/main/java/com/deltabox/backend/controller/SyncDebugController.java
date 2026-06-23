package com.deltabox.backend.controller;

import com.deltabox.backend.service.SyncService;
import com.deltabox.backend.model.Race;
import com.deltabox.backend.repository.RaceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/debug")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class SyncDebugController {

    private static final Logger log = LoggerFactory.getLogger(SyncDebugController.class);
    private final SyncService syncService;
    private final RaceRepository raceRepository;

    public SyncDebugController(SyncService syncService, RaceRepository raceRepository) {
        this.syncService = syncService;
        this.raceRepository = raceRepository;
    }

    @PostMapping("/sync-races")
    public ResponseEntity<?> syncRaces() {
        log.info("========== MANUAL SYNC TRIGGERED ==========");
        try {
            List<Race> result = syncService.syncRaces();
            
            // Get stats after sync
            List<Race> allRaces = raceRepository.findAll();
            long scheduleCount = allRaces.stream().filter(r -> r.getDriverId() == null).count();
            long resultCount = allRaces.stream().filter(r -> r.getDriverId() != null).count();
            
            log.info("Sync completed. Total races: {}, Schedule rows: {}, Result rows: {}", 
                allRaces.size(), scheduleCount, resultCount);
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Sync completed",
                "scheduleRows", scheduleCount,
                "resultRows", resultCount,
                "totalRaces", allRaces.size()
            ));
        } catch (Exception e) {
            log.error("Error during manual sync", e);
            return ResponseEntity.status(500).body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/race-stats")
    public ResponseEntity<?> getRaceStats() {
        try {
            List<Race> allRaces = raceRepository.findAll();
            long scheduleCount = allRaces.stream().filter(r -> r.getDriverId() == null).count();
            long resultCount = allRaces.stream().filter(r -> r.getDriverId() != null).count();
            
            log.info("Race stats: Schedule rows: {}, Result rows: {}, Total: {}", 
                scheduleCount, resultCount, allRaces.size());
            
            return ResponseEntity.ok(Map.of(
                "scheduleRows", scheduleCount,
                "resultRows", resultCount,
                "totalRaces", allRaces.size(),
                "scheduleExample", allRaces.stream()
                    .filter(r -> r.getDriverId() == null)
                    .findFirst()
                    .map(r -> Map.of("id", r.getId(), "round", r.getRound(), "name", r.getRaceName()))
                    .orElse(Map.of()),
                "resultExample", allRaces.stream()
                    .filter(r -> r.getDriverId() != null)
                    .findFirst()
                    .map(r -> Map.of("id", r.getId(), "round", r.getRound(), "driverId", r.getDriverId(), "position", r.getPosition()))
                    .orElse(Map.of())
            ));
        } catch (Exception e) {
            log.error("Error getting race stats", e);
            return ResponseEntity.status(500).body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        }
    }
}
