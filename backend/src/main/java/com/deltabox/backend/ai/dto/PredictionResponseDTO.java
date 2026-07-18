package com.deltabox.backend.ai.dto;

import java.util.List;
import java.util.Map;

public class PredictionResponseDTO {

    private double predictedPosition;
    private double confidence;
    private String confidenceLabel;
    private double rfPrediction;
    private double xgbPrediction;
    private boolean modelAgreement;
    private String predictedRange;
    private String trend;
    private String finalInsight;
    private List<String> insights;
    private List<Map<String, Object>> topFeatures;
    private List<Map<String, Object>> probabilityDistribution;
    private List<String> uncertaintyFactors;
    private Map<String, Double> performanceBreakdown;
    private Map<String, Double> appliedWeights;
    private Map<String, Object> divergence;
    private String confidenceReason;
    private String simulationImpact;
    private boolean insufficientData;

    public PredictionResponseDTO() {}

    public PredictionResponseDTO(double predictedPosition, double confidence) {
        this.predictedPosition = predictedPosition;
        this.confidence = confidence;
    }

    public double getPredictedPosition() { return predictedPosition; }
    public void setPredictedPosition(double predictedPosition) { this.predictedPosition = predictedPosition; }

    public double getConfidence() { return confidence; }
    public void setConfidence(double confidence) { this.confidence = confidence; }

    public String getConfidenceLabel() { return confidenceLabel; }
    public void setConfidenceLabel(String confidenceLabel) { this.confidenceLabel = confidenceLabel; }

    public double getRfPrediction() { return rfPrediction; }
    public void setRfPrediction(double rfPrediction) { this.rfPrediction = rfPrediction; }

    public double getXgbPrediction() { return xgbPrediction; }
    public void setXgbPrediction(double xgbPrediction) { this.xgbPrediction = xgbPrediction; }

    public boolean isModelAgreement() { return modelAgreement; }
    public void setModelAgreement(boolean modelAgreement) { this.modelAgreement = modelAgreement; }

    public String getPredictedRange() { return predictedRange; }
    public void setPredictedRange(String predictedRange) { this.predictedRange = predictedRange; }

    public String getTrend() { return trend; }
    public void setTrend(String trend) { this.trend = trend; }

    public String getFinalInsight() { return finalInsight; }
    public void setFinalInsight(String finalInsight) { this.finalInsight = finalInsight; }

    public List<String> getInsights() { return insights; }
    public void setInsights(List<String> insights) { this.insights = insights; }

    public List<Map<String, Object>> getTopFeatures() { return topFeatures; }
    public void setTopFeatures(List<Map<String, Object>> topFeatures) { this.topFeatures = topFeatures; }

    public List<Map<String, Object>> getProbabilityDistribution() { return probabilityDistribution; }
    public void setProbabilityDistribution(List<Map<String, Object>> probabilityDistribution) { this.probabilityDistribution = probabilityDistribution; }

    public List<String> getUncertaintyFactors() { return uncertaintyFactors; }
    public void setUncertaintyFactors(List<String> uncertaintyFactors) { this.uncertaintyFactors = uncertaintyFactors; }

    public Map<String, Double> getPerformanceBreakdown() { return performanceBreakdown; }
    public void setPerformanceBreakdown(Map<String, Double> performanceBreakdown) { this.performanceBreakdown = performanceBreakdown; }

    public Map<String, Double> getAppliedWeights() { return appliedWeights; }
    public void setAppliedWeights(Map<String, Double> appliedWeights) { this.appliedWeights = appliedWeights; }

    public Map<String, Object> getDivergence() { return divergence; }
    public void setDivergence(Map<String, Object> divergence) { this.divergence = divergence; }

    public String getConfidenceReason() { return confidenceReason; }
    public void setConfidenceReason(String confidenceReason) { this.confidenceReason = confidenceReason; }

    public String getSimulationImpact() { return simulationImpact; }
    public void setSimulationImpact(String simulationImpact) { this.simulationImpact = simulationImpact; }

    public boolean isInsufficientData() { return insufficientData; }
    public void setInsufficientData(boolean insufficientData) { this.insufficientData = insufficientData; }
}
