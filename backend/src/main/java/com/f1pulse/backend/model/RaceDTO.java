package com.f1pulse.backend.model;

public class RaceDTO {

    private String raceName;
    private String circuitName;
    private String location;
    private String country;
    private String date;

    public RaceDTO(String raceName, String circuitName, String location, String country, String date) {
        this.raceName = raceName;
        this.circuitName = circuitName;
        this.location = location;
        this.country = country;
        this.date = date;
    }

    public String getRaceName() { return raceName; }
    public String getCircuitName() { return circuitName; }
    public String getLocation() { return location; }
    public String getCountry() { return country; }
    public String getDate() { return date; }
}