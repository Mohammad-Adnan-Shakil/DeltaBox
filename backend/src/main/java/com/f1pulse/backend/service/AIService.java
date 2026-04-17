package com.f1pulse.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.List;

import com.f1pulse.backend.dto.DriverInsightResponse;
import com.f1pulse.backend.model.Race;
import com.f1pulse.backend.repository.RaceRepository;
import com.f1pulse.backend.util.StatsUtil;
@Service
public class AIService {

    private final RaceRepository raceRepository;

    public AIService(RaceRepository raceRepository) {
        this.raceRepository = raceRepository;
    }

    public DriverInsightResponse getDriverInsights(Long driverId) {

        // 🔹 Step 1: Fetch recent races
        List<Race> races = raceRepository.findTop10ByDriverIdOrderByDateDesc(driverId);

        // 🔹 Step 2: Stats (you already built StatsUtil)
        double avgLast5 = StatsUtil.calculateAverage(races, 5);
        double stdLast5 = StatsUtil.calculateStdDev(races, 5);

        double avgLast10 = StatsUtil.calculateAverage(races, 10);
        double stdLast10 = StatsUtil.calculateStdDev(races, 10);

        double lastRacePosition = races.get(0).getPosition();

        // 🔹 Step 3: Call ML
        double predicted = callRFModel(
                driverId,
                avgLast5,
                stdLast5,
                avgLast10,
                stdLast10,
                lastRacePosition
        );

        // 🔹 Step 4: Insight logic
        String insight;
        if (predicted < avgLast5) {
            insight = "Driver is improving based on recent performance";
        } else {
            insight = "Driver performance is inconsistent or declining";
        }

        // 🔹 Step 5: Response
        DriverInsightResponse res = new DriverInsightResponse();
        res.setDriverId(driverId);
        res.setAvgLast5(avgLast5);
        res.setStdLast5(stdLast5);
        res.setAvgLast10(avgLast10);
        res.setStdLast10(stdLast10);
        res.setPredictedNextPosition(predicted);
        res.setInsight(insight);

        return res;
    }

    private double callRFModel(Long driverId,
                               double avgLast5,
                               double stdLast5,
                               double avgLast10,
                               double stdLast10,
                               double lastRacePosition) {

        try {
            String json = String.format(
                    "{\"driver_id\":%d,\"avg_last_5\":%.2f,\"std_last_5\":%.2f,\"avg_last_10\":%.2f,\"std_last_10\":%.2f,\"last_race_position\":%.2f}",
                    driverId, avgLast5, stdLast5, avgLast10, stdLast10, lastRacePosition
            );

            ProcessBuilder pb = new ProcessBuilder(
                    "python",
                    "ml/scripts/predict_rf.py",
                    json
            );

            pb.redirectErrorStream(true);
            Process process = pb.start();

            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream())
            );

            String output = reader.readLine();

            ObjectMapper mapper = new ObjectMapper();
            JsonNode node = mapper.readTree(output);

            return node.get("predicted_next_position").asDouble();

        } catch (Exception e) {
            e.printStackTrace();
            return -1;
        }
    }
}
