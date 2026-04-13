package com.f1pulse.backend.ai.controller;

import com.f1pulse.backend.ai.dto.DriverComparisonResponseDTO;
import com.f1pulse.backend.ai.service.DriverComparisonService;
import com.f1pulse.backend.dto.ApiResponse;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class DriverComparisonController {

    private final DriverComparisonService comparisonService;

    public DriverComparisonController(DriverComparisonService comparisonService) {
        this.comparisonService = comparisonService;
    }

    @GetMapping("/compare")
    public ApiResponse<DriverComparisonResponseDTO> compare(
            @RequestParam Long driver1,
            @RequestParam Long driver2
    ) {
        DriverComparisonResponseDTO result =
                comparisonService.compareDrivers(driver1, driver2);

        return new ApiResponse<>(
                true,
                "Comparison generated",
                result
        );
    }
}