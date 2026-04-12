package com.f1pulse.backend.ai.dto;

public class PredictionRequestDTO {

    private double gridPosition;
    private double driverForm;
    private double teamPerformance;
    private double trackAffinity;

    public PredictionRequestDTO() {}

    public double getGridPosition() {
        return gridPosition;
    }

    public void setGridPosition(double gridPosition) {
        this.gridPosition = gridPosition;
    }

    public double getDriverForm() {
        return driverForm;
    }

    public void setDriverForm(double driverForm) {
        this.driverForm = driverForm;
    }

    public double getTeamPerformance() {
        return teamPerformance;
    }

    public void setTeamPerformance(double teamPerformance) {
        this.teamPerformance = teamPerformance;
    }

    public double getTrackAffinity() {
        return trackAffinity;
    }

    public void setTrackAffinity(double trackAffinity) {
        this.trackAffinity = trackAffinity;
    }
}