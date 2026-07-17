package com.deltabox.backend.controller;

import com.deltabox.backend.dto.DriverComparisonRequest;
import com.deltabox.backend.dto.DriverComparisonResponse;
import com.deltabox.backend.service.MLService;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@Tag(name = "DeltaBox Predictions", description = "AI-powered race predictions and driver intelligence")
public class AIController {

    private final MLService mlService;

    public AIController(MLService mlService) {
        this.mlService = mlService;
    }

    /**
     * GET /api/ai/model-metrics
     * Returns model performance metrics from ml/model_metrics.json
     */
    @GetMapping("/model-metrics")
    public ResponseEntity<?> getModelMetrics() {
        try {
            String metricsPath = System.getProperty("user.dir") + "/ml/models/model_metrics.json";
            File metricsFile = new File(metricsPath);

            if (!metricsFile.exists()) {
                Map<String, Object> error = new LinkedHashMap<>();
                error.put("error", "Model metrics file not found");
                error.put("message", "Please run the training script first: python ml/scripts/train_all_models_v3.py");
                error.put("expectedPath", metricsPath);
                return ResponseEntity.status(404).body(error);
            }

            String jsonContent = new String(Files.readAllBytes(Paths.get(metricsPath)));
            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> metrics = mapper.readValue(jsonContent, Map.class);

            return ResponseEntity.ok(metrics);

        } catch (Exception e) {
            Map<String, String> error = new LinkedHashMap<>();
            error.put("error", "Failed to load model metrics");
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * POST /api/ai/compare
     * Compare two drivers and calculate win probabilities
     */
    @PostMapping("/compare")
    public ResponseEntity<?> compareDrivers(@RequestBody DriverComparisonRequest request) {
        try {
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("driverA_id", request.getDriverAId());
            payload.put("driverB_id", request.getDriverBId());
            payload.put("gridA", request.getGridA());
            payload.put("gridB", request.getGridB());
            payload.put("race_id", request.getRaceId());

            DriverComparisonResponse comparison = mlService.compare(payload);
            return ResponseEntity.ok(comparison);

        } catch (Exception e) {
            Map<String, String> error = new LinkedHashMap<>();
            error.put("error", "Driver comparison failed");
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}
