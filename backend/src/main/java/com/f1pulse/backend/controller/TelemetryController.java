package com.f1pulse.backend.controller;

import com.f1pulse.backend.dto.ApiResponse;
import com.f1pulse.backend.service.TelemetryService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Production-grade telemetry controller
 * Uses race IDs and session keys instead of race names
 * Implements proper caching and error handling
 */
@RestController
@RequestMapping("/api/telemetry")
@Tag(name = "Telemetry Intelligence", description = "F1 telemetry data and analysis")
@CrossOrigin(origins = {"http://localhost:5173", "https://deltabox-frontend.vercel.app"})
public class TelemetryController {

    private static final Logger log = LoggerFactory.getLogger(TelemetryController.class);

    @Autowired
    private TelemetryService telemetryService;

    /**
     * Get available seasons for telemetry
     */
    @GetMapping("/seasons")
    public ResponseEntity<ApiResponse<List<String>>> getAvailableSeasons(
            @RequestParam(defaultValue = "latest") String sessionKey) {
        try {
            List<String> seasons = telemetryService.getAvailableSeasons(sessionKey);
            log.info("Retrieved {} seasons for session: {}", seasons.size(), sessionKey);
            return ResponseEntity.ok(new ApiResponse<>(true, "Seasons retrieved successfully", seasons));
        } catch (Exception e) {
            log.error("Failed to retrieve seasons: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(new ApiResponse<>(false, "Failed to retrieve seasons", null));
        }
    }

    /**
     * Get available meetings for a season
     */
    @GetMapping("/meetings")
    public ResponseEntity<ApiResponse<List<String>>> getAvailableMeetings(
            @RequestParam(defaultValue = "latest") String sessionKey,
            @RequestParam(defaultValue = "2026") String season) {
        try {
            List<String> meetings = telemetryService.getAvailableMeetings(sessionKey, season);
            log.info("Retrieved {} meetings for season {} session: {}", meetings.size(), season, sessionKey);
            return ResponseEntity.ok(new ApiResponse<>(true, "Meetings retrieved successfully", meetings));
        } catch (Exception e) {
            log.error("Failed to retrieve meetings: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(new ApiResponse<>(false, "Failed to retrieve meetings", null));
        }
    }

    /**
     * Get available drivers for a meeting
     */
    @GetMapping("/drivers")
    public ResponseEntity<ApiResponse<List<String>>> getAvailableDrivers(
            @RequestParam(defaultValue = "latest") String sessionKey,
            @RequestParam(defaultValue = "latest") String meetingKey) {
        try {
            List<String> drivers = telemetryService.getAvailableDrivers(sessionKey, meetingKey);
            log.info("Retrieved {} drivers for meeting {} session: {}", drivers.size(), meetingKey, sessionKey);
            return ResponseEntity.ok(new ApiResponse<>(true, "Drivers retrieved successfully", drivers));
        } catch (Exception e) {
            log.error("Failed to retrieve drivers: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(new ApiResponse<>(false, "Failed to retrieve drivers", null));
        }
    }

    /**
     * Get telemetry data for specific driver and session
     */
    @GetMapping("/data")
    public ResponseEntity<ApiResponse<String>> getTelemetryData(
            @RequestParam(defaultValue = "latest") String sessionKey,
            @RequestParam(defaultValue = "latest") String meetingKey,
            @RequestParam(defaultValue = "1") Integer driverNumber) {
        try {
            String telemetryData = telemetryService.getTelemetryData(sessionKey, driverNumber, meetingKey);
            log.info("Retrieved telemetry for driver {} in meeting {} session: {}", driverNumber, meetingKey, sessionKey);
            
            if (telemetryData != null) {
                return ResponseEntity.ok(new ApiResponse<>(true, "Telemetry data retrieved successfully", telemetryData));
            } else {
                return ResponseEntity.status(404)
                        .body(new ApiResponse<>(false, "Telemetry data not available", null));
            }
        } catch (Exception e) {
            log.error("Failed to retrieve telemetry data: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(new ApiResponse<>(false, "Failed to retrieve telemetry data", null));
        }
    }
}
