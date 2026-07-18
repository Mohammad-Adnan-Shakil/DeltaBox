package com.deltabox.backend.ai.service;

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
public class RaceEngineerDataService {

    private static final Logger log = LoggerFactory.getLogger(RaceEngineerDataService.class);
    private static final String OPENF1_BASE = "https://api.openf1.org/v1";
    private static final long RATE_LIMIT_DELAY_MS = 400;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public RaceEngineerDataService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setReadTimeout(60_000);
        factory.setConnectTimeout(15_000);
        this.restTemplate = new RestTemplate(factory);
        this.objectMapper = new ObjectMapper();
    }

    public Map<String, Object> getLiveSession() {
        try {
            List<Map<String, Object>> races = fetchRaceSessions(2026);
            Instant now = Instant.now();
            for (Map<String, Object> s : races) {
                String startStr = (String) s.get("dateStart");
                String endStr = (String) s.get("dateEnd");
                if (startStr != null && endStr != null) {
                    Instant start = Instant.parse(startStr);
                    Instant end = Instant.parse(endStr);
                    if (!now.isBefore(start) && !now.isAfter(end)) {
                        return s;
                    }
                }
            }
            return null;
        } catch (Exception e) {
            log.warn("Failed to detect live session: {}", e.getMessage());
            return null;
        }
    }

    public List<Map<String, Object>> getReplaySessions() {
        return fetchRaceSessions(2026);
    }

    public List<Map<String, Object>> getSessionDrivers(long sessionKey) {
        try {
            String url = OPENF1_BASE + "/drivers?session_key=" + sessionKey;
            JsonNode root = fetchAsJson(url);
            List<Map<String, Object>> drivers = new ArrayList<>();
            if (root != null && root.isArray()) {
                for (JsonNode node : root) {
                    Map<String, Object> d = new LinkedHashMap<>();
                    d.put("driverNumber", node.path("driver_number").asInt());
                    d.put("code", node.path("name_acronym").asText());
                    d.put("fullName", node.path("full_name").asText());
                    d.put("teamName", node.path("team_name").asText());
                    d.put("teamColor", node.path("team_colour").asText());
                    drivers.add(d);
                }
            }
            return drivers;
        } catch (Exception e) {
            log.warn("Failed to fetch drivers for session {}: {}", sessionKey, e.getMessage());
            return List.of();
        }
    }

    public Map<String, Object> getRaceState(long sessionKey, int driverNumber, Integer asOfLap) {
        try {
            String lapsUrl = OPENF1_BASE + "/laps?session_key=" + sessionKey + "&driver_number=" + driverNumber;
            JsonNode lapsData = fetchAsJson(lapsUrl);
            sleepBetweenCalls();

            String posUrl = OPENF1_BASE + "/position?session_key=" + sessionKey + "&driver_number=" + driverNumber;
            JsonNode posData = fetchAsJson(posUrl);
            sleepBetweenCalls();

            String intervalsUrl = OPENF1_BASE + "/intervals?session_key=" + sessionKey;
            JsonNode intervalsData = fetchAsJson(intervalsUrl);
            sleepBetweenCalls();

            String stintsUrl = OPENF1_BASE + "/stints?session_key=" + sessionKey + "&driver_number=" + driverNumber;
            JsonNode stintsData = fetchAsJson(stintsUrl);

            String sessionUrl = OPENF1_BASE + "/sessions?session_key=" + sessionKey;
            JsonNode sessionInfo = fetchAsJson(sessionUrl);

            return computeRaceState(lapsData, posData, intervalsData, stintsData, sessionInfo, driverNumber, asOfLap);

        } catch (Exception e) {
            log.warn("Failed to fetch race state: {}", e.getMessage());
            Map<String, Object> error = new LinkedHashMap<>();
            error.put("error", e.getMessage());
            return error;
        }
    }

    private Map<String, Object> computeRaceState(JsonNode lapsData, JsonNode posData, JsonNode intervalsData,
                                                  JsonNode stintsData, JsonNode sessionInfo, int driverNumber,
                                                  Integer asOfLap) {
        Map<String, Object> state = new LinkedHashMap<>();
        state.put("driverNumber", driverNumber);

        int totalLaps = 0;
        double lastLapDuration = 0;
        int lastCompletedLap = 0;
        Map<Integer, LapInfo> lapMap = new LinkedHashMap<>();

        if (lapsData != null && lapsData.isArray()) {
            for (JsonNode lap : lapsData) {
                int lapNum = lap.path("lap_number").asInt();
                totalLaps = Math.max(totalLaps, lapNum);
                if (!lap.path("lap_duration").isNull()) {
                    lastCompletedLap = Math.max(lastCompletedLap, lapNum);
                    double duration = lap.path("lap_duration").asDouble();
                    String dateStart = lap.path("date_start").asText();
                    lapMap.put(lapNum, new LapInfo(lapNum, duration, dateStart));
                    if (lapNum == lastCompletedLap) {
                        lastLapDuration = duration;
                    }
                }
            }
        }

        int currentLap = (asOfLap != null) ? asOfLap : lastCompletedLap;
        state.put("lap", currentLap);
        state.put("totalLaps", totalLaps);

        Instant lapEndInstant = null;
        if (lapMap.containsKey(currentLap)) {
            LapInfo li = lapMap.get(currentLap);
            if (li.duration > 0) {
                lapEndInstant = Instant.parse(li.dateStart).plusMillis((long) (li.duration * 1000));
            }
        }

        state.put("lastLapTime", lastLapDuration > 0 ? formatLapTime(lastLapDuration) : "");

        if (posData != null && posData.isArray()) {
            int position = 0;
            Instant latestPosTime = null;
            for (JsonNode pos : posData) {
                String dateStr = pos.path("date").asText();
                if (dateStr.isEmpty()) continue;
                Instant posTime = Instant.parse(dateStr);
                if (lapEndInstant != null && posTime.isAfter(lapEndInstant)) continue;
                if (latestPosTime == null || posTime.isAfter(latestPosTime)) {
                    latestPosTime = posTime;
                    position = pos.path("position").asInt();
                }
            }
            state.put("position", position);
        } else {
            state.put("position", 0);
        }

        double currentGapToLeader = 0;
        double currentGapToNext = 0;
        boolean intervalsFound = false;
        if (intervalsData != null && intervalsData.isArray()) {
            Instant latestIntervalTime = null;
            for (JsonNode iv : intervalsData) {
                if (iv.path("driver_number").asInt() != driverNumber) continue;
                String dateStr = iv.path("date").asText();
                if (dateStr.isEmpty()) continue;
                Instant ivTime = Instant.parse(dateStr);
                if (lapEndInstant != null && ivTime.isAfter(lapEndInstant)) continue;
                if (latestIntervalTime == null || ivTime.isAfter(latestIntervalTime)) {
                    latestIntervalTime = ivTime;
                    currentGapToLeader = iv.path("gap_to_leader").asDouble(0);
                    JsonNode intervalNode = iv.path("interval");
                    currentGapToNext = intervalNode.isNull() ? 0 : intervalNode.asDouble(0);
                    intervalsFound = true;
                }
            }
            state.put("gapToLeader", intervalsFound ? formatGap(currentGapToLeader) : "");
            state.put("gapToNext", intervalsFound ? formatGap(currentGapToNext) : "");
            state.put("gapToLeaderRaw", intervalsFound ? currentGapToLeader : null);
            state.put("gapToNextRaw", intervalsFound ? currentGapToNext : null);
        } else {
            state.put("gapToLeader", "");
            state.put("gapToNext", "");
            state.put("gapToLeaderRaw", null);
            state.put("gapToNextRaw", null);
        }

        if (stintsData != null && stintsData.isArray()) {
            String compound = "";
            int tyreAge = 0;
            for (JsonNode stint : stintsData) {
                int start = stint.path("lap_start").asInt();
                int end = stint.path("lap_end").asInt();
                if (currentLap >= start && currentLap <= end) {
                    JsonNode compNode = stint.path("compound");
                    compound = compNode.isNull() ? "" : compNode.asText();
                    tyreAge = stint.path("tyre_age_at_start").asInt() + (currentLap - start);
                    break;
                }
            }
            state.put("tyreCompound", compound);
            state.put("tyreAge", tyreAge);
        } else {
            state.put("tyreCompound", "");
            state.put("tyreAge", 0);
        }

        if (sessionInfo != null && sessionInfo.isArray() && sessionInfo.size() > 0) {
            JsonNode sess = sessionInfo.get(0);
            state.put("circuitName", sess.path("circuit_short_name").asText());
            state.put("meetingName", sess.path("meeting_name").asText());
            state.put("countryName", sess.path("country_name").asText());
            state.put("dateStart", sess.path("date_start").asText());
            state.put("dateEnd", sess.path("date_end").asText());
            state.put("sessionKey", sess.path("session_key").asLong());
        }

        // --- Scenario engine enrichment ---

        // Last 3 completed laps
        List<Map<String, Object>> lastThreeLaps = new ArrayList<>();
        if (lapsData != null && lapsData.isArray()) {
            List<Integer> sortedLaps = new ArrayList<>(lapMap.keySet());
            Collections.sort(sortedLaps);
            for (int i = sortedLaps.size() - 1; i >= 0 && lastThreeLaps.size() < 3; i--) {
                int ln = sortedLaps.get(i);
                LapInfo li = lapMap.get(ln);
                Map<String, Object> entry = new LinkedHashMap<>();
                entry.put("lapNumber", li.lapNumber);
                entry.put("duration", round3(li.duration));
                lastThreeLaps.add(0, entry);
            }
        }
        state.put("lastThreeLaps", lastThreeLaps);

        // Fastest lap time
        double fastestLap = Double.MAX_VALUE;
        for (LapInfo li : lapMap.values()) {
            if (li.duration > 0 && li.duration < fastestLap) fastestLap = li.duration;
        }
        state.put("fastestLapTime", fastestLap < Double.MAX_VALUE ? round3(fastestLap) : null);

        // Interval history for threat assessment
        List<Map<String, Object>> intervalHistory = new ArrayList<>();
        if (intervalsData != null && intervalsData.isArray() && !lapMap.isEmpty()) {
            List<Integer> sortedLaps = new ArrayList<>(lapMap.keySet());
            Collections.sort(sortedLaps);
            int startIdx = Math.max(0, sortedLaps.size() - 5);
            for (int i = startIdx; i < sortedLaps.size(); i++) {
                int ln = sortedLaps.get(i);
                LapInfo li = lapMap.get(ln);
                if (li.duration <= 0) continue;
                Instant lapStart = Instant.parse(li.dateStart);
                Instant lapEnd = lapStart.plusMillis((long) (li.duration * 1000));

                double histGapToLeader = 0;
                double histGapToNext = 0;
                boolean histFound = false;
                for (JsonNode iv : intervalsData) {
                    if (iv.path("driver_number").asInt() != driverNumber) continue;
                    String ds = iv.path("date").asText();
                    if (ds.isEmpty()) continue;
                    Instant ivTime = Instant.parse(ds);
                    if (!ivTime.isBefore(lapStart) && ivTime.isBefore(lapEnd)) {
                        histGapToLeader = iv.path("gap_to_leader").asDouble(0);
                        JsonNode intervalNode = iv.path("interval");
                        histGapToNext = intervalNode.isNull() ? 0 : intervalNode.asDouble(0);
                        histFound = true;
                    }
                }
                if (histFound) {
                    Map<String, Object> hist = new LinkedHashMap<>();
                    hist.put("lapNumber", ln);
                    hist.put("gapToLeader", round3(histGapToLeader));
                    hist.put("gapToNext", round3(histGapToNext));
                    intervalHistory.add(hist);
                }
            }
        }
        state.put("intervalHistory", intervalHistory);

        return state;
    }

    private List<Map<String, Object>> fetchRaceSessions(int year) {
        try {
            String url = OPENF1_BASE + "/sessions?year=" + year + "&session_name=Race";
            JsonNode root = fetchAsJson(url);
            List<Map<String, Object>> sessions = new ArrayList<>();
            if (root != null && root.isArray()) {
                for (JsonNode node : root) {
                    if (node.path("is_cancelled").asBoolean(false)) continue;
                    Map<String, Object> s = new LinkedHashMap<>();
                    s.put("sessionKey", node.path("session_key").asLong());
                    s.put("circuitName", node.path("circuit_short_name").asText());
                    s.put("dateStart", node.path("date_start").asText());
                    s.put("dateEnd", node.path("date_end").asText());
                    s.put("countryName", node.path("country_name").asText());
                    s.put("year", node.path("year").asInt());
                    sessions.add(s);
                }
            }
            sessions.sort((a, b) -> ((String) b.get("dateStart")).compareTo((String) a.get("dateStart")));
            return sessions;
        } catch (Exception e) {
            log.warn("Failed to fetch sessions: {}", e.getMessage());
            return List.of();
        }
    }

    private JsonNode fetchAsJson(String url) {
        try {
            String response = restTemplate.getForObject(url, String.class);
            return objectMapper.readTree(response);
        } catch (Exception e) {
            log.warn("OpenF1 fetch failed: {} - {}", url, e.getMessage());
            return null;
        }
    }

    private void sleepBetweenCalls() {
        try {
            Thread.sleep(RATE_LIMIT_DELAY_MS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private static String formatLapTime(double seconds) {
        int mins = (int) seconds / 60;
        double secs = seconds % 60;
        return String.format("%d:%06.3f", mins, secs);
    }

    private static String formatGap(double seconds) {
        if (seconds <= 0) return "";
        if (seconds >= 60) {
            return String.format("%.0fL", seconds / 90);
        }
        return String.format("+%.1fs", seconds);
    }

    private static double round3(double v) {
        return Math.round(v * 1000.0) / 1000.0;
    }

    private static class LapInfo {
        final int lapNumber;
        final double duration;
        final String dateStart;

        LapInfo(int lapNumber, double duration, String dateStart) {
            this.lapNumber = lapNumber;
            this.duration = duration;
            this.dateStart = dateStart;
        }
    }
}
