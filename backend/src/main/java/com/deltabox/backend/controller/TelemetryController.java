package com.deltabox.backend.controller;

import com.deltabox.backend.ai.dto.TelemetryAnalysisRequest;
import com.deltabox.backend.ai.service.TelemetryAnalysisService;
import com.deltabox.backend.service.TelemetryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/telemetry")
public class TelemetryController {

    private final TelemetryService telemetryService;
    private final TelemetryAnalysisService telemetryAnalysisService;

    public TelemetryController(TelemetryService telemetryService, TelemetryAnalysisService telemetryAnalysisService) {
        this.telemetryService = telemetryService;
        this.telemetryAnalysisService = telemetryAnalysisService;
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<Map<String, Object>>> getSessions() {
        List<Map<String, Object>> sessions = telemetryService.getSessions();
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/drivers")
    public ResponseEntity<List<Map<String, Object>>> getDrivers(@RequestParam long sessionKey) {
        List<Map<String, Object>> drivers = telemetryService.getDrivers(sessionKey);
        return ResponseEntity.ok(drivers);
    }

    @GetMapping("/laps")
    public ResponseEntity<List<Map<String, Object>>> getLaps(@RequestParam long sessionKey, @RequestParam int driverNumber) {
        List<Map<String, Object>> laps = telemetryService.getLaps(sessionKey, driverNumber);
        return ResponseEntity.ok(laps);
    }

    @GetMapping("/compare")
    public ResponseEntity<?> compareLaps(
            @RequestParam long sessionKey,
            @RequestParam int driverNumberA,
            @RequestParam int driverNumberB,
            @RequestParam int lapA,
            @RequestParam int lapB) {
        Map<String, Object> result = telemetryService.compareLaps(sessionKey, driverNumberA, driverNumberB, lapA, lapB);
        if (result.containsKey("error")) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeLaps(@RequestBody TelemetryAnalysisRequest request) {
        Map<String, Object> result = telemetryAnalysisService.analyze(
                request.getSessionKey(),
                request.getDriverNumberA(),
                request.getDriverNumberB(),
                request.getLapA(),
                request.getLapB());
        if (result.containsKey("error")) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }
}
