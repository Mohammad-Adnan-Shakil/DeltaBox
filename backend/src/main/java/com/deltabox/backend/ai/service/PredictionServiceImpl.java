package com.deltabox.backend.ai.service;

import com.deltabox.backend.ai.dto.PredictionRequestDTO;
import com.deltabox.backend.ai.dto.PredictionResponseDTO;
import com.deltabox.backend.dto.DriverIntelligenceResponse;
import com.deltabox.backend.exception.ResourceNotFoundException;
import com.deltabox.backend.model.Driver;
import com.deltabox.backend.model.Race;
import com.deltabox.backend.repository.DriverRepository;
import com.deltabox.backend.repository.RaceRepository;
import com.deltabox.backend.service.MLClientService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PredictionServiceImpl implements PredictionService {

    private static final Logger log = LoggerFactory.getLogger(PredictionServiceImpl.class);

    private final MLClientService mlClientService;
    private final DriverRepository driverRepository;
    private final RaceRepository raceRepository;

    public PredictionServiceImpl(MLClientService mlClientService,
                                  DriverRepository driverRepository,
                                  RaceRepository raceRepository) {
        this.mlClientService = mlClientService;
        this.driverRepository = driverRepository;
        this.raceRepository = raceRepository;
    }

    @Override
    public PredictionResponseDTO predictRaceOutcome(PredictionRequestDTO request) {
        Long driverId = request.getDriverId();
        Integer gridPosition = request.getGridPosition();

        log.info("Predicting race outcome for driverId={}, gridPosition={}", driverId, gridPosition);

        // Fetch driver from DB
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found: " + driverId));

        // Fetch the target race (for circuit & season info)
        Race race = raceRepository.findById(request.getRaceId())
                .orElseThrow(() -> new ResourceNotFoundException("Race not found: " + request.getRaceId()));

        // Fetch all race results for this driver (career context)
        List<Race> allDriverRaces = raceRepository.findByDriverIdAndPositionIsNotNullOrderByDateAsc(driverId);

        // 1. career_avg_finish
        double careerAvgFinish = allDriverRaces.isEmpty() ? 10.0
                : allDriverRaces.stream().mapToInt(Race::getPosition).average().orElse(10.0);

        // 2. career_wins
        long careerWins = allDriverRaces.stream().filter(r -> r.getPosition() == 1).count();

        // 3. career_poles — not available, default 0
        int careerPoles = 0;

        // Fetch recent races (top 10 desc) for recent averages
        List<Race> recentRacesDesc = raceRepository.findTop10ByDriverIdAndPositionIsNotNullOrderByDateDesc(driverId);

        // 4. recent_5_avg
        double recent5Avg = recentRacesDesc.isEmpty() ? 10.0
                : recentRacesDesc.stream().limit(5).mapToInt(Race::getPosition).average().orElse(10.0);

        // 5. recent_10_avg
        double recent10Avg = recentRacesDesc.isEmpty() ? 10.0
                : recentRacesDesc.stream().limit(10).mapToInt(Race::getPosition).average().orElse(10.0);

        // Circuit-specific stats
        String circuitName = race.getCircuitName();
        List<Race> circuitRaces = (circuitName != null)
                ? raceRepository.findByDriverIdAndCircuitNameAndPositionIsNotNull(driverId, circuitName)
                : List.of();

        // 6. circuit_avg_finish
        double circuitAvgFinish = circuitRaces.isEmpty() ? careerAvgFinish
                : circuitRaces.stream().mapToInt(Race::getPosition).average().orElse(careerAvgFinish);

        // 7. circuit_appearances
        int circuitAppearances = circuitRaces.size();

        // 8. season_avg_finish
        Integer seasonYear = race.getSeason() != null ? race.getSeason() : 2026;
        List<Race> seasonRaces = allDriverRaces.stream()
                .filter(r -> r.getSeason() != null && r.getSeason().equals(seasonYear))
                .collect(Collectors.toList());
        double seasonAvgFinish = seasonRaces.isEmpty() ? careerAvgFinish
                : seasonRaces.stream().mapToInt(Race::getPosition).average().orElse(careerAvgFinish);

        // 9. grid_position — from request

        // 10. team_avg_finish — average finish of all drivers on the same team
        String teamName = driver.getTeam();
        double teamAvgFinish = 10.0;
        if (teamName != null && !teamName.isBlank()) {
            List<Driver> teamDrivers = driverRepository.findByTeam(teamName);
            List<Long> teamDriverIds = teamDrivers.stream().map(Driver::getId).collect(Collectors.toList());
            if (!teamDriverIds.isEmpty()) {
                List<Race> teamRaces = raceRepository.findByDriverIdInAndPositionIsNotNull(teamDriverIds);
                if (!teamRaces.isEmpty()) {
                    teamAvgFinish = teamRaces.stream().mapToInt(Race::getPosition).average().orElse(10.0);
                }
            }
        }

        // 11. years_experience — approximate default
        int yearsExperience = 3;

        // 12. championship_position — derived from points standings
        List<Driver> standings = driverRepository.findBySeasonOrderByPointsDesc(seasonYear);
        int championshipPosition = 10;
        for (int i = 0; i < standings.size(); i++) {
            if (standings.get(i).getId().equals(driverId)) {
                championshipPosition = i + 1;
                break;
            }
        }

        // Check if we have sufficient historical data
        boolean insufficientData = allDriverRaces.isEmpty();

        // Build ML service payload — exactly the 12 features in order
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("career_avg_finish", round2(careerAvgFinish));
        payload.put("career_wins", careerWins);
        payload.put("career_poles", careerPoles);
        payload.put("recent_5_avg", round2(recent5Avg));
        payload.put("recent_10_avg", round2(recent10Avg));
        payload.put("circuit_avg_finish", round2(circuitAvgFinish));
        payload.put("circuit_appearances", circuitAppearances);
        payload.put("season_avg_finish", round2(seasonAvgFinish));
        payload.put("grid_position", gridPosition);
        payload.put("team_avg_finish", round2(teamAvgFinish));
        payload.put("years_experience", yearsExperience);
        payload.put("championship_position", championshipPosition);

        // Call ML service
        DriverIntelligenceResponse mlResponse = mlClientService.predict(payload);

        // Map to PredictionResponseDTO with clamping to valid F1 position range
        PredictionResponseDTO response = new PredictionResponseDTO();
        double rfClamped = Math.max(1.0, Math.min(22.0, mlResponse.getRfPrediction()));
        double xgbClamped = Math.max(1.0, Math.min(22.0, mlResponse.getXgbPrediction()));
        double blended = (rfClamped + xgbClamped) / 2.0;
        response.setPredictedPosition(Math.round(Math.max(1.0, Math.min(22.0, blended))));
        response.setConfidence(mlResponse.getConfidence());
        response.setConfidenceLabel(mlResponse.getConfidenceLabel());
        response.setRfPrediction(rfClamped);
        response.setXgbPrediction(xgbClamped);
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
        response.setInsufficientData(insufficientData);

        log.info("Prediction complete: position={}, confidence={}, rf={}, xgb={}, insufficientData={}",
                 response.getPredictedPosition(), response.getConfidence(),
                 response.getRfPrediction(), response.getXgbPrediction(),
                 response.isInsufficientData());

        return response;
    }

    private static double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
