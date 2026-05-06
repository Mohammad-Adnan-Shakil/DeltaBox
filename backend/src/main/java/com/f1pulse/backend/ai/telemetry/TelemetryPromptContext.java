package com.f1pulse.backend.ai.telemetry;

import com.f1pulse.backend.ai.dto.DeltaAnalystChatRequest;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Builds comprehensive telemetry context from real telemetry data
 * for Delta Analyst AI analysis.
 */
public class TelemetryPromptContext {

    private final DeltaAnalystChatRequest request;

    public TelemetryPromptContext(DeltaAnalystChatRequest request) {
        this.request = request;
    }

    public String toPromptText() {
        StringBuilder context = new StringBuilder();

        context.append("=== TELEMETRY SESSION DATA ===\n");
        if (request.getRace() != null && request.getYear() != null) {
            context.append(String.format("Race: %s %d\n", request.getRace(), request.getYear()));
        }
        if (request.getSession() != null) {
            context.append(String.format("Session: %s\n", request.getSession()));
        }
        context.append(String.format("Drivers: %s vs %s\n\n", request.getDriver1(), request.getDriver2()));

        // Speed data analysis
        List<Number> driver1Speed = request.getDriver1Speed();
        List<Number> driver2Speed = request.getDriver2Speed();
        if ((driver1Speed != null && !driver1Speed.isEmpty()) || 
            (driver2Speed != null && !driver2Speed.isEmpty())) {
            context.append("=== SPEED DATA (km/h) ===\n");
            context.append(formatTelemetryMetrics(
                    request.getDriver1(), driver1Speed,
                    request.getDriver2(), driver2Speed
            ));
            context.append("\n");
        }

        // Throttle data analysis
        List<Number> driver1Throttle = request.getDriver1Throttle();
        List<Number> driver2Throttle = request.getDriver2Throttle();
        if ((driver1Throttle != null && !driver1Throttle.isEmpty()) || 
            (driver2Throttle != null && !driver2Throttle.isEmpty())) {
            context.append("=== THROTTLE DATA (%) ===\n");
            context.append(formatTelemetryMetrics(
                    request.getDriver1(), driver1Throttle,
                    request.getDriver2(), driver2Throttle
            ));
            context.append("\n");
        }

        // Brake data analysis
        List<Number> driver1Brake = request.getDriver1Brake();
        List<Number> driver2Brake = request.getDriver2Brake();
        if ((driver1Brake != null && !driver1Brake.isEmpty()) || 
            (driver2Brake != null && !driver2Brake.isEmpty())) {
            context.append("=== BRAKE DATA (%) ===\n");
            context.append(formatTelemetryMetrics(
                    request.getDriver1(), driver1Brake,
                    request.getDriver2(), driver2Brake
            ));
            context.append("\n");
        }

        // Lap delta analysis
        List<Number> lapDelta = request.getLapDelta();
        if (lapDelta != null && !lapDelta.isEmpty()) {
            context.append("=== LAP DELTA (seconds) ===\n");
            context.append(formatDeltaMetrics(lapDelta, request.getDriver1(), request.getDriver2()));
            context.append("\n");
        }

        return context.toString();
    }

    /**
     * Format telemetry metrics comparing two drivers.
     */
    private String formatTelemetryMetrics(String driver1, List<Number> data1,
                                          String driver2, List<Number> data2) {
        StringBuilder sb = new StringBuilder();

        Stats stats1 = calculateStats(data1);
        Stats stats2 = calculateStats(data2);

        sb.append(String.format("%s: avg=%.2f, min=%.2f, max=%.2f, delta=%.2f\n",
                driver1, stats1.avg, stats1.min, stats1.max, stats1.max - stats1.min));
        sb.append(String.format("%s: avg=%.2f, min=%.2f, max=%.2f, delta=%.2f\n",
                driver2, stats2.avg, stats2.min, stats2.max, stats2.max - stats2.min));

        double avgDelta = Math.abs(stats1.avg - stats2.avg);
        if (avgDelta > 0.01) {
            String leader = stats1.avg > stats2.avg ? driver1 : driver2;
            String metric = avgDelta > 10 ? "points" : "%";
            sb.append(String.format("Advantage %s: %.2f %s\n", leader, avgDelta, metric));
        }

        return sb.toString();
    }

    /**
     * Format lap delta metrics.
     */
    private String formatDeltaMetrics(List<Number> delta, String driver1, String driver2) {
        Stats stats = calculateStats(delta);

        StringBuilder sb = new StringBuilder();
        sb.append(String.format("Max delta: %.3f seconds\n", Math.abs(stats.max)));
        sb.append(String.format("Min delta: %.3f seconds\n", Math.abs(stats.min)));

        if (stats.max > 0) {
            sb.append(String.format("Leader: %s (by up to %.3f seconds)\n", driver1, stats.max));
        } else if (stats.min < 0) {
            sb.append(String.format("Leader: %s (by up to %.3f seconds)\n", driver2, Math.abs(stats.min)));
        }

        return sb.toString();
    }

    /**
     * Calculate statistics for a data series.
     */
    private Stats calculateStats(List<Number> data) {
        if (data == null || data.isEmpty()) {
            return new Stats(0, 0, 0, 0);
        }

        double[] values = data.stream()
                .mapToDouble(Number::doubleValue)
                .toArray();

        double min = Arrays.stream(values).min().orElse(0);
        double max = Arrays.stream(values).max().orElse(0);
        double avg = Arrays.stream(values).average().orElse(0);

        return new Stats(min, max, avg, values.length);
    }

    /**
     * Statistics holder.
     */
    private static class Stats {
        double min, max, avg, count;

        Stats(double min, double max, double avg, double count) {
            this.min = min;
            this.max = max;
            this.avg = avg;
            this.count = count;
        }
    }
}
