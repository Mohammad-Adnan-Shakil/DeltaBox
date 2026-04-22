package com.deltabox.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeUnit;

@Slf4j
@RestController
@RequestMapping("/api/telemetry")
@Tag(name = "Telemetry Analysis", description = "FastF1 lap telemetry extraction and comparison")
public class TelemetryController {

    private static final long EXEC_TIMEOUT_SECONDS = 90L;

    @GetMapping("/compare")
    @Operation(summary = "Compare telemetry between two drivers",
            description = "Extracts and compares lap telemetry for two drivers from a specific F1 session. " +
                    "First run may take 20-30 seconds as FastF1 downloads session data.")
    @ApiResponse(responseCode = "200", description = "Telemetry data retrieved successfully",
            content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                    schema = @Schema(example = "{\"driver1\":\"VER\",\"driver2\":\"LEC\"}")))
    @ApiResponse(responseCode = "500", description = "Failed to extract telemetry")
    public ResponseEntity<String> compareTelemetry(
            @RequestParam int year,
            @RequestParam String grandPrix,
            @RequestParam String sessionType,
            @RequestParam String driver1,
            @RequestParam String driver2) {

        log.info("📡 [TelemetryController] Telemetry request: {} {} {} {} vs {}", 
                year, grandPrix, sessionType, driver1, driver2);

        try {
            // Build ProcessBuilder with CLI arguments
            ProcessBuilder processBuilder = new ProcessBuilder(
                    "python3",
                    "ml/scripts/telemetry_analysis.py",
                    String.valueOf(year),
                    grandPrix,
                    sessionType,
                    driver1.toUpperCase(),
                    driver2.toUpperCase()
            );

            // Set working directory to project root
            processBuilder.directory(new java.io.File(".").getAbsoluteFile().getParentFile());

            log.info("🚀 [TelemetryController] Launching Python process with timeout {}s", EXEC_TIMEOUT_SECONDS);
            Process process = processBuilder.start();

            // Wait for process to complete with timeout
            boolean finished = process.waitFor(EXEC_TIMEOUT_SECONDS, TimeUnit.SECONDS);
            
            if (!finished) {
                process.destroyForcibly();
                log.error("❌ [TelemetryController] Process timed out after {}s", EXEC_TIMEOUT_SECONDS);
                return ResponseEntity
                        .status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body("{\"error\":\"Telemetry analysis timed out after " + EXEC_TIMEOUT_SECONDS + " seconds\"}");
            }

            // Read stdout as JSON
            String stdout = readStream(process.getInputStream());
            String stderr = readStream(process.getErrorStream());
            int exitCode = process.exitValue();

            if (exitCode != 0) {
                log.error("❌ [TelemetryController] Process failed with exit code {}: {}", exitCode, stderr);
                return ResponseEntity
                        .status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body("{\"error\":\"Python process failed: " + sanitizeForJson(stderr) + "\"}");
            }

            if (stdout == null || stdout.isBlank()) {
                log.error("❌ [TelemetryController] Process returned empty output");
                return ResponseEntity
                        .status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body("{\"error\":\"Telemetry process returned no data\"}");
            }

            log.info("✅ [TelemetryController] Successfully retrieved telemetry data");
            return ResponseEntity
                    .status(HttpStatus.OK)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(stdout);

        } catch (IOException e) {
            log.error("❌ [TelemetryController] IO Error: {}", e.getMessage(), e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"error\":\"Failed to launch telemetry process\"}");
        } catch (InterruptedException e) {
            log.error("❌ [TelemetryController] Interrupted: {}", e.getMessage(), e);
            Thread.currentThread().interrupt();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"error\":\"Telemetry process was interrupted\"}");
        } catch (Exception e) {
            log.error("❌ [TelemetryController] Unexpected error: {}", e.getMessage(), e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"error\":\"Unexpected error occurred\"}");
        }
    }

    /**
     * Read entire stream into a single string.
     */
    private static String readStream(InputStream inputStream) throws IOException {
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
            StringBuilder builder = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                builder.append(line).append("\n");
            }
            return builder.toString().trim();
        }
    }

    /**
     * Sanitize error messages for JSON output.
     */
    private static String sanitizeForJson(String input) {
        if (input == null || input.isEmpty()) {
            return "Unknown error";
        }
        return input.replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
    }
}
