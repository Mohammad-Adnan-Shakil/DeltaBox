package com.f1pulse.backend.controller;

import com.f1pulse.backend.service.F1Service;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/f1")
@CrossOrigin
public class F1Controller {

    private final F1Service f1service;

    public F1Controller(F1Service f1service) {
        this.f1service = f1service;
    }

    @GetMapping("/drivers")
    public String getDrivers() {
        return f1service.getDrivers();
    }
}