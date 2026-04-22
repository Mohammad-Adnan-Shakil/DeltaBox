package com.deltabox.backend.ai.service;

import com.deltabox.backend.ai.dto.DriverInsightsResponseDTO;

public interface DriverInsightsService {
    DriverInsightsResponseDTO getDriverInsights(Long driverId);
}
