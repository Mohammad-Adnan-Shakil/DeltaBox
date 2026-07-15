package com.deltabox.backend.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Reusable Groq API service for all AI components
 * Provides common functionality for making Groq API calls
 */
@Service
public class GroqApiService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(GroqApiService.class);

    @Value("${groq.api.key:${GROQ_API_KEY:}}")
    private String apiKey;

    @Value("${groq.api.url:https://api.groq.com/openai/v1/chat/completions}")
    private String apiUrl;

    @Value("${groq.model:llama3-70b-8192}")
    private String model;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GroqApiService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
        this.objectMapper = new ObjectMapper();
    }

    @PostConstruct
    public void init() {
        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("mock")) {
            log.warn("GROQ_API_KEY not set or set to 'mock' - Groq AI commentary unavailable");
            this.apiKey = null;
        } else {
            // Log masked API key for security (show first 5 chars)
            String maskedKey = apiKey.length() > 5 ? apiKey.substring(0, 5) + "..." : apiKey;
            log.info("Groq API service initialized with API key: {}", maskedKey);
        }
    }

    /**
     * Make a request to Groq API with the given system prompt and user message
     * 
     * @param systemPrompt The system prompt for the AI
     * @param userMessage The user message/question
     * @param maxTokens Maximum tokens in response (default: 300)
     * @param temperature AI temperature (default: 0.3)
     * @return AI response or fallback message
     */
    public String makeRequest(String systemPrompt, String userMessage, Integer maxTokens, Double temperature) {
        if (apiKey == null || apiKey.isEmpty()) {
            log.error("🔑 GROQ: API_KEY NOT CONFIGURED - Groq API service unavailable");
            return "AI service temporarily unavailable.";
        }
        
        try {
            log.info("🚀 GROQ: Making request | Model={} | MaxTokens={} | Temperature={}", 
                    model, maxTokens != null ? maxTokens : 300, temperature != null ? temperature : 0.3);
            log.debug("📝 GROQ: User message (first 100 chars): {}", 
                    userMessage.substring(0, Math.min(100, userMessage.length())));
            
            // Build Groq API request
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            requestBody.put("max_tokens", maxTokens != null ? maxTokens : 300);
            requestBody.put("temperature", temperature != null ? temperature : 0.3);

            List<Map<String, String>> messages = List.of(
                    Map.of("role", "system", "content", systemPrompt),
                    Map.of("role", "user", "content", userMessage)
            );
            requestBody.put("messages", messages);

            // Create HTTP headers with Bearer token
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            
            // Trim whitespace/newlines from API key and ensure proper format
            String trimmedApiKey = apiKey.trim();
            String authorizationHeader = "Bearer " + trimmedApiKey;
            headers.set("Authorization", authorizationHeader);
            
            log.info("🔗 GROQ: Calling API at {} with API key (first 10 chars): {}", 
                    apiUrl, trimmedApiKey.substring(0, Math.min(10, trimmedApiKey.length())) + "...");
            log.debug("🔒 GROQ: Authorization header set with full API key");

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            // Call Groq API
            log.info("📤 GROQ: Sending HTTP POST to {}", apiUrl);
            var response = restTemplate.postForEntity(apiUrl, request, String.class);

            log.info("📥 GROQ: Response status: {}", response.getStatusCode());
            
            if (!response.getStatusCode().is2xxSuccessful()) {
                log.error("❌ GROQ: API returned error status: {} | Body: {}", 
                        response.getStatusCode(), response.getBody());
                return "AI service temporarily unavailable.";
            }

            log.debug("✅ GROQ: Response is successful (2xx)");

            // Parse response and extract message
            JsonNode responseJson = objectMapper.readTree(response.getBody());
            if (responseJson == null) {
                log.error("❌ GROQ: Null response body from API");
                return "AI service temporarily unavailable.";
            }
            
            log.debug("📊 GROQ: Response JSON structure: {}", responseJson.fieldNames());
            
            if (!responseJson.has("choices") || responseJson.get("choices").isEmpty()) {
                log.error("❌ GROQ: Invalid response structure - missing 'choices': {}", response.getBody());
                return "AI service temporarily unavailable.";
            }

            JsonNode choice = responseJson.get("choices").get(0);
            if (!choice.has("message") || !choice.get("message").has("content")) {
                log.error("Missing message content in Groq API response: {}", response.getBody());
                return "AI service temporarily unavailable.";
            }

            String aiMessage = choice.get("message").get("content").asText();
            
            if (aiMessage == null || aiMessage.trim().isEmpty()) {
                log.error("❌ GROQ: Empty message content returned");
                return "AI service temporarily unavailable.";
            }

            log.info("✅ GROQ: Generated AI response successfully (length: {})", aiMessage.length());
            return aiMessage;

        } catch (org.springframework.web.client.ResourceAccessException e) {
            log.error("❌ GROQ NETWORK ERROR: Cannot connect to Groq API at {} | Message: {}", 
                    apiUrl, e.getMessage());
            log.error("Groq network error details: ", e);
            return "AI service temporarily unavailable.";
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            log.error("❌ GROQ HTTP CLIENT ERROR: Status={} | Message={}", e.getStatusCode(), e.getMessage());
            log.error("Response body: {}", e.getResponseBodyAsString());
            return "AI service temporarily unavailable.";
        } catch (org.springframework.web.client.HttpServerErrorException e) {
            log.error("HTTP server error from Groq API: {} - {}", e.getStatusCode(), e.getMessage());
            return "AI service temporarily unavailable.";
        } catch (Exception e) {
            log.error("Unexpected error in Groq API service: {} - {}", e.getClass().getSimpleName(), e.getMessage(), e);
            return "AI service temporarily unavailable.";
        }
    }

    /**
     * Convenience method with default parameters
     */
    public String makeRequest(String systemPrompt, String userMessage) {
        return makeRequest(systemPrompt, userMessage, null, null);
    }

    /**
     * Check if API key is configured
     */
    public boolean isConfigured() {
        return apiKey != null && !apiKey.isEmpty();
    }
}
