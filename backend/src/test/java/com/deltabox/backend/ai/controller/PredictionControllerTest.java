package com.deltabox.backend.ai.controller;

import com.deltabox.backend.ai.dto.PredictionRequestDTO;
import com.deltabox.backend.ai.dto.PredictionResponseDTO;
import com.deltabox.backend.ai.service.PredictionService;
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
        request.setDriverId(1L);
        request.setRaceId(1L);
        request.setGridPosition(5);

        PredictionResponseDTO mockResponse = new PredictionResponseDTO();
        mockResponse.setPredictedPosition(3);
        mockResponse.setConfidence(0.85);
        mockResponse.setConfidenceLabel("HIGH");
        mockResponse.setRfPrediction(2.8);
        mockResponse.setXgbPrediction(3.2);
        mockResponse.setModelAgreement(true);
        mockResponse.setPredictedRange("P1-P5");
        mockResponse.setTrend("IMPROVING");
        mockResponse.setFinalInsight("Strong performance expected");
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
                .andExpect(jsonPath("$.data.rfPrediction").value(2.8))
                .andExpect(jsonPath("$.data.xgbPrediction").value(3.2))
                .andExpect(jsonPath("$.data.modelAgreement").value(true))
                .andExpect(jsonPath("$.data.predictedRange").value("P1-P5"))
                .andExpect(jsonPath("$.data.trend").value("IMPROVING"))
                .andExpect(jsonPath("$.data.insights").isArray())
                .andExpect(jsonPath("$.data.topFeatures").isArray());
    }

    @Test
    void predict_InvalidInput_MissingDriverId_ReturnsBadRequest() throws Exception {
        // Arrange - missing driverId (violates @NotNull)
        String invalidRequest = """
                {
                    "raceId": 1,
                    "gridPosition": 5
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
                    "driverId": 1,
                    "raceId": 1,
                    "gridPosition": 25
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
        request.setDriverId(1L);
        request.setRaceId(1L);
        request.setGridPosition(10);

        // Mock response indicating model disagreement (low confidence)
        PredictionResponseDTO mockResponse = new PredictionResponseDTO();
        mockResponse.setPredictedPosition(8);
        mockResponse.setConfidence(0.35);
        mockResponse.setConfidenceLabel("LOW");
        mockResponse.setRfPrediction(5.0);
        mockResponse.setXgbPrediction(11.0);
        mockResponse.setModelAgreement(false);
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
                .andExpect(jsonPath("$.data.modelAgreement").value(false))
                .andExpect(jsonPath("$.data.insights[0]").value("Models disagree on prediction"))
                .andExpect(jsonPath("$.data.insights[1]").value("High uncertainty"));
    }

    @Test
    void predict_MissingFeatureData_InsufficientHistory_ReturnsGracefulDegradation() throws Exception {
        // Arrange - driver with limited history
        PredictionRequestDTO request = new PredictionRequestDTO();
        request.setDriverId(1L);
        request.setRaceId(1L);
        request.setGridPosition(15);

        // Mock response with graceful degradation
        PredictionResponseDTO mockResponse = new PredictionResponseDTO();
        mockResponse.setPredictedPosition(14);
        mockResponse.setConfidence(0.55);
        mockResponse.setConfidenceLabel("MEDIUM");
        mockResponse.setRfPrediction(13.5);
        mockResponse.setXgbPrediction(14.5);
        mockResponse.setModelAgreement(true);
        mockResponse.setPredictedRange("P10-P18");
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
