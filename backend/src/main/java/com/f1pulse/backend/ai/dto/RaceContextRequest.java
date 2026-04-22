package com.deltabox.backend.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request payload for Race Engineer AI analysis.
 * Contains real-time race context and driver telemetry.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RaceContextRequest {
    
    /**
     * Current lap number (1-indexed)
     */
    private int lap;
    
    /**
     * Total laps in the race/session
     */
    private int totalLaps;
    
    /**
     * Current grid position (1-indexed)
     */
    private int position;
    
    /**
     * Gap to leader as formatted string, e.g. "+12.4s" or "1L"
     */
    private String gapToLeader;
    
    /**
     * Tire compound: SOFT, MEDIUM, HARD, INTER, WET
     */
    private String tyreCompound;
    
    /**
     * Tyre age in completed laps
     */
    private int tyreAge;
    
    /**
     * Remaining fuel load in kilograms
     */
    private double fuelLoad;
    
    /**
     * Current weather condition: Dry, Damp, Wet
     */
    private String weather;
    
    /**
     * Last completed lap time as formatted string, e.g. "1:22.847"
     */
    private String lastLapTime;
    
    /**
     * Driver's message or observation from the car
     */
    private String driverMessage;
}
