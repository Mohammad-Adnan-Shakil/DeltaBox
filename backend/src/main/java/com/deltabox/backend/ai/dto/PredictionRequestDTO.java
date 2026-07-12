package com.deltabox.backend.ai.dto;

import jakarta.validation.constraints.*;

public class PredictionRequestDTO {

    @NotNull
    private Long driverId;

    @NotNull
    private Long raceId;

    @NotNull
    @Min(1)
    @Max(20)
    private Integer gridPosition;

    public Long getDriverId() {
        return driverId;
    }

    public void setDriverId(Long driverId) {
        this.driverId = driverId;
    }

    public Long getRaceId() {
        return raceId;
    }

    public void setRaceId(Long raceId) {
        this.raceId = raceId;
    }

    public Integer getGridPosition() {
        return gridPosition;
    }

    public void setGridPosition(Integer gridPosition) {
        this.gridPosition = gridPosition;
    }
}
