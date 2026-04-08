package com.f1pulse.backend.controller;

import com.f1pulse.backend.model.DriverDTO;
import com.f1pulse.backend.service.F1Service;
import org.springframework.web.bind.annotation.*;
import com.f1pulse.backend.model.Driver;

import java.util.List;

@RestController
@RequestMapping("/api/f1")
@CrossOrigin
public class F1Controller {

    private final F1Service f1Service;

    public F1Controller(F1Service f1Service) {
        this.f1Service = f1Service;
    }

    @GetMapping("/drivers")
    public List<DriverDTO> getDrivers() {
        return f1Service.getDrivers();
    }

    @PostMapping("/drivers/save")
public List<Driver> saveDrivers() {
    return f1Service.saveDrivers();
}
}