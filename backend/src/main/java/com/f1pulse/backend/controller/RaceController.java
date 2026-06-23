package com.f1pulse.backend.controller;

import com.f1pulse.backend.model.Race;
import com.f1pulse.backend.model.HistoricalResult;
import com.f1pulse.backend.model.Driver;
import com.f1pulse.backend.model.Constructor;
import com.f1pulse.backend.repository.RaceRepository;
import com.f1pulse.backend.repository.HistoricalResultRepository;
import com.f1pulse.backend.repository.DriverRepository;
import com.f1pulse.backend.repository.ConstructorRepository;
import com.f1pulse.backend.dto.ApiResponse;
import com.f1pulse.backend.dto.PodiumDriverDTO;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.ArrayList;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/races")
@Tag(name = "Races", description = "F1 race schedule and results")
public class RaceController {

    private static final Logger logger = LoggerFactory.getLogger(RaceController.class);
    private final RaceRepository raceRepository;
    private final HistoricalResultRepository historicalResultRepository;
    private final DriverRepository driverRepository;
    private final ConstructorRepository constructorRepository;

    public RaceController(RaceRepository raceRepository,
                        HistoricalResultRepository historicalResultRepository,
                        DriverRepository driverRepository,
                        ConstructorRepository constructorRepository) {
        this.raceRepository = raceRepository;
        this.historicalResultRepository = historicalResultRepository;
        this.driverRepository = driverRepository;
        this.constructorRepository = constructorRepository;
    }

    @GetMapping
    public ResponseEntity<?> getAllRaces() {
        logger.info("GET /api/races - Request received");
        try {
            logger.info("Fetching races for season 2026");
            List<Race> races = raceRepository.findBySeasonAndDriverIdIsNullOrderByDateAsc(2026);
            logger.info("Found {} races for season 2026", races.size());

            // Return empty list gracefully if no races found
            if (races.isEmpty()) {
                logger.info("No races found in database - returning empty list");
                return ResponseEntity.ok(races); // Return empty list instead of error
            }

            // Defensive dedupe: one schedule row per round.
            Map<String, Race> uniqueByRound = new LinkedHashMap<>();
            for (Race race : races) {
                String key = race.getRound() != null
                        ? "round-" + race.getRound()
                        : "fallback-" + race.getRaceName() + "-" + race.getDate();
                uniqueByRound.putIfAbsent(key, race);
            }

            List<Race> cleaned = uniqueByRound.values().stream()
                    .sorted(
                            Comparator.comparing((Race r) -> Objects.requireNonNullElse(r.getRound(), Integer.MAX_VALUE))
                                    .thenComparing(Race::getDate, Comparator.nullsLast(String::compareTo))
                    )
                    .peek(race -> race.setStatus(resolveRaceStatus(race.getDate())))
                    .toList();

            logger.info("Returning {} unique races after deduplication", cleaned.size());
            return ResponseEntity.ok(cleaned);
        } catch (Exception e) {
            logger.error("Failed to load races", e);
            return ResponseEntity.status(500).body("Failed to load races: " + e.getMessage());
        }
    }

    @GetMapping("/{raceId}")
    public ResponseEntity<?> getRaceById(@PathVariable Long raceId) {
        logger.info("GET /api/races/{} - Request received", raceId);
        try {
            Optional<Race> race = raceRepository.findById(raceId);
            if (race.isPresent()) {
                logger.info("Race found: {}", race.get().getRaceName());
                return ResponseEntity.ok(race.get());
            } else {
                logger.info("Race not found with ID: {}", raceId);
                return ResponseEntity.status(404).body("Race not found");
            }
        } catch (Exception e) {
            logger.error("Failed to fetch race with ID: {}", raceId, e);
            return ResponseEntity.status(500).body("Failed to fetch race: " + e.getMessage());
        }
    }

    @GetMapping("/{raceId}/results")
    public ResponseEntity<?> getRaceResults(@PathVariable Long raceId) {
        logger.info("GET /api/races/{}/results - Request received", raceId);
        try {
            // Get the race schedule row (has driverId=null, position=null)
            Optional<Race> scheduleRow = raceRepository.findById(raceId);
            if (scheduleRow.isEmpty()) {
                logger.info("Race not found with ID: {}", raceId);
                return ResponseEntity.status(404).body("Race not found");
            }
            
            Race race = scheduleRow.get();
            Integer round = race.getRound();
            
            // Query all result rows for this round (have driverId!=null, position!=null)
            List<Race> allResults = raceRepository.findByRoundAndDriverIdIsNotNullOrderByPositionAsc(round);
            logger.info("Found {} results for race round {}", allResults.size(), round);

            if (allResults.isEmpty()) {
                logger.info("No results found for race round {}, returning empty list", round);
                return ResponseEntity.ok(new ArrayList<>());
            }

            // Map to PodiumDriverDTO, getting top 3 finishers
            List<PodiumDriverDTO> podium = allResults.stream()
                    .filter(result -> result.getPosition() != null && result.getPosition() <= 3)
                    .sorted(Comparator.comparing(Race::getPosition))
                    .map(result -> {
                        // Fetch driver information
                        Driver driver = driverRepository.findById(result.getDriverId()).orElse(null);
                        
                        // Calculate points based on F1 2026 scoring system
                        Integer points = calculatePoints(result.getPosition());
                        
                        String driverCode = driver != null ? driver.getCode() : "N/A";
                        String driverName = driver != null ? driver.getName() : "Unknown Driver";
                        String nationality = driver != null ? driver.getNationality() : "Unknown";
                        String teamName = driver != null ? driver.getTeam() : "Unknown Team";

                        logger.debug("Mapped result: position={}, driver={}, code={}, points={}", 
                                result.getPosition(), driverName, driverCode, points);

                        return new PodiumDriverDTO(
                                result.getPosition(),
                                driverCode,
                                driverName,
                                nationality,
                                teamName,
                                points
                        );
                    })
                    .limit(3)
                    .collect(Collectors.toList());

            logger.info("Returning {} podium finishers for race {}", podium.size(), raceId);
            return ResponseEntity.ok(podium);
        } catch (Exception e) {
            logger.error("Failed to fetch results for race ID: {}", raceId, e);
            return ResponseEntity.status(500).body("Failed to fetch results: " + e.getMessage());
        }
    }

    @GetMapping("/{raceId}/podium")
    public ResponseEntity<?> getRacePodium(@PathVariable Long raceId) {
        // Alias endpoint for /results - delegates to getRaceResults
        logger.info("GET /api/races/{}/podium - Request received (delegating to /results)", raceId);
        return getRaceResults(raceId);
    }

    private Integer calculatePoints(Integer position) {
        // F1 points system for 2026
        switch (position) {
            case 1: return 25;
            case 2: return 18;
            case 3: return 15;
            default: return 0;
        }
    }

    private static String resolveRaceStatus(String raceDate) {
        try {
            LocalDate parsed = LocalDate.parse(raceDate);
            return parsed.isAfter(LocalDate.now()) ? "SCHEDULED" : "COMPLETED";
        } catch (Exception ex) {
            return "SCHEDULED";
        }
    }
}
