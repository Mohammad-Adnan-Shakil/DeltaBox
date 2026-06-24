package com.deltabox.backend.ai.controller;

import com.deltabox.backend.ai.dto.PredictionRequestDTO;
import com.deltabox.backend.ai.dto.PredictionResponseDTO;
import com.deltabox.backend.ai.service.PredictionService;
import com.deltabox.backend.dto.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
public class PredictionControllerTest {

    @Mock
    private PredictionService predictionService;

    @InjectMocks
    private PredictionController predictionController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(predictionController).build();
        objectMapper = new ObjectMapper();
    }

    @Test
    void predict_HappyPath_ValidInput_ReturnsPredictionResponse() throws Exception {
        // Arrange
        PredictionRequestDTO request = new PredictionRequestDTO();
        request.setGridPosition(5);
        request.setDriverForm(8);
        request.setTeamPerformance(7);
        request.setTrackAffinity(6);

        PredictionResponseDTO mockResponse = new PredictionResponseDTO();
        mockResponse.setPredictedPosition(3);
        mockResponse.setConfidence(0.85);
        mockResponse.setConfidenceLabel("HIGH");
        mockResponse.setPredictedRange("P1-P5");
        mockResponse.setTrend("IMPROVING");
        mockResponse.setInsights(List.of("Strong performance expected"));
        mockResponse.setTopFeatures(List.of(Map.of("feature", "grid_position", "importance", 0.9)));

        when(predictionService.predictRaceOutcome(any(PredictionRequestDTO.class)))
                .thenReturn(mockResponse);

        // Act & Assert
        mockMvc.perform(post("/api/ai/predict")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Prediction successful"))
                .andExpect(jsonPath("$.data.predictedPosition").value(3))
                .andExpect(jsonPath("$.data.confidence").value(0.85))
                .andExpect(jsonPath("$.data.confidenceLabel").value("HIGH"))
                .andExpect(jsonPath("$.data.predictedRange").value("P1-P5"))
                .andExpect(jsonPath("$.data.trend").value("IMPROVING"))
                .andExpect(jsonPath("$.data.insights").isArray())
                .andExpect(jsonPath("$.data.topFeatures").isArray());
    }

    @Test
    void predict_InvalidInput_MissingGridPosition_ReturnsBadRequest() throws Exception {
        // Arrange - missing gridPosition (violates @NotNull)
        String invalidRequest = """
                {
                    "driverForm": 8,
                    "teamPerformance": 7,
                    "trackAffinity": 6
                }
                """;

        // Act & Assert
        mockMvc.perform(post("/api/ai/predict")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidRequest))
                .andExpect(status().isBadRequest());
    }

    @Test
    void predict_InvalidInput_GridPositionOutOfRange_ReturnsBadRequest() throws Exception {
        // Arrange - gridPosition exceeds max (20)
        String invalidRequest = """
                {
                    "gridPosition": 25,
                    "driverForm": 8,
                    "teamPerformance": 7,
                    "trackAffinity": 6
                }
                """;

        // Act & Assert
        mockMvc.perform(post("/api/ai/predict")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidRequest))
                .andExpect(status().isBadRequest());
    }

    @Test
    void predict_ModelDisagreement_DivergingPredictions_ReturnsLowConfidence() throws Exception {
        // Arrange
        PredictionRequestDTO request = new PredictionRequestDTO();
        request.setGridPosition(10);
        request.setDriverForm(5);
        request.setTeamPerformance(5);
        request.setTrackAffinity(5);

        // Mock response indicating model disagreement (low confidence)
        PredictionResponseDTO mockResponse = new PredictionResponseDTO();
        mockResponse.setPredictedPosition(8);
        mockResponse.setConfidence(0.35); // Low confidence due to disagreement
        mockResponse.setConfidenceLabel("LOW");
        mockResponse.setPredictedRange("P5-P12");
        mockResponse.setTrend("STABLE");
        mockResponse.setInsights(List.of("Models disagree on prediction", "High uncertainty"));
        mockResponse.setTopFeatures(List.of(
                Map.of("feature", "grid_position", "importance", 0.7),
                Map.of("feature", "driver_form", "importance", 0.6)
        ));

        when(predictionService.predictRaceOutcome(any(PredictionRequestDTO.class)))
                .thenReturn(mockResponse);

        // Act & Assert
        mockMvc.perform(post("/api/ai/predict")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.confidence").value(0.35))
                .andExpect(jsonPath("$.data.confidenceLabel").value("LOW"))
                .andExpect(jsonPath("$.data.insights[0]").value("Models disagree on prediction"))
                .andExpect(jsonPath("$.data.insights[1]").value("High uncertainty"));
    }

    @Test
    void predict_MissingFeatureData_InsufficientHistory_ReturnsGracefulDegradation() throws Exception {
        // Arrange - driver with low form (simulating insufficient history)
        PredictionRequestDTO request = new PredictionRequestDTO();
        request.setGridPosition(15);
        request.setDriverForm(2); // Low form = insufficient history
        request.setTeamPerformance(3);
        request.setTrackAffinity(2);

        // Mock response with graceful degradation (moderate confidence, conservative range)
        PredictionResponseDTO mockResponse = new PredictionResponseDTO();
        mockResponse.setPredictedPosition(14);
        mockResponse.setConfidence(0.55); // Moderate confidence due to limited data
        mockResponse.setConfidenceLabel("MEDIUM");
        mockResponse.setPredictedRange("P10-P18"); // Wider range due to uncertainty
        mockResponse.setTrend("STABLE");
        mockResponse.setInsights(List.of("Limited historical data available", "Prediction based on grid position only"));
        mockResponse.setTopFeatures(List.of(Map.of("feature", "grid_position", "importance", 0.95)));

        when(predictionService.predictRaceOutcome(any(PredictionRequestDTO.class)))
                .thenReturn(mockResponse);

        // Act & Assert
        mockMvc.perform(post("/api/ai/predict")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.confidence").value(0.55))
                .andExpect(jsonPath("$.data.confidenceLabel").value("MEDIUM"))
                .andExpect(jsonPath("$.data.predictedRange").value("P10-P18"))
                .andExpect(jsonPath("$.data.insights[0]").value("Limited historical data available"))
                .andExpect(jsonPath("$.data.insights[1]").value("Prediction based on grid position only"));
    }
}
