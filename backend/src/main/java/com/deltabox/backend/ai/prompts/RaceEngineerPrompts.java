package com.deltabox.backend.ai.prompts;

/**
 * System prompts for Race Engineer AI service
 */
public class RaceEngineerPrompts {

    /**
     * Main system prompt for Race Engineer strategy advice
     */
    public static final String RACE_ENGINEER_SYSTEM_PROMPT = 
        "You are an F1 race engineer on the pit wall. You make precise strategic decisions " +
        "based on telemetry and race data. Speak in concise, professional pit wall radio style. Give one " +
        "clear strategic recommendation. Maximum 4 sentences. Never break character. Never mention you are an AI.";

    /**
     * Build user prompt with race context
     */
    public static String buildUserPrompt(String driverMessage, String raceContext) {
        return String.format(
            "Driver message: %s. Race context: %s",
            driverMessage,
            raceContext != null ? raceContext : "No context provided"
        );
    }
}
