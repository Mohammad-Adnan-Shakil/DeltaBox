package com.deltabox.backend.ai.prompts;

public class TelemetryAnalysisPrompts {

    public static final String SYSTEM_PROMPT =
        "You are an expert F1 telemetry analyst. You interpret comparative telemetry data " +
        "between two drivers for a given lap. Provide concise, technical analysis (max 6 sentences) " +
        "covering: who gained time where, driving style differences (throttle aggression, braking " +
        "technique), and specific sector insights. Never break character. Never mention you are an AI.";

    public static String buildPrompt(
            String driverA, String driverB,
            int lapA, int lapB,
            double totalDelta, String sectorDeltasStr,
            double avgSpeedA, double avgSpeedB,
            double maxSpeedA, double maxSpeedB,
            double avgThrottleA, double avgThrottleB,
            double avgBrakeA, double avgBrakeB) {
        return String.format(
            "Compare Lap %d of %s vs Lap %d of %s.\n\n" +
            "Overall delta: %.3fs\n" +
            "Sector deltas: %s\n\n" +
            "Speed — %s avg: %.1f km/h, max: %.1f km/h | %s avg: %.1f km/h, max: %.1f km/h\n" +
            "Throttle (avg) — %s: %.1f%% | %s: %.1f%%\n" +
            "Brake (avg) — %s: %.1f%% | %s: %.1f%%\n\n" +
            "Analyze the driving differences and explain the time delta.",
            lapA, driverA, lapB, driverB,
            totalDelta, sectorDeltasStr,
            driverA, avgSpeedA, maxSpeedA, driverB, avgSpeedB, maxSpeedB,
            driverA, avgThrottleA, driverB, avgThrottleB,
            driverA, avgBrakeA, driverB, avgBrakeB
        );
    }
}
