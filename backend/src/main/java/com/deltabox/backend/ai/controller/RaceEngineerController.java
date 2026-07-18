package com.deltabox.backend.ai.controller;

import com.deltabox.backend.ai.dto.RaceContextRequest;
import com.deltabox.backend.ai.service.RaceEngineerDataService;
import com.deltabox.backend.ai.service.RaceEngineerService;
import com.deltabox.backend.ai.service.ScenarioEngineService;
import com.deltabox.backend.exception.PythonExecutionException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST controller for AI-powered race engineering advice.
 * Uses DeepSeek R1 for strategic decision making during F1 races.
 */
@RestController
@RequestMapping("/api/race-engineer")
@Tag(name = "Race Engineer", description = "AI-powered pit wall strategy and tactical advice using DeepSeek R1")
public class RaceEngineerController {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(RaceEngineerController.class);

    private final RaceEngineerService raceEngineerService;
    private final RaceEngineerDataService raceEngineerDataService;
    private final ScenarioEngineService scenarioEngineService;

    public RaceEngineerController(RaceEngineerService raceEngineerService,
                                  RaceEngineerDataService raceEngineerDataService,
                                  ScenarioEngineService scenarioEngineService) {
        this.raceEngineerService = raceEngineerService;
        this.raceEngineerDataService = raceEngineerDataService;
        this.scenarioEngineService = scenarioEngineService;
    }

    @GetMapping("/live-session")
    public ResponseEntity<?> getLiveSession() {
        Map<String, Object> session = raceEngineerDataService.getLiveSession();
        if (session == null) {
            return ResponseEntity.ok(Map.of("live", false, "message", "No live session currently active"));
        }
        session.put("live", true);
        List<Map<String, Object>> drivers = raceEngineerDataService.getSessionDrivers(
                ((Number) session.get("sessionKey")).longValue());
        session.put("drivers", drivers);
        return ResponseEntity.ok(session);
    }

    @GetMapping("/replay/sessions")
    public ResponseEntity<List<Map<String, Object>>> getReplaySessions() {
        return ResponseEntity.ok(raceEngineerDataService.getReplaySessions());
    }

    @GetMapping("/replay/drivers")
    public ResponseEntity<List<Map<String, Object>>> getReplayDrivers(@RequestParam long sessionKey) {
        return ResponseEntity.ok(raceEngineerDataService.getSessionDrivers(sessionKey));
    }

    @GetMapping("/state")
    public ResponseEntity<?> getRaceState(
            @RequestParam long sessionKey,
            @RequestParam int driverNumber,
            @RequestParam(required = false) Integer asOfLap,
            @RequestParam(required = false) Integer driverPoints) {
        Map<String, Object> state = raceEngineerDataService.getRaceState(sessionKey, driverNumber, asOfLap);
        if (state.containsKey("error")) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(state);
        }
        if (driverPoints != null) {
            state.put("driverPoints", driverPoints);
        }
        Map<String, Object> scenarios = scenarioEngineService.calculate(state);
        state.put("scenarios", scenarios);
        return ResponseEntity.ok(state);
    }

    @PostMapping("/scenarios")
    public ResponseEntity<?> getManualScenarios(@RequestBody Map<String, Object> manualContext) {
        try {
            Map<String, Object> scenarios = scenarioEngineService.calculate(manualContext);
            return ResponseEntity.ok(scenarios);
        } catch (Exception e) {
            log.warn("Failed to compute manual scenarios: {}", e.getMessage());
            Map<String, Object> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }

    @PostMapping("/ask")
    @Operation(summary = "Get race engineering advice",
            description = "Request strategic advice from the AI race engineer based on current race context. " +
                    "Provides pit wall radio-style tactical recommendations.")
    @ApiResponse(responseCode = "200", description = "Engineering advice generated successfully",
            content = @Content(mediaType = "application/json",
                    schema = @Schema(example = "{\"response\":\"Box box, we'll switch to mediums at the next pit window.\"}")))
    @ApiResponse(responseCode = "503", description = "Race Engineer unavailable - check DeepSeek API connection")
    public ResponseEntity<Map<String, String>> getEngineerAdvice(
            @RequestBody RaceContextRequest raceContext) {

        log.info("📡 [RaceEngineerController] Received strategy request for P{} Lap {}", 
                raceContext.getPosition(), raceContext.getLap());

        try {
            // Build user message from race context
            String userMessage = String.format(
                "Lap %d of %d. Position: P%d. Gap to leader: %s. Tyre: %s (age %d laps). Fuel: %.1fkg. Weather: %s. Last lap: %s. Driver says: %s",
                raceContext.getLap(),
                raceContext.getTotalLaps(),
                raceContext.getPosition(),
                raceContext.getGapToLeader(),
                raceContext.getTyreCompound(),
                raceContext.getTyreAge(),
                raceContext.getFuelLoad(),
                raceContext.getWeather(),
                raceContext.getLastLapTime(),
                raceContext.getDriverMessage()
            );
            
            String advice = raceEngineerService.ask(userMessage, raceContext);
            
            Map<String, String> result = new HashMap<>();
            result.put("response", advice);
            log.info("✅ [RaceEngineerController] Generated advice successfully");
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("❌ [RaceEngineerController] Unexpected error: {}", e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to generate race strategy");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
