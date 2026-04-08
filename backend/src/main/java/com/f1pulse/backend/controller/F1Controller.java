package com.f1pulse.backend.controller;

import com.f1pulse.backend.model.DriverDTO;
import com.f1pulse.backend.service.F1Service;
import org.springframework.web.bind.annotation.*;
import com.f1pulse.backend.model.Driver;
import com.f1pulse.backend.repository.DriverRepository;

import java.util.List;

@RestController
@RequestMapping("/api/f1")
@CrossOrigin
public class F1Controller {

    private final F1Service f1Service;
    private final DriverRepository driverRepository;

    public F1Controller(F1Service f1Service, DriverRepository driverRepository) {
        this.f1Service = f1Service;
        this.driverRepository = driverRepository;
    }

    @GetMapping("/drivers")
    public List<DriverDTO> getDrivers() {
        return f1Service.getDrivers();
    }

    @GetMapping("/api/f1/drivers/db")
    public List<Driver> getDriversFromDB() {
        return driverRepository.findAll();
    }
}