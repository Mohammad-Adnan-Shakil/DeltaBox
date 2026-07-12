package com.deltabox.backend.ai.service;

import com.deltabox.backend.ai.dto.PredictionRequestDTO;
import com.deltabox.backend.ai.dto.PredictionResponseDTO;
import com.deltabox.backend.dto.DriverIntelligenceResponse;
import com.deltabox.backend.model.Driver;
import com.deltabox.backend.model.Race;
import com.deltabox.backend.model.Team;
import com.deltabox.backend.repository.DriverRepository;
import com.deltabox.backend.repository.RaceRepository;
import com.deltabox.backend.repository.TeamRepository;
import com.deltabox.backend.service.MLClientService;
import com.deltabox.backend.util.StatsUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class PredictionServiceImpl implements PredictionService {

    private static final Logger log = LoggerFactory.getLogger(PredictionServiceImpl.class);

    private final MLClientService mlClientService;
    private final DriverRepository driverRepository;
    private final RaceRepository raceRepository;
    private final TeamRepository teamRepository;

    public PredictionServiceImpl(MLClientService mlClientService,
                                  DriverRepository driverRepository,
                                  RaceRepository raceRepository,
                                  TeamRepository teamRepository) {
        this.mlClientService = mlClientService;
        this.driverRepository = driverRepository;
        this.raceRepository = raceRepository;
        this.teamRepository = teamRepository;
    }

    @Override
    public PredictionResponseDTO predictRaceOutcome(PredictionRequestDTO request) {
        Long driverId = request.getDriverId();
        Integer gridPosition = request.getGridPosition();

        log.info("Predicting race outcome for driverId={}, gridPosition={}", driverId, gridPosition);

        // Fetch driver from DB
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found: " + driverId));

        // Fetch recent race data for the driver
        List<Race> recentRaces = raceRepository.findTop10ByDriverIdAndPositionIsNotNullOrderByDateDesc(driverId);

        double avgLast5 = recentRaces.isEmpty() ? 10.0 : StatsUtil.calculateAverage(recentRaces, 5);
        double stdLast5 = recentRaces.isEmpty() ? 2.0 : StatsUtil.calculateStdDev(recentRaces, 5);
        double avgLast10 = recentRaces.isEmpty() ? 10.0 : StatsUtil.calculateAverage(recentRaces, 10);
        double stdLast10 = recentRaces.isEmpty() ? 2.0 : StatsUtil.calculateStdDev(recentRaces, 10);
        double lastRacePosition = recentRaces.isEmpty() ? gridPosition.doubleValue() : recentRaces.getFirst().getPosition();
        int qualifyingPosition = gridPosition;

        String constructorId = resolveConstructorId(driver);
        String trackId = resolveTrackId(request.getRaceId());

        // Build ML service payload matching Flask /predict expectations
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("driver_id", String.valueOf(driverId));
        payload.put("avg_last_5", round2(avgLast5));
        payload.put("std_last_5", round2(stdLast5));
        payload.put("avg_last_10", round2(avgLast10));
        payload.put("std_last_10", round2(stdLast10));
        payload.put("last_race_position", round2(lastRacePosition));
        payload.put("qualifying_position", qualifyingPosition);
        payload.put("constructor_id", constructorId);
        payload.put("track_id", trackId);
        payload.put("season_year", 2026);
        payload.put("recent_avg_position_last_5", round2(avgLast5));
        payload.put("recent_std_last_5", round2(stdLast5));
        payload.put("grid_position", gridPosition);
        payload.put("is_home_race", 0);

        // Call ML service
        DriverIntelligenceResponse mlResponse = mlClientService.predict(payload);

        // Map to PredictionResponseDTO
        PredictionResponseDTO response = new PredictionResponseDTO();
        double blended = (mlResponse.getRfPrediction() + mlResponse.getXgbPrediction()) / 2.0;
        response.setPredictedPosition(Math.round(blended));
        response.setConfidence(mlResponse.getConfidence());
        response.setConfidenceLabel(mlResponse.getConfidenceLabel());
        response.setRfPrediction(mlResponse.getRfPrediction());
        response.setXgbPrediction(mlResponse.getXgbPrediction());
        response.setModelAgreement(Math.abs(mlResponse.getRfPrediction() - mlResponse.getXgbPrediction()) <= 2.0);
        response.setPredictedRange(mlResponse.getPredictedRange());
        response.setTrend(mlResponse.getTrend());
        response.setFinalInsight(mlResponse.getFinalInsight());
        response.setInsights(mlResponse.getInsights());
        response.setTopFeatures(mlResponse.getTopFeatures());
        response.setProbabilityDistribution(mlResponse.getProbabilityDistribution());
        response.setUncertaintyFactors(mlResponse.getUncertaintyFactors());
        response.setPerformanceBreakdown(mlResponse.getPerformanceBreakdown());
        response.setAppliedWeights(mlResponse.getAppliedWeights());
        response.setDivergence(mlResponse.getDivergence());
        response.setConfidenceReason(mlResponse.getConfidenceReason());
        response.setSimulationImpact(mlResponse.getSimulationImpact());

        log.info("Prediction complete: position={}, confidence={}, rf={}, xgb={}",
                 response.getPredictedPosition(), response.getConfidence(),
                 response.getRfPrediction(), response.getXgbPrediction());

        return response;
    }

    private String resolveConstructorId(Driver driver) {
        if (driver.getTeam() != null && !driver.getTeam().isBlank()) {
            return normalizeToken(driver.getTeam());
        }
        if (driver.getTeamId() != null) {
            Optional<Team> teamOpt = teamRepository.findById(driver.getTeamId());
            if (teamOpt.isPresent()) {
                return normalizeToken(teamOpt.get().getName());
            }
        }
        return "unknown";
    }

    private String resolveTrackId(Long raceId) {
        Optional<Race> raceOpt = raceRepository.findById(raceId);
        if (raceOpt.isPresent() && raceOpt.get().getCircuitName() != null) {
            return normalizeToken(raceOpt.get().getCircuitName());
        }
        return "unknown";
    }

    private static String normalizeToken(String value) {
        if (value == null || value.isBlank()) {
            return "unknown";
        }
        return value.toLowerCase().replace(" ", "_").replace('-', '_');
    }

    private static double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
