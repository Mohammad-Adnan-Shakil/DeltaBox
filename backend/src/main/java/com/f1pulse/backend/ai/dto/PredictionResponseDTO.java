package com.f1pulse.backend.ai.dto;

public class PredictionResponseDTO {

    private double predictedPosition;
    private String confidence;

    public double getPredictedPosition() {
        return predictedPosition;
    }

    public void setPredictedPosition(double predictedPosition) {
        this.predictedPosition = predictedPosition;
    }

    public String getConfidence() {
        return confidence;
    }

    public void setConfidence(String confidence) {
        this.confidence = confidence;
    }
}