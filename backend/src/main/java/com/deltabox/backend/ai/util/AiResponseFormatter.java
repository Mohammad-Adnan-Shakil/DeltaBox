package com.deltabox.backend.ai.util;

public final class AiResponseFormatter {

    private AiResponseFormatter() {
    }

    public static String deltaAnalystUnavailable() {
        return "Delta Analyst temporarily unavailable.";
    }

    public static boolean isUnavailable(String response) {
        return response == null || response.trim().isEmpty() || response.toLowerCase().contains("temporarily unavailable");
    }
}
