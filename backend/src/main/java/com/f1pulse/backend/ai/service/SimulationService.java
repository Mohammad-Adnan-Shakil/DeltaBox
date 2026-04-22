package com.deltabox.backend.ai.service;

import com.deltabox.backend.ai.dto.MultiSimulationRequestDTO;
import com.deltabox.backend.ai.dto.MultiSimulationResponseDTO;
import com.deltabox.backend.ai.dto.SimulationRequestDTO;
import com.deltabox.backend.ai.dto.SimulationResponseDTO;

public interface SimulationService {

    MultiSimulationResponseDTO simulateMultipleRaces(MultiSimulationRequestDTO request);

    SimulationResponseDTO simulate(SimulationRequestDTO request);
}
