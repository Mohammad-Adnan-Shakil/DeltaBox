package com.f1pulse.backend.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.f1pulse.backend.ai.dto.PredictionRequestDTO;
import com.f1pulse.backend.ai.dto.PredictionResponseDTO;
import com.f1pulse.backend.ai.integration.PythonExecutor;
import org.springframework.stereotype.Service;

@Service
public class PredictionServiceImpl implements PredictionService {

    private final PythonExecutor pythonExecutor;
    private final ObjectMapper objectMapper;

    public PredictionServiceImpl(PythonExecutor pythonExecutor, ObjectMapper objectMapper) {
        this.pythonExecutor = pythonExecutor;
        this.objectMapper = objectMapper;
    }

    @Override
    public PredictionResponseDTO predictRaceOutcome(PredictionRequestDTO request) {
        try {
            // ✅ Convert request → JSON
            String inputJson = objectMapper.writeValueAsString(request);
            System.out.println("INPUT JSON → " + inputJson);

            // ✅ Call Python
            String output = pythonExecutor.runPredictionScript(inputJson);
            System.out.println("PYTHON OUTPUT → " + output);

            // ❗ Handle Python error response
            if (output.contains("\"error\"")) {
                throw new RuntimeException("Python error: " + output);
            }

            // ✅ Parse response safely
            PredictionResponseDTO response =
                    objectMapper.readValue(output.trim(), PredictionResponseDTO.class);

            // ❗ Extra safety (in case mapping fails silently)
            if (response.getConfidence() == null) {
                throw new RuntimeException("Invalid AI response: " + output);
            }

            return response;

        } catch (Exception e) {
            throw new RuntimeException("AI prediction failed: " + e.getMessage(), e);
        }
    }
}