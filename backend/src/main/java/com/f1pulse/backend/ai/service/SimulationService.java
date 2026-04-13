package com.f1pulse.backend.ai.service;

import com.f1pulse.backend.ai.dto.SimulationRequestDTO;
import com.f1pulse.backend.ai.dto.SimulationResponseDTO;

public interface SimulationService {
    SimulationResponseDTO simulate(SimulationRequestDTO request);
}