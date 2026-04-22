package com.deltabox.backend.ai.service;

import com.deltabox.backend.ai.dto.PredictionRequestDTO;
import com.deltabox.backend.ai.dto.PredictionResponseDTO;

public interface PredictionService {

    PredictionResponseDTO predictRaceOutcome(PredictionRequestDTO request);
}
