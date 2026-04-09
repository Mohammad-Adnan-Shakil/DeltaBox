package com.f1pulse.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.f1pulse.backend.model.Driver;
import com.f1pulse.backend.model.DriverDTO;
import com.f1pulse.backend.model.Race;
import com.f1pulse.backend.model.RaceDTO;
import com.f1pulse.backend.model.Team;
import com.f1pulse.backend.model.TeamDTO;
import com.f1pulse.backend.repository.DriverRepository;
import com.f1pulse.backend.repository.RaceRepository;
import com.f1pulse.backend.repository.TeamRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Service
public class F1Service {

    private final RestTemplate restTemplate;
    private final DriverRepository driverRepository;
    private final TeamRepository teamRepository; 
    private final RaceRepository raceRepository;

    private final String url = "https://api.jolpi.ca/ergast/f1/current/drivers.json";
    private final String teamsUrl = "https://api.jolpi.ca/ergast/f1/current/constructors.json";
    private final String racesUrl = "https://api.jolpi.ca/ergast/f1/current/races.json";

    public F1Service(RestTemplate restTemplate,
                 DriverRepository driverRepository,
                 TeamRepository teamRepository,
                 RaceRepository raceRepository) {
    this.restTemplate = restTemplate;
    this.driverRepository = driverRepository;
    this.teamRepository = teamRepository;
    this.raceRepository = raceRepository;
}


    public List<DriverDTO> getDrivers() {
        try {
            String response = restTemplate.getForObject(url, String.class);

            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response);

            JsonNode drivers = root
                    .path("MRData")
                    .path("DriverTable")
                    .path("Drivers");

            List<DriverDTO> result = new ArrayList<>();

            for (JsonNode driver : drivers) {
                String name = driver.path("givenName").asText() + " " + driver.path("familyName").asText();
                String code = driver.path("code").asText();
                String nationality = driver.path("nationality").asText();

                result.add(new DriverDTO(name, code, nationality));
            }

            return result;

        } catch (Exception e) {
            throw new RuntimeException("Error parsing drivers: " + e.getMessage());
        }
    }

    public List<Driver> saveDrivers() {
        driverRepository.deleteAll();

        List<DriverDTO> dtos = getDrivers();
        List<Driver> drivers = new ArrayList<>();

        for (DriverDTO dto : dtos) {
            drivers.add(new Driver(
                    dto.getName(),
                    dto.getCode(),
                    dto.getNationality()
            ));
        }

        return driverRepository.saveAll(drivers);
    }

    public List<Driver> getDriversFromDB() {
        return driverRepository.findAll();
    }


    public List<TeamDTO> getTeams() {
        try {
            String response = restTemplate.getForObject(teamsUrl, String.class);

            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response);

            JsonNode teams = root
                    .path("MRData")
                    .path("ConstructorTable")
                    .path("Constructors");

            List<TeamDTO> result = new ArrayList<>();

            for (JsonNode team : teams) {
                String name = team.path("name").asText();
                String nationality = team.path("nationality").asText();

                result.add(new TeamDTO(name, nationality));
            }

            return result;

        } catch (Exception e) {
            throw new RuntimeException("Error parsing teams: " + e.getMessage());
        }
    }

    public List<Team> saveTeams() {
        teamRepository.deleteAll();

        List<TeamDTO> dtos = getTeams();
        List<Team> teams = new ArrayList<>();

        for (TeamDTO dto : dtos) {
            teams.add(new Team(
                    dto.getName(),
                    dto.getNationality()
            ));
        }

        return teamRepository.saveAll(teams);
    }

    public List<Team> getTeamsFromDB() {
        return teamRepository.findAll();
    }

    public List<RaceDTO> getRaces() {
    try {
        String response = restTemplate.getForObject(racesUrl, String.class);

        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(response);

        JsonNode races = root
                .path("MRData")
                .path("RaceTable")
                .path("Races");

        List<RaceDTO> result = new ArrayList<>();

        for (JsonNode race : races) {

            String raceName = race.path("raceName").asText();
            String date = race.path("date").asText();

            JsonNode circuit = race.path("Circuit");
            String circuitName = circuit.path("circuitName").asText();

            JsonNode locationNode = circuit.path("Location");
            String location = locationNode.path("locality").asText();
            String country = locationNode.path("country").asText();

            result.add(new RaceDTO(
                    raceName,
                    circuitName,
                    location,
                    country,
                    date
            ));
        }

        return result;

    } catch (Exception e) {
        throw new RuntimeException("Error parsing races: " + e.getMessage());
    }
}

public List<Race> saveRaces() {

    raceRepository.deleteAll();

    List<RaceDTO> dtos = getRaces();
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

    return raceRepository.saveAll(races);
}

public List<Race> getRacesFromDB() {
    return raceRepository.findAll();
}
}