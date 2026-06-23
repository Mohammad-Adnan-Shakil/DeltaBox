package com.deltabox.backend.ai.service;

import com.deltabox.backend.ai.prompts.RaceEngineerPrompts;
import org.springframework.stereotype.Service;

@Service
public class RaceEngineerService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(RaceEngineerService.class);

    private final GroqApiService groqApiService;

    public RaceEngineerService(GroqApiService groqApiService) {
        this.groqApiService = groqApiService;
    }

    public String ask(String userMessage, Object raceContext) {
        try {
            log.info("Race Engineer service processing request: {}", userMessage);
            
            // Build prompts using the new prompt utility
            String systemPrompt = RaceEngineerPrompts.RACE_ENGINEER_SYSTEM_PROMPT;
            String userPrompt = RaceEngineerPrompts.buildUserPrompt(userMessage, raceContext.toString());
            
            // Make request using the shared Groq API service
            return groqApiService.makeRequest(systemPrompt, userPrompt, 200, 0.7);
            
        } catch (Exception e) {
            log.error("Unexpected error in Race Engineer service: {} - {}", e.getClass().getSimpleName(), e.getMessage(), e);
            return "Race Engineer service temporarily unavailable. Unexpected error occurred.";
        }
    }
}
