package com.f1pulse.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "race")
public class Race {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ NO RELATIONSHIP — just store ID
    private Long driverId;

    private String raceName;
    private String circuitName;
    private String location;
    private String country;
    private String date;

    private Integer position;

    // ✅ Default constructor (required by JPA)
    public Race() {}

    // ✅ Full constructor
    public Race(Long driverId,
                String raceName,
                String circuitName,
                String location,
                String country,
                String date,
                Integer position) {
        this.driverId = driverId;
        this.raceName = raceName;
        this.circuitName = circuitName;
        this.location = location;
        this.country = country;
        this.date = date;
        this.position = position;
    }

    // =====================
    // GETTERS
    // =====================

    public Long getId() {
        return id;
    }

    public Long getDriverId() {
        return driverId;
    }

    public String getRaceName() {
        return raceName;
    }

    public String getCircuitName() {
        return circuitName;
    }

    public String getLocation() {
        return location;
    }

    public String getCountry() {
        return country;
    }

    public String getDate() {
        return date;
    }

    public Integer getPosition() {
        return position;
    }

    // =====================
    // SETTERS
    // =====================

    public void setId(Long id) {
        this.id = id;
    }

    public void setDriverId(Long driverId) {
        this.driverId = driverId;
    }

    public void setRaceName(String raceName) {
        this.raceName = raceName;
    }

    public void setCircuitName(String circuitName) {
        this.circuitName = circuitName;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public void setPosition(Integer position) {
        this.position = position;
    }
}