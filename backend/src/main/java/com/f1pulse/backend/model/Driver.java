package com.f1pulse.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "driver", uniqueConstraints = {
        @UniqueConstraint(columnNames = "code")
})
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String nationality;

    // Constructors
    public Driver() {}

    public Driver(String name, String code, String nationality) {
        this.name = name;
        this.code = code;
        this.nationality = nationality;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getCode() {
        return code;
    }

    public String getNationality() {
        return nationality;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public void setNationality(String nationality) {
        this.nationality = nationality;
    }
}