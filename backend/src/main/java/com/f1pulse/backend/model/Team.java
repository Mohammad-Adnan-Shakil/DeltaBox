package com.f1pulse.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "team")
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private String nationality;

    public Team() {}

    public Team(String name, String nationality) {
        this.name = name;
        this.nationality = nationality;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getNationality() { return nationality; }

    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setNationality(String nationality) { this.nationality = nationality; }
}