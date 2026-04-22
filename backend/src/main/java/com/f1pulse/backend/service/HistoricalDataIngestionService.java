package com.deltabox.backend.service;

import com.deltabox.backend.model.*;
import com.deltabox.backend.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Service to ingest historical F1 data from Ergast API
 * Fetches data for seasons 1950-2026 and stores in database
 */
@Slf4j
@Service
public class HistoricalDataIngestionService {

    private static final String ERGAST_BASE_URL = "https://ergast.com/api/f1";
    private static final int RATE_LIMIT_DELAY_MS = 500;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private HistoricalSeasonRepository seasonRepository;

    @Autowired
    private HistoricalRaceRepository raceRepository;

    @Autowired
    private HistoricalDriverRepository driverRepository;

    @Autowired
    private HistoricalConstructorRepository constructorRepository;

    @Autowired
    private HistoricalResultRepository resultRepository;

    /**
     * Ingests all F1 historical data from 1950 to current year
     */
    @Transactional
    public void ingestAllHistoricalData() {
        log.info("🚀 Starting full F1 historical data ingestion (1950-2026)");
        long startTime = System.currentTimeMillis();

        try {
            for (int year = 1950; year <= 2026; year++) {
                try {
                    ingestSeason(year);
                    Thread.sleep(RATE_LIMIT_DELAY_MS); // Rate limiting
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("Ingestion interrupted", e);
                }
            }

            long duration = System.currentTimeMillis() - startTime;
            log.info("✅ Full historical data ingestion completed in {} ms", duration);

        } catch (Exception e) {
            log.error("❌ Error during full historical ingestion", e);
            throw new RuntimeException(e);
        }
    }

    /**
     * Ingests data for a single season
     */
    @Transactional
    public void ingestSeason(Integer year) {
        log.info("📅 Ingesting season: {}", year);

        try {
            // Fetch and store season info
            Map<String, Object> seasonData = fetchSeasonData(year);
            if (seasonData == null) {
                log.warn("⚠️  No data found for season {}", year);
                return;
            }

            // Create or update season
            HistoricalSeason season = seasonRepository.findByYear(year)
                    .orElse(new HistoricalSeason(year, 0));
            season.setYear(year);
            if (seasonData.containsKey("totalRounds")) {
                season.setTotalRounds((Integer) seasonData.get("totalRounds"));
            }
            seasonRepository.save(season);

            Thread.sleep(RATE_LIMIT_DELAY_MS);

            // Fetch and store races
            List<Map<String, Object>> races = fetchRaces(year);
            for (Map<String, Object> raceData : races) {
                storeRace(year, raceData);
                Thread.sleep(RATE_LIMIT_DELAY_MS);
            }

            // Fetch and store results
            List<Map<String, Object>> results = fetchResults(year);
            int resultCount = 0;
            for (Map<String, Object> resultData : results) {
                storeResult(resultData);
                resultCount++;
            }
            log.info("✅ Season {} completed: {} races, {} results ingested", 
                    year, races.size(), resultCount);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Ingestion interrupted", e);
        } catch (Exception e) {
            log.error("❌ Error ingesting season {}: {}", year, e.getMessage(), e);
        }
    }

    // ============= ERGAST API CALLS =============

