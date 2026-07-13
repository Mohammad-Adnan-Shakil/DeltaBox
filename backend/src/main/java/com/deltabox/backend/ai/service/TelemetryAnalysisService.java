package com.deltabox.backend.ai.service;

import com.deltabox.backend.ai.prompts.TelemetryAnalysisPrompts;
import com.deltabox.backend.service.TelemetryService;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class TelemetryAnalysisService {

    private final TelemetryService telemetryService;
    private final GroqApiService groqApiService;

    public TelemetryAnalysisService(TelemetryService telemetryService, GroqApiService groqApiService) {
        this.telemetryService = telemetryService;
        this.groqApiService = groqApiService;
    }

    public Map<String, Object> analyze(long sessionKey, int driverNumberA, int driverNumberB, int lapA, int lapB) {
        Map<String, Object> result = new LinkedHashMap<>();

        Map<String, Object> comparison = telemetryService.compareLaps(sessionKey, driverNumberA, driverNumberB, lapA, lapB);
        if (comparison.containsKey("error")) {
            result.put("error", comparison.get("error"));
            return result;
        }

        Map<String, Object> telemetry = (Map<String, Object>) comparison.get("telemetry");
        Map<String, Object> delta = (Map<String, Object>) comparison.get("delta");
        Map<String, Object> driverAInfo = (Map<String, Object>) comparison.get("driverA");
        Map<String, Object> driverBInfo = (Map<String, Object>) comparison.get("driverB");

        String codeA = (String) driverAInfo.getOrDefault("code", "A");
        String codeB = (String) driverBInfo.getOrDefault("code", "B");

        @SuppressWarnings("unchecked")
        List<Integer> speedA = (List<Integer>) telemetry.getOrDefault("speedA", List.of());
        @SuppressWarnings("unchecked")
        List<Integer> speedB = (List<Integer>) telemetry.getOrDefault("speedB", List.of());
        @SuppressWarnings("unchecked")
        List<Integer> throttleA = (List<Integer>) telemetry.getOrDefault("throttleA", List.of());
        @SuppressWarnings("unchecked")
        List<Integer> throttleB = (List<Integer>) telemetry.getOrDefault("throttleB", List.of());
        @SuppressWarnings("unchecked")
        List<Integer> brakeA = (List<Integer>) telemetry.getOrDefault("brakeA", List.of());
        @SuppressWarnings("unchecked")
        List<Integer> brakeB = (List<Integer>) telemetry.getOrDefault("brakeB", List.of());
        @SuppressWarnings("unchecked")
        List<Double> sectors = (List<Double>) delta.getOrDefault("sectors", List.of(0.0, 0.0, 0.0));

        double avgSpeedA = speedA.stream().mapToInt(Integer::intValue).average().orElse(0);
        double avgSpeedB = speedB.stream().mapToInt(Integer::intValue).average().orElse(0);
        double maxSpeedA = speedA.stream().mapToInt(Integer::intValue).max().orElse(0);
        double maxSpeedB = speedB.stream().mapToInt(Integer::intValue).max().orElse(0);
        double avgThrottleA = throttleA.stream().mapToInt(Integer::intValue).average().orElse(0);
        double avgThrottleB = throttleB.stream().mapToInt(Integer::intValue).average().orElse(0);
        double avgBrakeA = brakeA.stream().mapToInt(Integer::intValue).average().orElse(0);
        double avgBrakeB = brakeB.stream().mapToInt(Integer::intValue).average().orElse(0);
        double totalDelta = ((Number) delta.getOrDefault("total", 0.0)).doubleValue();

        String sectorStr = String.format("[S1: %.2fs, S2: %.2fs, S3: %.2fs]",
                sectors.size() > 0 ? sectors.get(0) : 0,
                sectors.size() > 1 ? sectors.get(1) : 0,
                sectors.size() > 2 ? sectors.get(2) : 0);

        String prompt = TelemetryAnalysisPrompts.buildPrompt(
                codeA, codeB, lapA, lapB,
                totalDelta, sectorStr,
                avgSpeedA, avgSpeedB, maxSpeedA, maxSpeedB,
                avgThrottleA, avgThrottleB,
                avgBrakeA, avgBrakeB);

        String analysis = groqApiService.makeRequest(TelemetryAnalysisPrompts.SYSTEM_PROMPT, prompt, 300, 0.5);

        result.put("analysis", analysis);
        result.put("driverA", driverAInfo);
        result.put("driverB", driverBInfo);
        result.put("delta", delta);
        result.put("summary", Map.of(
                "avgSpeedA", Math.round(avgSpeedA * 10) / 10.0,
                "avgSpeedB", Math.round(avgSpeedB * 10) / 10.0,
                "maxSpeedA", maxSpeedA,
                "maxSpeedB", maxSpeedB,
                "avgThrottleA", Math.round(avgThrottleA * 10) / 10.0,
                "avgThrottleB", Math.round(avgThrottleB * 10) / 10.0,
                "avgBrakeA", Math.round(avgBrakeA * 10) / 10.0,
                "avgBrakeB", Math.round(avgBrakeB * 10) / 10.0
        ));
        return result;
    }
}
