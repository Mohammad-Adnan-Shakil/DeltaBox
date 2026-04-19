package com.f1pulse.backend.controller;

import com.f1pulse.backend.ai.dto.PredictionRequestDTO;
import com.f1pulse.backend.ai.service.PredictionService;
import com.f1pulse.backend.dto.DriverIntelligenceResponse;
import com.f1pulse.backend.service.AIService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * ✅ AI Intelligence Controller
 * 
 * Handles:
 * 1. Driver intelligence analysis - /api/ai/driver-intelligence/{driverId}
 * 2. Race prediction - /api/ai/intelligence (POST)
 */
@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final AIService aiService;
    private final PredictionService predictionService;

    public AIController(AIService aiService, PredictionService predictionService) {
        this.aiService = aiService;
        this.predictionService = predictionService;
    }

    /**
     * Get driver intelligence and stats
     * 
     * @param driverId the driver ID
     * @return driver intelligence response with stats
     */
    @GetMapping("/driver-intelligence/{driverId}")
    public ResponseEntity<DriverIntelligenceResponse> getDriverIntelligence(
            @PathVariable Long driverId
    ) {
        return ResponseEntity.ok(aiService.getDriverIntelligence(driverId));
    }

    /**
     * ✅ Run AI prediction for race outcome
     * 
     * Accepts:
     * - driverId: ID of the driver
     * - raceId: ID of the race (for context)
     * - simulatedPosition: Starting grid position (1-20)
     * 
     * Returns predicted finishing position and confidence
     * 
     * @param request the prediction request with driver/race/position
     * @return prediction result with position and confidence
     */
    @PostMapping("/intelligence")
    public ResponseEntity<?> runAIPrediction(
            @RequestBody Map<String, Object> request
    ) {
        try {
            // 🔹 Extract parameters from frontend request
            Long driverId = ((Number) request.get("driverId")).longValue();
            Long raceId = ((Number) request.get("raceId")).longValue();
            Integer simulatedPosition = ((Number) request.get("simulatedPosition")).intValue();

            // 🔹 Create prediction request with estimated parameters
            PredictionRequestDTO predictionRequest = new PredictionRequestDTO();
            predictionRequest.setGridPosition(simulatedPosition);
            
            // 📊 Default/estimated values (can be calculated from historical data)
            predictionRequest.setDriverForm(7);      // 0-10 scale
            predictionRequest.setTeamPerformance(6);  // 0-10 scale
            predictionRequest.setTrackAffinity(5);    // 0-10 scale

            // 🧠 Run prediction through AI service
            var predictionResponse = predictionService.predictRaceOutcome(predictionRequest);

            // 📤 Return result
            Map<String, Object> response = new HashMap<>();
            response.put("prediction", predictionResponse);
            response.put("driverId", driverId);
            response.put("raceId", raceId);
            response.put("simulatedPosition", simulatedPosition);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "AI prediction failed: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}