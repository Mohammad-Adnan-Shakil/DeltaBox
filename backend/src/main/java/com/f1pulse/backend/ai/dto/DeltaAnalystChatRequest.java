package com.f1pulse.backend.ai.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

/**
 * Request DTO for Delta Analyst AI telemetry analysis.
 * Can accept telemetry data as raw Objects or typed Lists.
 */
public class DeltaAnalystChatRequest {

    @NotBlank(message = "Driver 1 is required")
    private String driver1;

    @NotBlank(message = "Driver 2 is required")
    private String driver2;

    // Race context
    private String race;
    private Integer year;
    private String session;

    // Telemetry data - supports both Object and List<Number> formats
    private Object speedData;
    private List<Number> driver1Speed;
    private List<Number> driver2Speed;

    private Object throttleData;
    private List<Number> driver1Throttle;
    private List<Number> driver2Throttle;

    private Object brakeData;
    private List<Number> driver1Brake;
    private List<Number> driver2Brake;

    private Object gearData;
    private List<Number> lapDelta;

    private Object sectorDelta;

    @NotBlank(message = "User message is required")
    @JsonAlias("question")
    private String userMessage;

    // Getters and Setters
    public String getDriver1() {
        return driver1;
    }

    public void setDriver1(String driver1) {
        this.driver1 = driver1;
    }

    public String getDriver2() {
        return driver2;
    }

    public void setDriver2(String driver2) {
        this.driver2 = driver2;
    }

    public String getRace() {
        return race;
    }

    public void setRace(String race) {
        this.race = race;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public String getSession() {
        return session;
    }

    public void setSession(String session) {
        this.session = session;
    }

    public Object getSpeedData() {
        return speedData;
    }

    public void setSpeedData(Object speedData) {
        this.speedData = speedData;
    }

    public List<Number> getDriver1Speed() {
        return driver1Speed;
    }

    public void setDriver1Speed(List<Number> driver1Speed) {
        this.driver1Speed = driver1Speed;
    }

    public List<Number> getDriver2Speed() {
        return driver2Speed;
    }

    public void setDriver2Speed(List<Number> driver2Speed) {
        this.driver2Speed = driver2Speed;
    }

    public Object getThrottleData() {
        return throttleData;
    }

    public void setThrottleData(Object throttleData) {
        this.throttleData = throttleData;
    }

    public List<Number> getDriver1Throttle() {
        return driver1Throttle;
    }

    public void setDriver1Throttle(List<Number> driver1Throttle) {
        this.driver1Throttle = driver1Throttle;
    }

    public List<Number> getDriver2Throttle() {
        return driver2Throttle;
    }

    public void setDriver2Throttle(List<Number> driver2Throttle) {
        this.driver2Throttle = driver2Throttle;
    }

    public Object getBrakeData() {
        return brakeData;
    }

    public void setBrakeData(Object brakeData) {
        this.brakeData = brakeData;
    }

    public List<Number> getDriver1Brake() {
        return driver1Brake;
    }

    public void setDriver1Brake(List<Number> driver1Brake) {
        this.driver1Brake = driver1Brake;
    }

    public List<Number> getDriver2Brake() {
        return driver2Brake;
    }

    public void setDriver2Brake(List<Number> driver2Brake) {
        this.driver2Brake = driver2Brake;
    }

    public Object getGearData() {
        return gearData;
    }

    public void setGearData(Object gearData) {
        this.gearData = gearData;
    }

    public List<Number> getLapDelta() {
        return lapDelta;
    }

    public void setLapDelta(List<Number> lapDelta) {
        this.lapDelta = lapDelta;
    }

    public Object getSectorDelta() {
        return sectorDelta;
    }

    public void setSectorDelta(Object sectorDelta) {
        this.sectorDelta = sectorDelta;
    }

    public String getUserMessage() {
        return userMessage;
    }

    public void setUserMessage(String userMessage) {
        this.userMessage = userMessage;
    }
}
