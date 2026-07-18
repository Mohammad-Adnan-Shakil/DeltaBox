package com.deltabox.backend.ai.service;

import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ScenarioEngineService {

    private static final double PIT_LOSS_TIME = 22.0;
    private static final double SC_PIT_LOSS_TIME = 11.0;
    private static final double FRESH_TYRE_DELTA = 0.97;

    private static final Map<Integer, Integer> F1_POINTS = new LinkedHashMap<>();
    static {
        F1_POINTS.put(1, 25); F1_POINTS.put(2, 18); F1_POINTS.put(3, 15);
        F1_POINTS.put(4, 12); F1_POINTS.put(5, 10); F1_POINTS.put(6, 8);
        F1_POINTS.put(7, 6);  F1_POINTS.put(8, 4);  F1_POINTS.put(9, 2);
        F1_POINTS.put(10, 1);
    }

    private static final Map<String, int[]> COMPOUND_WINDOWS = new LinkedHashMap<>();
    static {
        COMPOUND_WINDOWS.put("SOFT",   new int[]{15, 20});
        COMPOUND_WINDOWS.put("MEDIUM", new int[]{25, 30});
        COMPOUND_WINDOWS.put("HARD",   new int[]{35, 45});
        COMPOUND_WINDOWS.put("INTER",  new int[]{20, 30});
        COMPOUND_WINDOWS.put("WET",    new int[]{20, 30});
    }

    public Map<String, Object> calculate(Map<String, Object> state) {
        Map<String, Object> scenarios = new LinkedHashMap<>();
        scenarios.put("undercut", calculateUndercut(state));
        scenarios.put("overcut", calculateOvercut(state));
        scenarios.put("pitWindow", calculatePitWindow(state));
        scenarios.put("threatAssessment", calculateThreatAssessment(state));
        scenarios.put("safetyCarContingency", calculateSafetyCarContingency(state));
        scenarios.put("championshipImpact", calculateChampionshipImpact(state));
        return scenarios;
    }

    private Map<String, Object> calculateUndercut(Map<String, Object> state) {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("label", "Undercut");

        Double currentPace = getCurrentLapPace(state);
        Double freshPace = getFreshPaceEstimate(state);

        if (currentPace == null || freshPace == null) {
            r.put("available", false); r.put("status", "insufficient_data");
            r.put("verdict", "Need lap time data to estimate undercut");
            return r;
        }

        double gainPerLap = Math.max(0, currentPace - freshPace);
        double gainOverWindow = gainPerLap * 3;
        double netGain = gainOverWindow - PIT_LOSS_TIME;

        r.put("available", true);
        r.put("currentPace", round1(currentPace));
        r.put("freshPaceEstimate", round1(freshPace));
        r.put("pitLossTime", PIT_LOSS_TIME);
        r.put("gainPerLap", round1(gainPerLap));
        r.put("gainOverWindow", round1(gainOverWindow));
        r.put("netGain", round1(netGain));

        Double gapToCarAhead = getGapToNext(state);
        r.put("gapToCarAhead", gapToCarAhead != null ? round1(gapToCarAhead) : null);

        if (gainPerLap < 0.2) {
            r.put("status", "neutral");
            r.put("verdict", String.format("Fresh tyre advantage is minimal (+%.1fs/lap). Undercut provides negligible benefit.", gainPerLap));
        } else if (netGain > 0) {
            r.put("status", "positive");
            r.put("verdict", String.format("Undercut gains ~%.1fs over 3 laps — well worth the stop", netGain));
        } else if (gapToCarAhead != null && (netGain + gapToCarAhead) > 0) {
            r.put("status", "neutral");
            r.put("verdict", String.format("Undercut loses ~%.1fs net but your gap to car ahead (%.1fs) may protect the position", Math.abs(netGain), gapToCarAhead));
        } else {
            r.put("status", "negative");
            r.put("verdict", String.format("Undercut loses ~%.1fs — pit loss (%.1fs) exceeds fresh tyre gain (+%.1fs)", Math.abs(netGain), PIT_LOSS_TIME, gainOverWindow));
        }

        return r;
    }

    private Map<String, Object> calculateOvercut(Map<String, Object> state) {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("label", "Overcut");

        List<Map<String, Object>> lastThree = castList(state.get("lastThreeLaps"));
        if (lastThree == null || lastThree.size() < 2) {
            r.put("available", false); r.put("status", "insufficient_data");
            r.put("verdict", "Need at least 2 lap times to analyze degradation trend");
            return r;
        }

        double[] times = new double[lastThree.size()];
        for (int i = 0; i < lastThree.size(); i++) {
            times[i] = ((Number) lastThree.get(i).get("duration")).doubleValue();
        }

        double first = times[0];
        double last = times[times.length - 1];
        double degradation = last - first;
        double avg = 0;
        for (double t : times) avg += t;
        avg /= times.length;
        double variance = 0;
        for (double t : times) variance += Math.pow(t - avg, 2);
        variance /= times.length;
        double stdDev = Math.sqrt(variance);

        r.put("available", true);
        r.put("lapCount", times.length);
        r.put("degradationOver", round3(degradation));
        r.put("stdDev", round3(stdDev));

        int tyreAge = getInt(state, "tyreAge");
        String compound = getString(state, "tyreCompound", "");
        int maxAge = getMaxAgeForCompound(compound);
        double ageRatio = maxAge > 0 ? (double) tyreAge / maxAge : 0;

        if (degradation < 0.3 && ageRatio < 0.7) {
            r.put("status", "positive");
            r.put("verdict", String.format("Degradation is flat (+%.2fs). Staying out is favorable — if a car ahead pits you gain ~%.1fs net.", degradation, PIT_LOSS_TIME));
        } else if (degradation < 0.8 && ageRatio < 0.9) {
            r.put("status", "neutral");
            r.put("verdict", String.format("Degradation is moderate (+%.2fs). Overcut is marginal — monitor closely.", degradation));
        } else {
            r.put("status", "negative");
            r.put("verdict", String.format("Degradation is high (+%.2fs over %d laps). Overcut not recommended — losing time each lap.", degradation, times.length));
        }

        return r;
    }

    private Map<String, Object> calculatePitWindow(Map<String, Object> state) {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("label", "Pit Window");

        int currentLap = getInt(state, "lap");
        int totalLaps = getInt(state, "totalLaps");
        int tyreAge = getInt(state, "tyreAge");
        String compound = getString(state, "tyreCompound", "");

        int[] window = COMPOUND_WINDOWS.getOrDefault(compound.toUpperCase(), new int[]{20, 30});
        int optStart = window[0];
        int optEnd = window[1];

        int lapsUsed = tyreAge;
        int lapsRemaining = optEnd - lapsUsed;
        int recommendedLap = currentLap + lapsRemaining;

        r.put("available", true);
        r.put("compound", compound);
        r.put("tyreAge", tyreAge);
        r.put("optimalWindow", String.format("Laps %d–%d", optStart, optEnd));
        r.put("lapsRemainingOnCurrentSet", Math.max(0, lapsRemaining));
        r.put("recommendedPitLap", recommendedLap);

        if (lapsUsed >= optEnd) {
            r.put("status", "negative");
            int overdue = lapsUsed - optEnd;
            r.put("verdict", String.format("Overdue by %d laps! Optimal window for %s was Laps %d–%d. Box now!", overdue, compound, optStart, optEnd));
        } else if (lapsUsed >= optStart) {
            r.put("status", "positive");
            r.put("verdict", String.format("In window! %s optimal life %d–%d laps (lap %d of %d used). Recommended pit: Lap %d.", compound, optStart, optEnd, lapsUsed, totalLaps, recommendedLap));
        } else if (lapsRemaining <= 3) {
            r.put("status", "neutral");
            r.put("verdict", String.format("Approaching window — %d laps until optimal. %s life: %d–%d laps.", lapsRemaining, compound, optStart, optEnd));
        } else {
            r.put("status", "neutral");
            r.put("verdict", String.format("Still %d laps from optimal window. %s life: %d–%d laps. No rush.", lapsRemaining, compound, optStart, optEnd));
        }

        return r;
    }

    private Map<String, Object> calculateThreatAssessment(Map<String, Object> state) {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("label", "Threat Assessment");

        List<Map<String, Object>> history = castList(state.get("intervalHistory"));
        if (history == null || history.size() < 2) {
            r.put("available", false); r.put("status", "insufficient_data");
            r.put("verdict", "Need interval history over multiple laps — not available in Manual mode");
            return r;
        }

        r.put("available", true);
        r.put("historySize", history.size());

        double firstGap = ((Number) history.get(0).get("gapToNext")).doubleValue();
        double lastGap = ((Number) history.get(history.size() - 1).get("gapToNext")).doubleValue();
        double change = lastGap - firstGap;
        double perLap = history.size() > 1 ? change / (history.size() - 1) : 0;

        r.put("gapTrend", round3(change));
        r.put("changePerLap", round3(perLap));

        List<Map<String, Object>> snapshots = new ArrayList<>();
        for (Map<String, Object> h : history) {
            Map<String, Object> snap = new LinkedHashMap<>();
            snap.put("lap", h.get("lapNumber"));
            snap.put("gapToNext", h.get("gapToNext"));
            snap.put("gapToLeader", h.get("gapToLeader"));
            snapshots.add(snap);
        }
        r.put("history", snapshots);

        if (change < -0.5) {
            r.put("status", "negative");
            r.put("verdict", String.format("Car behind closing by %.1fs over %d laps (%.2f/lap). Need to respond — consider defensive driving or pitting.", Math.abs(change), history.size(), Math.abs(perLap)));
        } else if (change < 0) {
            r.put("status", "neutral");
            r.put("verdict", String.format("Car behind slowly closing (%.1fs over %d laps). Monitor situation.", Math.abs(change), history.size()));
        } else if (change > 1.0) {
            r.put("status", "positive");
            r.put("verdict", String.format("Car behind falling back by %.1fs over %d laps — gap is safe.", change, history.size()));
        } else {
            r.put("status", "positive");
            r.put("verdict", String.format("Gap to car behind is stable (%.1fs over %d laps). No immediate threat.", change, history.size()));
        }

        return r;
    }

    private Map<String, Object> calculateSafetyCarContingency(Map<String, Object> state) {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("label", "Safety Car");

        Double currentPace = getCurrentLapPace(state);
        Double freshPace = getFreshPaceEstimate(state);

        if (currentPace == null || freshPace == null) {
            r.put("available", false); r.put("status", "insufficient_data");
            r.put("verdict", "Need lap time data to estimate SC strategy");
            return r;
        }

        double gainPerLap = Math.max(0, currentPace - freshPace);
        double gainOverWindow = gainPerLap * 3;
        double scNetGain = gainOverWindow - SC_PIT_LOSS_TIME;
        double greenNetGain = gainOverWindow - PIT_LOSS_TIME;

        r.put("available", true);
        r.put("scPitLossTime", SC_PIT_LOSS_TIME);
        r.put("greenPitLossTime", PIT_LOSS_TIME);
        r.put("gainOverWindow", round1(gainOverWindow));
        r.put("scNetGain", round1(scNetGain));
        r.put("greenNetGain", round1(greenNetGain));

        if (scNetGain > 0) {
            r.put("status", "positive");
            double improvement = scNetGain - greenNetGain;
            r.put("verdict", String.format("Safety car makes this undercut viable: SC net +%.1fs vs green net %.1fs. Gain: %.1fs better under SC.", scNetGain, greenNetGain, improvement));
        } else {
            r.put("status", "neutral");
            r.put("verdict", String.format("SC reduces pit loss from %.0fs to %.0fs (net: %.1fs), but gain is still marginal under green (%.1fs).", PIT_LOSS_TIME, SC_PIT_LOSS_TIME, scNetGain, greenNetGain));
        }

        return r;
    }

    private Map<String, Object> calculateChampionshipImpact(Map<String, Object> state) {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("label", "Championship Impact");

        int position = getInt(state, "position");
        if (position <= 0) {
            r.put("available", false); r.put("status", "insufficient_data");
            r.put("verdict", "Need race position to calculate points impact");
            return r;
        }

        int pointsThisRace = F1_POINTS.getOrDefault(position, 0);
        r.put("available", true);
        r.put("position", position);
        r.put("pointsThisRace", pointsThisRace);
        r.put("maxPointsPossible", F1_POINTS.getOrDefault(1, 25));

        if (state.containsKey("driverPoints")) {
            int dp = getInt(state, "driverPoints");
            r.put("driverPoints", dp);
            r.put("estimatedTotal", dp + pointsThisRace);
        }

        if (position == 1) {
            r.put("status", "positive");
            r.put("verdict", String.format("P1 → 25 points. Maximum score this race!", pointsThisRace));
        } else if (position <= 3) {
            r.put("status", "positive");
            int gainIfWin = F1_POINTS.get(1) - pointsThisRace;
            r.put("verdict", String.format("P%d → %d points. Win would gain +%d more.", position, pointsThisRace, gainIfWin));
        } else if (position <= 10) {
            int nextPts = F1_POINTS.getOrDefault(position - 1, 0);
            int gainOnePos = nextPts - pointsThisRace;
            r.put("status", "neutral");
            r.put("verdict", String.format("P%d → %d points. One position up gains +%d more.", position, pointsThisRace, gainOnePos));
        } else {
            r.put("status", "negative");
            r.put("verdict", String.format("P%d → 0 points. Push for top 10 to score!", position));
        }

        return r;
    }

    private Double getCurrentLapPace(Map<String, Object> state) {
        List<Map<String, Object>> lastThree = castList(state.get("lastThreeLaps"));
        if (lastThree != null && !lastThree.isEmpty()) {
            double sum = 0;
            for (Map<String, Object> lap : lastThree) {
                sum += ((Number) lap.get("duration")).doubleValue();
            }
            return sum / lastThree.size();
        }
        String lastLap = getString(state, "lastLapTime", null);
        if (lastLap != null && !lastLap.isEmpty()) {
            return parseLapTime(lastLap);
        }
        return null;
    }

    private Double getFreshPaceEstimate(Map<String, Object> state) {
        Number fastest = (Number) state.get("fastestLapTime");
        if (fastest != null && fastest.doubleValue() > 0) {
            return fastest.doubleValue();
        }
        Double current = getCurrentLapPace(state);
        if (current != null) {
            return current * FRESH_TYRE_DELTA;
        }
        return null;
    }

    private Double getGapToNext(Map<String, Object> state) {
        Number raw = (Number) state.get("gapToNextRaw");
        if (raw != null) return raw.doubleValue();
        String formatted = getString(state, "gapToNext", null);
        if (formatted != null && !formatted.isEmpty()) {
            return parseGap(formatted);
        }
        return null;
    }

    private int getMaxAgeForCompound(String compound) {
        int[] w = COMPOUND_WINDOWS.getOrDefault(compound.toUpperCase(), new int[]{20, 30});
        return w[1];
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> castList(Object obj) {
        if (obj instanceof List) return (List<Map<String, Object>>) obj;
        return null;
    }

    private String getString(Map<String, Object> m, String key, String def) {
        Object v = m.get(key);
        return v != null ? v.toString() : def;
    }

    private int getInt(Map<String, Object> m, String key) {
        Object v = m.get(key);
        if (v instanceof Number) return ((Number) v).intValue();
        try { return Integer.parseInt(v.toString()); } catch (Exception e) { return 0; }
    }

    private double parseLapTime(String time) {
        try {
            if (time.contains(":")) {
                String[] parts = time.split(":");
                return Integer.parseInt(parts[0]) * 60 + Double.parseDouble(parts[1]);
            }
            return Double.parseDouble(time);
        } catch (Exception e) {
            return 0;
        }
    }

    private double parseGap(String gap) {
        try {
            String clean = gap.replaceAll("[+sL]", "").trim();
            return Double.parseDouble(clean);
        } catch (Exception e) {
            return 0;
        }
    }

    private double round1(double v) {
        return Math.round(v * 10.0) / 10.0;
    }

    private double round3(double v) {
        return Math.round(v * 1000.0) / 1000.0;
    }
}
