package com.f1pulse.backend.model;

public class DriverDTO {

    private String name;
    private String code;
    private String nationality;
    private String team;  // 🆕 Team field

    public DriverDTO(String name, String code, String nationality, String team) {
        this.name = name;
        this.code = code;
        this.nationality = nationality;
        this.team = team;
    }

    public String getName() { return name; }
    public String getCode() { return code; }
    public String getNationality() { return nationality; }
    public String getTeam() { return team; }
}