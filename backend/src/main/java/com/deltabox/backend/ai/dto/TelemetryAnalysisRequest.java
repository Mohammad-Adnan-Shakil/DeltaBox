package com.deltabox.backend.ai.dto;

public class TelemetryAnalysisRequest {
    private long sessionKey;
    private int driverNumberA;
    private int driverNumberB;
    private int lapA;
    private int lapB;

    public TelemetryAnalysisRequest() {}

    public TelemetryAnalysisRequest(long sessionKey, int driverNumberA, int driverNumberB, int lapA, int lapB) {
        this.sessionKey = sessionKey;
        this.driverNumberA = driverNumberA;
        this.driverNumberB = driverNumberB;
        this.lapA = lapA;
        this.lapB = lapB;
    }

    public long getSessionKey() { return sessionKey; }
    public void setSessionKey(long sessionKey) { this.sessionKey = sessionKey; }
    public int getDriverNumberA() { return driverNumberA; }
    public void setDriverNumberA(int driverNumberA) { this.driverNumberA = driverNumberA; }
    public int getDriverNumberB() { return driverNumberB; }
    public void setDriverNumberB(int driverNumberB) { this.driverNumberB = driverNumberB; }
    public int getLapA() { return lapA; }
    public void setLapA(int lapA) { this.lapA = lapA; }
    public int getLapB() { return lapB; }
    public void setLapB(int lapB) { this.lapB = lapB; }
}
