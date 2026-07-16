package com.deltabox.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class MLServiceKeepAlive {

    private static final Logger log = 
        LoggerFactory.getLogger(MLServiceKeepAlive.class);

    @Value("${ml.service.url}")
    private String mlServiceUrl;

    @Value("${server.port:10000}")
    private String serverPort;

    private final RestTemplate restTemplate = new RestTemplate();

    @Scheduled(fixedDelay = 1_800_000) // every 30 minutes
    public void pingMLService() {
        try {
            restTemplate.getForObject(mlServiceUrl + "/health", String.class);
            log.debug("ML service keep-alive ping successful");
        } catch (Exception e) {
            log.warn("ML service keep-alive ping failed: {}", e.getMessage());
        }
    }

    @Scheduled(fixedDelay = 1_800_000) // every 30 minutes
    public void pingSelf() {
        try {
            restTemplate.getForObject(
                "http://localhost:" + serverPort + "/api/health",
                String.class
            );
            log.debug("Backend self keep-alive ping successful");
        } catch (Exception e) {
            log.warn("Backend self ping failed: {}", e.getMessage());
        }
    }
}