    /**
     * Fetches season data from Ergast API
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> fetchSeasonData(Integer year) {
        try {
            String url = String.format("%s/%d.json", ERGAST_BASE_URL, year);
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response == null || !response.containsKey("MRData")) {
                return null;
            }

            Map<String, Object> mrData = (Map<String, Object>) response.get("MRData");
            List<Map<String, Object>> seasons = (List<Map<String, Object>>) mrData.get("SeasonTable");

            if (seasons == null || seasons.isEmpty()) {
                return null;
            }

            Map<String, Object> season = seasons.get(0);
            Map<String, Object> result = new HashMap<>();
            result.put("year", year);
            result.put("totalRounds", Integer.parseInt((String) season.getOrDefault("round", "0")));

            return result;

        } catch (Exception e) {
            log.warn("⚠️  Could not fetch season data for {}: {}", year, e.getMessage());
            return null;
        }
    }

    /**
     * Fetches all races for a given season
     */
    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> fetchRaces(Integer year) {
        List<Map<String, Object>> races = new ArrayList<>();
        int offset = 0;
        int limit = 1000;
        boolean hasMore = true;

        while (hasMore) {
            try {
                String url = String.format("%s/%d/races.json?offset=%d&limit=%d", 
                        ERGAST_BASE_URL, year, offset, limit);
                Map<String, Object> response = restTemplate.getForObject(url, Map.class);

                if (response == null || !response.containsKey("MRData")) {
                    break;
                }

                Map<String, Object> mrData = (Map<String, Object>) response.get("MRData");
                List<Map<String, Object>> raceTable = (List<Map<String, Object>>) 
                        mrData.getOrDefault("RaceTable", new ArrayList<>());

                if (raceTable.isEmpty()) {
                    hasMore = false;
                } else {
                    races.addAll(raceTable);
                    offset += limit;
                    // Check if we got less than limit (indicating end of data)
                    if (raceTable.size() < limit) {
                        hasMore = false;
                    }
                }

                Thread.sleep(RATE_LIMIT_DELAY_MS);

            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Interrupted during race fetch", e);
            } catch (Exception e) {
                log.warn("⚠️  Error fetching races for {}: {}", year, e.getMessage());
                hasMore = false;
            }
        }

        return races;
    }

    /**
     * Fetches all results for a given season
     */
    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> fetchResults(Integer year) {
        List<Map<String, Object>> results = new ArrayList<>();
        int offset = 0;
        int limit = 1000;
        boolean hasMore = true;

        while (hasMore) {
            try {
                String url = String.format("%s/%d/results.json?offset=%d&limit=%d", 
                        ERGAST_BASE_URL, year, offset, limit);
                Map<String, Object> response = restTemplate.getForObject(url, Map.class);

                if (response == null || !response.containsKey("MRData")) {
                    break;
                }

                Map<String, Object> mrData = (Map<String, Object>) response.get("MRData");
                List<Map<String, Object>> resultTable = (List<Map<String, Object>>) 
                        mrData.getOrDefault("RaceTable", new ArrayList<>());

                if (resultTable.isEmpty()) {
                    hasMore = false;
                } else {
                    // Extract results from races
                    for (Map<String, Object> race : resultTable) {
                        List<Map<String, Object>> raceResults = (List<Map<String, Object>>) 
                                race.getOrDefault("Results", new ArrayList<>());
                        raceResults.forEach(r -> {
                            r.put("raceData", race); // Attach race info to each result
                            results.add(r);
                        });
                    }

                    offset += limit;
                    if (resultTable.size() < limit) {
                        hasMore = false;
                    }
                }

                Thread.sleep(RATE_LIMIT_DELAY_MS);

            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Interrupted during results fetch", e);
            } catch (Exception e) {
                log.warn("⚠️  Error fetching results for {}: {}", year, e.getMessage());
                hasMore = false;
            }
        }

        return results;
    }

    // ============= DATA STORAGE =============

    /**
     * Stores a race in the database
     */
    @SuppressWarnings("unchecked")
    private void storeRace(Integer year, Map<String, Object> raceData) {
        try {
            Integer round = Integer.parseInt((String) raceData.getOrDefault("round", "0"));
            String raceName = (String) raceData.get("name");

            // Find or create race
            HistoricalRace race = raceRepository.findBySeasonYearAndRound(year, round)
                    .orElse(new HistoricalRace());

            race.setSeasonYear(year);
            race.setRound(round);
            race.setRaceName(raceName);
            race.setStatus("COMPLETED");

            // Extract circuit info
            Map<String, Object> circuit = (Map<String, Object>) raceData.get("Circuit");
            if (circuit != null) {
                race.setCircuitName((String) circuit.get("circuitName"));
                Map<String, Object> location = (Map<String, Object>) circuit.get("Location");
                if (location != null) {
                    race.setCircuitCountry((String) location.get("country"));
                }
            }

            // Parse race date
            String dateStr = (String) raceData.get("date");
            if (dateStr != null && !dateStr.isEmpty()) {
                try {
                    race.setRaceDate(LocalDate.parse(dateStr, DATE_FORMATTER));
                } catch (Exception e) {
                    log.warn("Could not parse race date: {}", dateStr);
                }
            }

            raceRepository.save(race);

        } catch (Exception e) {
            log.warn("⚠️  Error storing race: {}", e.getMessage());
        }
    }

