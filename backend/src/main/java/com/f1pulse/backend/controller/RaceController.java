package com.f1pulse.backend.controller;

import com.f1pulse.backend.model.Race;
import com.f1pulse.backend.service.F1Service;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/f1/races")
@CrossOrigin(origins = "http://localhost:5173")
public class RaceController {

    private final F1Service f1Service;

    public RaceController(F1Service f1Service) {
        this.f1Service = f1Service;
    }

    @GetMapping("/db")
    public List<Race> getRaces() {
        return f1Service.getRacesFromDB();
    }

    @PostMapping("/save")
    public String saveRaces() {
        f1Service.saveRaces();
        return "Races saved successfully";
    }
}