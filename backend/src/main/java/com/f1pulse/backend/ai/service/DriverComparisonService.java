package com.deltabox.backend.ai.service;

import com.deltabox.backend.ai.dto.DriverComparisonResponseDTO;

public interface DriverComparisonService {
    DriverComparisonResponseDTO compareDrivers(Long driver1, Long driver2);
}