    /**
     * Stores a race result in the database
     */
    @SuppressWarnings("unchecked")
    private void storeResult(Map<String, Object> resultData) {
        try {
            // Get race info (attached by fetchResults)
            Map<String, Object> raceData = (Map<String, Object>) resultData.get("raceData");
            if (raceData == null) return;

            Integer year = Integer.parseInt((String) raceData.get("season"));
            Integer round = Integer.parseInt((String) raceData.get("round"));

            // Find race
            HistoricalRace race = raceRepository.findBySeasonYearAndRound(year, round)
                    .orElse(null);
            if (race == null) return;

            // Get driver info
            Map<String, Object> driver = (Map<String, Object>) resultData.get("Driver");
            if (driver == null) return;

            String driverRef = (String) driver.get("driverId");
            HistoricalDriver historicalDriver = driverRepository.findByDriverRef(driverRef)
                    .orElse(new HistoricalDriver());

            if (historicalDriver.getId() == null) {
                historicalDriver.setDriverRef(driverRef);
                historicalDriver.setCode((String) driver.getOrDefault("code", ""));
                historicalDriver.setFullName(driver.get("givenName") + " " + driver.get("familyName"));
                historicalDriver.setNationality((String) driver.get("nationality"));
                driverRepository.save(historicalDriver);
            }

            // Get constructor info
            Map<String, Object> constructor = (Map<String, Object>) resultData.get("Constructor");
            HistoricalConstructor historicalConstructor = null;
            if (constructor != null) {
                String constructorRef = (String) constructor.get("constructorId");
                historicalConstructor = constructorRepository.findByConstructorRef(constructorRef)
                        .orElse(new HistoricalConstructor());

                if (historicalConstructor.getId() == null) {
                    historicalConstructor.setConstructorRef(constructorRef);
                    historicalConstructor.setName((String) constructor.get("name"));
                    historicalConstructor.setNationality((String) constructor.get("nationality"));
                    constructorRepository.save(historicalConstructor);
                }
            }

            // Create or update result
            HistoricalResult result = resultRepository
                    .findByRaceIdAndDriverId(race.getId(), historicalDriver.getId())
                    .orElse(new HistoricalResult());

            result.setRaceId(race.getId());
            result.setDriverId(historicalDriver.getId());
            if (historicalConstructor != null) {
                result.setConstructorId(historicalConstructor.getId());
            }

            // Parse grid and finish position
            String gridStr = (String) resultData.get("grid");
            if (gridStr != null && !gridStr.isEmpty() && !"0".equals(gridStr)) {
                result.setGridPosition(Integer.parseInt(gridStr));
            }

            String positionStr = (String) resultData.get("position");
            if (positionStr != null && !positionStr.isEmpty() && !"R".equals(positionStr)) {
                try {
                    result.setFinishPosition(Integer.parseInt(positionStr));
                } catch (NumberFormatException e) {
                    // Position might be "R" or other non-numeric value
                }
            }

            // Parse points
            String pointsStr = (String) resultData.get("points");
            if (pointsStr != null && !pointsStr.isEmpty()) {
                try {
                    result.setPoints(new BigDecimal(pointsStr));
                } catch (NumberFormatException e) {
                    result.setPoints(BigDecimal.ZERO);
                }
            }

            result.setStatus((String) resultData.getOrDefault("status", "Finished"));

            resultRepository.save(result);

        } catch (Exception e) {
            log.warn("⚠️  Error storing result: {}", e.getMessage());
        }
    }

    /**
     * Get current ingestion status
     */
    public Map<String, Object> getIngestionStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("totalRaces", raceRepository.count());
        status.put("totalResults", resultRepository.count());
        status.put("totalDrivers", driverRepository.count());
        status.put("totalConstructors", constructorRepository.count());
        status.put("yearsIngested", seasonRepository.count());
        status.put("lastUpdated", new Date());
        return status;
    }
}
