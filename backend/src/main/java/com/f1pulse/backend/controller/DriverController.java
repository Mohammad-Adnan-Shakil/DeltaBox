package com.f1pulse.backend.controller;

import com.f1pulse.backend.model.Driver;
import com.f1pulse.backend.repository.DriverRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/drivers")
public class DriverController {

    private final DriverRepository driverRepository;

    public DriverController(DriverRepository driverRepository) {
        this.driverRepository = driverRepository;
    }

    // ✅ Get all drivers
    @GetMapping
    public ResponseEntity<?> getAllDrivers() {
        try {
            List<Driver> drivers = driverRepository.findAll();
            return ResponseEntity.ok(drivers);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to load drivers");
        }
    }
}