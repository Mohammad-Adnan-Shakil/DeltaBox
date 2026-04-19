package com.f1pulse.backend.controller;

import com.f1pulse.backend.model.Constructor;
import com.f1pulse.backend.repository.ConstructorRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/constructors")
public class ConstructorController {

    private final ConstructorRepository constructorRepository;

    public ConstructorController(ConstructorRepository constructorRepository) {
        this.constructorRepository = constructorRepository;
    }

    // ✅ Get all constructors
    @GetMapping
    public ResponseEntity<?> getAllConstructors() {
        try {
            List<Constructor> constructors = constructorRepository.findAll();
            return ResponseEntity.ok(constructors);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to load constructors");
        }
    }
}