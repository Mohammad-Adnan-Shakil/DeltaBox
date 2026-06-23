package com.deltabox.backend.ai.controller;

import com.deltabox.backend.ai.dto.PredictionRequestDTO;
import com.deltabox.backend.ai.dto.PredictionResponseDTO;
import com.deltabox.backend.ai.dto.SimulationRequestDTO;
import com.deltabox.backend.ai.dto.SimulationResponseDTO;
import com.deltabox.backend.ai.service.PredictionService;
import com.deltabox.backend.ai.service.SimulationService;
import com.deltabox.backend.dto.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@Tag(name = "DeltaBox Predictions", description = "AI-powered race predictions and driver intelligence")
public class PredictionController {

    private final PredictionService predictionService;
    private final SimulationService simulationService;

    public PredictionController(PredictionService predictionService,
                                SimulationService simulationService) {
        this.predictionService = predictionService;
        this.simulationService = simulationService;
    }

    @PostMapping("/predict")
    public ApiResponse<PredictionResponseDTO> predict(
            @Valid @RequestBody PredictionRequestDTO request) {

        PredictionResponseDTO response = predictionService.predictRaceOutcome(request);

        return new ApiResponse<>(
                true,
                "Prediction successful",
                response
        );
    }

    @PostMapping("/simulate")
    public ApiResponse<SimulationResponseDTO> simulate(
            @RequestBody SimulationRequestDTO request) {

        SimulationResponseDTO result = simulationService.simulate(request);

        return new ApiResponse<>(
                true,
                "Simulation complete",
                result
        );
    }
}
