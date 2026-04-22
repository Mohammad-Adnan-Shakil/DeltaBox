package com.deltabox.backend.ai.service;

import com.deltabox.backend.ai.dto.RaceContextRequest;
import com.deltabox.backend.exception.PythonExecutionException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * AI-powered Race Engineer service using DeepSeek R1 for strategic decision making.
 * Provides pit wall radio-style tactical recommendations based on race telemetry.
 */
@Slf4j
@Service
public class RaceEngineerService {

    @Value("${deepseek.api.key}")
    private String apiKey;

    @Value("${deepseek.api.url}")
    private String apiUrl;

    @Value("${deepseek.model}")
    private String model;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    private static final long EXEC_TIMEOUT_SECONDS = 30L;

    public RaceEngineerService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Generate race engineering strategic advice using DeepSeek R1.
     * 
     * @param context Race context including position, tires, fuel, and driver message
     * @return Map containing "response" key with engineer message value
     * @throws Exception on API communication or processing errors
     */
    public Map<String, String> getStrategicAdvice(RaceContextRequest context) {
        log.info("📡 [RaceEngineer] Processing context: Lap {}/{}, P{}, {}s gap, {} tires (age {})",
                context.getLap(), context.getTotalLaps(), context.getPosition(),
                context.getGapToLeader(), context.getTyreCompound(), context.getTyreAge());

        try {
            // Build system prompt
            String systemPrompt = "You are an F1 race engineer on the pit wall. You make precise strategic decisions " +
                    "based on telemetry and race data. Speak in concise, professional pit wall radio style. Give one " +
                    "clear strategic recommendation. Maximum 4 sentences. Never break character. Never mention you are an AI.";

            // Build user prompt from race context
            String userPrompt = String.format(
                    "Lap %d of %d. Current position: P%d. Gap to leader: %s. Tyre: %s, age %d laps. " +
                    "Fuel: %.1fkg. Weather: %s. Last lap: %s. Driver says: %s",
                    context.getLap(),
                    context.getTotalLaps(),
                    context.getPosition(),
                    context.getGapToLeader(),
                    context.getTyreCompound(),
                    context.getTyreAge(),
                    context.getFuelLoad(),
                    context.getWeather(),
                    context.getLastLapTime(),
                    context.getDriverMessage()
            );

            log.debug("📝 [RaceEngineer] System: {}", systemPrompt);
            log.debug("📝 [RaceEngineer] User: {}", userPrompt);

            // Build DeepSeek API request
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            requestBody.put("max_tokens", 200);

            List<Map<String, String>> messages = List.of(
                    Map.of("role", "system", "content", systemPrompt),
                    Map.of("role", "user", "content", userPrompt)
            );
            requestBody.put("messages", messages);

            log.info("🚀 [RaceEngineer] Sending request to DeepSeek API: {}", apiUrl);

            // Call DeepSeek API with timeout handling
            long startTime = System.currentTimeMillis();
            
            JsonNode response = callDeepSeekApi(requestBody);
            
            long elapsed = System.currentTimeMillis() - startTime;
            log.info("⏱️ [RaceEngineer] DeepSeek response received in {}ms", elapsed);

            // Extract engineer message from response
            if (response == null || !response.has("choices") || response.get("choices").isEmpty()) {
                log.warn("⚠️ [RaceEngineer] Invalid response structure from API");
                throw new Exception("Invalid response from DeepSeek API");
            }

            String engineerMessage = response
                    .get("choices")
                    .get(0)
                    .get("message")
                    .get("content")
                    .asText();

            log.info("✅ [RaceEngineer] Generated advice: {}", engineerMessage);

            // Return response map
            Map<String, String> result = new HashMap<>();
            result.put("response", engineerMessage);
            return result;

        } catch (RestClientException e) {
            log.error("❌ [RaceEngineer] DeepSeek API error: {}", e.getMessage(), e);
            throw new PythonExecutionException("DeepSeek API communication failed: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("❌ [RaceEngineer] Unexpected error: {}", e.getMessage(), e);
            throw new PythonExecutionException("Failed to generate race engineer advice: " + e.getMessage(), e);
        }
    }

    /**
     * Call DeepSeek API with proper headers and error handling.
     */
    private JsonNode callDeepSeekApi(Map<String, Object> requestBody) {
        try {
            // Create HTTP headers with Bearer token
            var headers = new org.springframework.http.HttpHeaders();
            headers.set("Content-Type", "application/json");
            headers.set("Authorization", "Bearer " + apiKey);

            var request = new org.springframework.http.HttpEntity<>(requestBody, headers);

            // Execute POST request with timeout
            var response = restTemplate.postForEntity(apiUrl, request, String.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                log.error("❌ [RaceEngineer] API returned status: {}", response.getStatusCode());
                throw new Exception("DeepSeek API error: " + response.getStatusCode());
            }

            // Parse response JSON
            return objectMapper.readTree(response.getBody());

        } catch (RestClientException e) {
            log.error("❌ [RaceEngineer] REST client error: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("❌ [RaceEngineer] Failed to parse API response: {}", e.getMessage());
            throw new RuntimeException("Failed to parse DeepSeek response", e);
        }
    }
}
