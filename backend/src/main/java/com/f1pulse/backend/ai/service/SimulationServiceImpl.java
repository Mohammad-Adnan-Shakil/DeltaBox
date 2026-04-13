package com.f1pulse.backend.ai.service;

import com.f1pulse.backend.ai.dto.SimulationRequestDTO;
import com.f1pulse.backend.ai.dto.SimulationResponseDTO;
import com.f1pulse.backend.model.Race;
import com.f1pulse.backend.repository.RaceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SimulationServiceImpl implements SimulationService {

    private final RaceRepository raceRepository;

    public SimulationServiceImpl(RaceRepository raceRepository) {
        this.raceRepository = raceRepository;
    }

    @Override
    public SimulationResponseDTO simulate(SimulationRequestDTO request) {

        List<Race> races = raceRepository.findRecentRacesByDriver(request.getDriverId());

        if (races.isEmpty()) {
            throw new RuntimeException("No race data found");
        }

        List<Integer> positions = races.stream()
                .map(Race::getPosition)
                .toList();

        double oldAvg = positions.stream().mapToInt(i -> i).average().orElse(0);

        // 🔥 simulate new race
        positions = new java.util.ArrayList<>(positions);
        positions.add(request.getNewPosition());

        double newAvg = positions.stream().mapToInt(i -> i).average().orElse(0);

        String impact;
        if (newAvg < oldAvg) impact = "IMPROVED";
        else if (newAvg > oldAvg) impact = "WORSENED";
        else impact = "NO CHANGE";

        return new SimulationResponseDTO(oldAvg, newAvg, impact);
    }
}