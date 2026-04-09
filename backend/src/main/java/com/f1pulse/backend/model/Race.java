package com.f1pulse.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "race")
public class Race {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String raceName;
    private String circuitName;
    private String location;
    private String country;
    private String date;

    public Race() {}

    public Race(String raceName, String circuitName, String location, String country, String date) {
        this.raceName = raceName;
        this.circuitName = circuitName;
        this.location = location;
        this.country = country;
        this.date = date;
    }

    public Long getId() { return id; }
    public String getRaceName() { return raceName; }
    public String getCircuitName() { return circuitName; }
    public String getLocation() { return location; }
    public String getCountry() { return country; }
    public String getDate() { return date; }

    public void setId(Long id) { this.id = id; }
    public void setRaceName(String raceName) { this.raceName = raceName; }
    public void setCircuitName(String circuitName) { this.circuitName = circuitName; }
    public void setLocation(String location) { this.location = location; }
    public void setCountry(String country) { this.country = country; }
    public void setDate(String date) { this.date = date; }
}