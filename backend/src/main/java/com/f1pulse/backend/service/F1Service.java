package com.f1pulse.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class F1Service {

    private final RestTemplate restTemplate;
    String url = "https://api.jolpi.ca/ergast/f1/current/drivers.json";

    public F1Service(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

   public String getDrivers() {
    try {
        return restTemplate.getForObject(url, String.class);
    } catch (Exception e) {
        return "Error fetching data: " + e.getMessage();
    }
}
}
