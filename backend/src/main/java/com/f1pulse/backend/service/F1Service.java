package com.f1pulse.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.f1pulse.backend.model.Driver;
import com.f1pulse.backend.model.DriverDTO;
import com.f1pulse.backend.repository.DriverRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Service
public class F1Service {

    private final RestTemplate restTemplate;
    private final DriverRepository driverRepository;

    private final String url = "https://api.jolpi.ca/ergast/f1/current/drivers.json";

    public F1Service(RestTemplate restTemplate, DriverRepository driverRepository) {
        this.restTemplate = restTemplate;
        this.driverRepository = driverRepository;
    }

    // 🔹 FETCH + CLEAN DATA
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

    // 🔹 SAVE TO DATABASE
    public List<Driver> saveDrivers() {

        List<DriverDTO> dtos = getDrivers();
        List<Driver> drivers = new ArrayList<>();

        for (DriverDTO dto : dtos) {
            Driver driver = new Driver(
                    dto.getName(),
                    dto.getCode(),
                    dto.getNationality()
            );
            drivers.add(driver);
        }

        return driverRepository.saveAll(drivers);
    }
}