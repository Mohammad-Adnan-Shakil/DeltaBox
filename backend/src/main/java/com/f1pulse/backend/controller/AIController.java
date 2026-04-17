package com.f1pulse.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.f1pulse.backend.service.AIService;
import com.f1pulse.backend.dto.DriverInsightResponse;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final AIService aiService;

    public AIController(AIService aiService) {
        this.aiService = aiService;
    }

    @GetMapping("/driver-insights/{driverId}")
    public ResponseEntity<DriverInsightResponse> getDriverInsights(
            @PathVariable Long driverId
    ) {
        return ResponseEntity.ok(aiService.getDriverInsights(driverId));
    }
}