package com.f1pulse.backend.ai.controller;

import com.f1pulse.backend.ai.dto.PredictionRequestDTO;
import com.f1pulse.backend.ai.dto.PredictionResponseDTO;
import com.f1pulse.backend.ai.service.PredictionService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class PredictionController {

    private final PredictionService predictionService;

    public PredictionController(PredictionService predictionService) {
        this.predictionService = predictionService;
    }

    @PostMapping("/predict")
    public PredictionResponseDTO predict(@RequestBody PredictionRequestDTO request) {
        return predictionService.predictRaceOutcome(request);
    }
}