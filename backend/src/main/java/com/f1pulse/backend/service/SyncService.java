package com.f1pulse.backend.service;

import com.f1pulse.backend.model.*;
import com.f1pulse.backend.repository.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class SyncService {

    private final DriverRepository driverRepository;
    private final TeamRepository teamRepository;
    private final RaceRepository raceRepository;
    private final SyncMetaRepository syncMetaRepository;
    private final F1ApiClient f1ApiClient;

    private final long CACHE_DURATION = 60 * 60 * 1000; // 1 hour

    public SyncService(DriverRepository driverRepository,
                       TeamRepository teamRepository,
                       RaceRepository raceRepository,
                       SyncMetaRepository syncMetaRepository,
                       F1ApiClient f1ApiClient) {

        this.driverRepository = driverRepository;
        this.teamRepository = teamRepository;
        this.raceRepository = raceRepository;
        this.syncMetaRepository = syncMetaRepository;
        this.f1ApiClient = f1ApiClient;
    }

    // ================= COMMON METHOD =================

    private boolean shouldSync(String key) {
        SyncMeta meta = syncMetaRepository.findById(key).orElse(null);
        long currentTime = System.currentTimeMillis();

        return meta == null || (currentTime - meta.getLastSyncTime()) >= CACHE_DURATION;
    }

    private void updateSyncTime(String key) {
        syncMetaRepository.save(new SyncMeta(key, System.currentTimeMillis()));
    }

    // ================= DRIVERS =================

    public List<Driver> syncDrivers() {

        String key = "drivers";

        if (!shouldSync(key)) {
            System.out.println("Using cached drivers data");
            return driverRepository.findAll();
        }

        System.out.println("Syncing fresh drivers data");

        driverRepository.deleteAll();

        List<DriverDTO> dtos = f1ApiClient.fetchDrivers();
        List<Driver> drivers = new ArrayList<>();

        for (DriverDTO dto : dtos) {
            drivers.add(new Driver(
                    dto.getName(),
                    dto.getCode(),
                    dto.getNationality()
            ));
        }

        updateSyncTime(key);

        return driverRepository.saveAll(drivers);
    }

    // ================= TEAMS =================

    public List<Team> syncTeams() {

        String key = "teams";

        if (!shouldSync(key)) {
            System.out.println("Using cached teams data");
            return teamRepository.findAll();
        }

        System.out.println("Syncing fresh teams data");

        teamRepository.deleteAll();

        List<TeamDTO> dtos = f1ApiClient.fetchTeams();
        List<Team> teams = new ArrayList<>();

        for (TeamDTO dto : dtos) {
            teams.add(new Team(
                    dto.getName(),
                    dto.getNationality()
            ));
        }

        updateSyncTime(key);

        return teamRepository.saveAll(teams);
    }

    // ================= RACES =================

    public List<Race> syncRaces() {

        String key = "races";

        if (!shouldSync(key)) {
            System.out.println("Using cached races data");
            return raceRepository.findAll();
        }

        System.out.println("Syncing fresh races data");

        raceRepository.deleteAll();

        List<RaceDTO> dtos = f1ApiClient.fetchRaces();
        List<Race> races = new ArrayList<>();

        for (RaceDTO dto : dtos) {
            races.add(new Race(
                    dto.getRaceName(),
                    dto.getCircuitName(),
                    dto.getLocation(),
                    dto.getCountry(),
                    dto.getDate()
            ));
        }

        updateSyncTime(key);

        return raceRepository.saveAll(races);
    }
}