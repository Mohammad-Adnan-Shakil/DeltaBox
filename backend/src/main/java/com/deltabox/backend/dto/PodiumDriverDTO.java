package com.deltabox.backend.dto;

/**
 * DTO for podium finishers - used by the race result modal
 * Represents a driver's finish in a specific race
 */
public class PodiumDriverDTO {

    private Integer position;        // 1, 2, or 3
    private String code;             // "VER", "LEC", "HAM", etc.
    private String name;             // "Max Verstappen"
    private String nationality;      // "Netherlands"
    private String team;             // "Red Bull Racing"
    private Integer points;          // 25, 18, 15 (F1 points system)

    // Constructors
    public PodiumDriverDTO() {}

    public PodiumDriverDTO(Integer position, String code, String name, 
                          String nationality, String team, Integer points) {
        this.position = position;
        this.code = code;
        this.name = name;
        this.nationality = nationality;
        this.team = team;
        this.points = points;
    }

    // Getters and Setters
    public Integer getPosition() {
        return position;
    }

    public void setPosition(Integer position) {
        this.position = position;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getNationality() {
        return nationality;
    }

    public void setNationality(String nationality) {
        this.nationality = nationality;
    }

    public String getTeam() {
        return team;
    }

    public void setTeam(String team) {
        this.team = team;
    }

    public Integer getPoints() {
        return points;
    }

    public void setPoints(Integer points) {
        this.points = points;
    }

    @Override
    public String toString() {
        return "PodiumDriverDTO{" +
                "position=" + position +
                ", code='" + code + '\'' +
                ", name='" + name + '\'' +
                ", nationality='" + nationality + '\'' +
                ", team='" + team + '\'' +
                ", points=" + points +
                '}';
    }
}
