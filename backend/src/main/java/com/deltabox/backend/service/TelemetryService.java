package com.deltabox.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.*;

@Service
public class TelemetryService {

    private static final Logger log = LoggerFactory.getLogger(TelemetryService.class);
    private static final String OPENF1_BASE = "https://api.openf1.org/v1";
    private static final long SESSIONS_CACHE_TTL_MS = 3600_000;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    private List<Map<String, Object>> cachedSessions;
    private Instant sessionsCacheTime;

    public TelemetryService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setReadTimeout(30_000);
        factory.setConnectTimeout(30_000);
        this.restTemplate = new RestTemplate(factory);
        this.objectMapper = new ObjectMapper();
    }

    public List<Map<String, Object>> getSessions(int year) {
        if (cachedSessions != null && Instant.now().minusMillis(SESSIONS_CACHE_TTL_MS).isBefore(sessionsCacheTime)) {
            return cachedSessions;
        }
        try {
            String url = OPENF1_BASE + "/sessions?year=" + year;
            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);
            Map<String, Map<String, Object>> unique = new LinkedHashMap<>();
            if (root != null && root.isArray()) {
                for (JsonNode node : root) {
                    String sessionType = node.path("session_type").asText("");
                    if (!"Qualifying".equals(sessionType) && !"Race".equals(sessionType)) {
                        continue;
                    }
                    String circuitName = node.path("circuit_short_name").asText();
                    String key = circuitName + "|" + sessionType;
                    String dateStart = node.path("date_start").asText();
                    if (!unique.containsKey(key) || dateStart.compareTo((String) unique.get(key).get("dateStart")) > 0) {
                        Map<String, Object> session = new LinkedHashMap<>();
                        session.put("sessionKey", node.path("session_key").asLong());
                        session.put("meetingName", node.path("session_name").asText());
                        session.put("sessionType", sessionType);
                        session.put("dateStart", dateStart);
                        session.put("circuitName", circuitName);
                        session.put("year", node.path("year").asInt());
                        unique.put(key, session);
                    }
                }
            }
            List<Map<String, Object>> sessions = new ArrayList<>(unique.values());
            sessions.sort((a, b) -> ((String) b.get("dateStart")).compareTo((String) a.get("dateStart")));
            cachedSessions = sessions;
            sessionsCacheTime = Instant.now();
            return sessions;
        } catch (Exception e) {
            log.warn("Failed to fetch sessions from OpenF1: {}", e.getMessage());
            return cachedSessions != null ? cachedSessions : List.of();
        }
    }

    public List<Map<String, Object>> getDrivers(long sessionKey) {
        try {
            String url = OPENF1_BASE + "/drivers?session_key=" + sessionKey;
            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);
            List<Map<String, Object>> drivers = new ArrayList<>();
            if (root != null && root.isArray()) {
                for (JsonNode node : root) {
                    Map<String, Object> driver = new LinkedHashMap<>();
                    driver.put("driverNumber", node.path("driver_number").asInt());
                    driver.put("code", node.path("name_acronym").asText());
                    driver.put("fullName", node.path("full_name").asText());
                    driver.put("teamName", node.path("team_name").asText());
                    driver.put("teamColor", node.path("team_colour").asText());
                    drivers.add(driver);
                }
            }
            return drivers;
        } catch (Exception e) {
            log.warn("Failed to fetch drivers for session {}: {}", sessionKey, e.getMessage());
            return List.of();
        }
    }

    public List<Map<String, Object>> getLaps(long sessionKey, int driverNumber) {
        try {
            String url = OPENF1_BASE + "/laps?session_key=" + sessionKey + "&driver_number=" + driverNumber;
            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);
            List<Map<String, Object>> laps = new ArrayList<>();
            if (root != null && root.isArray()) {
                for (JsonNode node : root) {
                    if (node.path("lap_duration").isNull()) continue;
                    Map<String, Object> lap = new LinkedHashMap<>();
                    lap.put("lapNumber", node.path("lap_number").asInt());
                    lap.put("lapDuration", node.path("lap_duration").asDouble());
                    laps.add(lap);
                }
            }
            return laps;
        } catch (Exception e) {
            log.warn("Failed to fetch laps for driver {} session {}: {}", driverNumber, sessionKey, e.getMessage());
            return List.of();
        }
    }

    public Map<String, Object> compareLaps(long sessionKey, int driverNumberA, int driverNumberB, int lapA, int lapB) {
        try {
            // Fetch lap timing to get date_start for each driver's lap
            JsonNode lapsA = fetchAsJson(OPENF1_BASE + "/laps?session_key=" + sessionKey + "&driver_number=" + driverNumberA + "&lap_number=" + lapA);
            JsonNode lapsB = fetchAsJson(OPENF1_BASE + "/laps?session_key=" + sessionKey + "&driver_number=" + driverNumberB + "&lap_number=" + lapB);

            if (lapsA == null || !lapsA.isArray() || lapsA.isEmpty() ||
                lapsB == null || !lapsB.isArray() || lapsB.isEmpty()) {
                return errorResult("No telemetry available for this lap");
            }

            String startA = lapsA.get(0).path("date_start").asText();
            double durationA = lapsA.get(0).path("lap_duration").asDouble();
            String startB = lapsB.get(0).path("date_start").asText();
            double durationB = lapsB.get(0).path("lap_duration").asDouble();

            Instant lapStartA = Instant.parse(startA);
            Instant lapEndA = lapStartA.plusMillis((long) (durationA * 1000));
            Instant lapStartB = Instant.parse(startB);
            Instant lapEndB = lapStartB.plusMillis((long) (durationB * 1000));

            // Fetch all car data for both drivers
            JsonNode allDataA = fetchAsJson(OPENF1_BASE + "/car_data?session_key=" + sessionKey + "&driver_number=" + driverNumberA);
            JsonNode allDataB = fetchAsJson(OPENF1_BASE + "/car_data?session_key=" + sessionKey + "&driver_number=" + driverNumberB);

            if (allDataA == null || !allDataA.isArray() || allDataA.isEmpty() ||
                allDataB == null || !allDataB.isArray() || allDataB.isEmpty()) {
                return errorResult("No telemetry available for this lap");
            }

            // Filter car_data to lap time window
            List<JsonNode> filteredA = new ArrayList<>();
            List<JsonNode> filteredB = new ArrayList<>();
            for (JsonNode node : allDataA) {
                Instant t = Instant.parse(node.path("date").asText());
                if (!t.isBefore(lapStartA) && t.isBefore(lapEndA)) {
                    filteredA.add(node);
                }
            }
            for (JsonNode node : allDataB) {
                Instant t = Instant.parse(node.path("date").asText());
                if (!t.isBefore(lapStartB) && t.isBefore(lapEndB)) {
                    filteredB.add(node);
                }
            }

            if (filteredA.isEmpty() || filteredB.isEmpty()) {
                return errorResult("No telemetry available for this lap");
            }

            // Sample at equal intervals — every 10th point
            List<Double> distance = new ArrayList<>();
            List<Integer> speedA = new ArrayList<>();
            List<Integer> speedB = new ArrayList<>();
            List<Integer> throttleA = new ArrayList<>();
            List<Integer> throttleB = new ArrayList<>();
            List<Integer> brakeA = new ArrayList<>();
            List<Integer> brakeB = new ArrayList<>();

            // Generate distance as sequential index-based approximation
            int step = 10;
            int len = Math.min(filteredA.size(), filteredB.size());
            for (int i = 0; i < len; i += step) {
                distance.add((double) i / len * 100);
                speedA.add(filteredA.get(i).path("speed").asInt());
                speedB.add(filteredB.get(i).path("speed").asInt());
                throttleA.add(filteredA.get(i).path("throttle").asInt());
                throttleB.add(filteredB.get(i).path("throttle").asInt());
                brakeA.add(filteredA.get(i).path("brake").asInt(0));
                brakeB.add(filteredB.get(i).path("brake").asInt(0));
            }

            // Calculate sector deltas from date timestamps
            List<Double> sectors = new ArrayList<>();
            double totalDelta = 0;
            try {
                int sectorPoints = len / 3;
                for (int s = 0; s < 3; s++) {
                    int idx = Math.min((s + 1) * sectorPoints - 1, len - 1);
                    double timeA = Instant.parse(filteredA.get(idx).path("date").asText()).toEpochMilli();
                    double timeB = Instant.parse(filteredB.get(idx).path("date").asText()).toEpochMilli();
                    sectors.add(Math.round((timeA - timeB) / 10.0) / 100.0);
                }
                double lastTimeA = Instant.parse(filteredA.get(len - 1).path("date").asText()).toEpochMilli();
                double lastTimeB = Instant.parse(filteredB.get(len - 1).path("date").asText()).toEpochMilli();
                totalDelta = Math.round((lastTimeA - lastTimeB) / 10.0) / 100.0;
            } catch (Exception e) {
                log.warn("Delta calculation failed: {}", e.getMessage());
                sectors = List.of(0.0, 0.0, 0.0);
            }

            Map<String, Object> telemetry = new LinkedHashMap<>();
            telemetry.put("distance", distance);
            telemetry.put("speedA", speedA);
            telemetry.put("speedB", speedB);
            telemetry.put("throttleA", throttleA);
            telemetry.put("throttleB", throttleB);
            telemetry.put("brakeA", brakeA);
            telemetry.put("brakeB", brakeB);

            Map<String, Object> delta = new LinkedHashMap<>();
            delta.put("sectors", sectors);
            delta.put("total", totalDelta);

            // Fetch driver info
            Map<String, Object> driverAInfo = new LinkedHashMap<>();
            Map<String, Object> driverBInfo = new LinkedHashMap<>();
            for (Map<String, Object> d : getDrivers(sessionKey)) {
                int num = (int) d.get("driverNumber");
                if (num == driverNumberA) driverAInfo = d;
                if (num == driverNumberB) driverBInfo = d;
            }

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("driverA", driverAInfo);
            result.put("driverB", driverBInfo);
            result.put("telemetry", telemetry);
            result.put("delta", delta);
            return result;

        } catch (Exception e) {
            log.warn("Failed to compare laps: {}", e.getMessage());
            return errorResult("No telemetry available for this lap");
        }
    }

    private JsonNode fetchAsJson(String url) {
        try {
            String response = restTemplate.getForObject(url, String.class);
            return objectMapper.readTree(response);
        } catch (Exception e) {
            log.warn("OpenF1 fetch failed: {}", e.getMessage());
            return null;
        }
    }

    private Map<String, Object> errorResult(String message) {
        Map<String, Object> error = new LinkedHashMap<>();
        error.put("error", message);
        return error;
    }
}
