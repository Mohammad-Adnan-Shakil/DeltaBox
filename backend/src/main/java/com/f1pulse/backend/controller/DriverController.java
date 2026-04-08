package com.f1pulse.backend.controller;

import com.f1pulse.backend.model.Driver;
import com.f1pulse.backend.repository.DriverRepository;
import com.f1pulse.backend.service.F1Service;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/f1/drivers")
@CrossOrigin(origins = "http://localhost:5173")
public class DriverController {

    private final DriverRepository driverRepository;
    private final F1Service driverService;

    public DriverController(DriverRepository driverRepository, F1Service driverService) {
        this.driverRepository = driverRepository;
        this.driverService = driverService;
    }

    // ✅ GET FROM DATABASE
    @GetMapping("/db")
    public List<Driver> getDriversFromDB() {
        return driverRepository.findAll();
    }

    @PostMapping("/save")
    public String saveDrivers() {
        driverService.saveDrivers();
        return "Drivers saved successfully";
    }
}
