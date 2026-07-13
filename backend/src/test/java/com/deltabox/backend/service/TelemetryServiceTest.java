package com.deltabox.backend.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class TelemetryServiceTest {

    @Autowired
    private TelemetryService telemetryService;

    @Test
    void testCompareLaps() {
        Map<String, Object> result = telemetryService.compareLaps(11234, 1, 3, 3, 3);
        assertNull(result.get("error"), "Got error: " + result.get("error"));
        assertNotNull(result.get("telemetry"));
        assertNotNull(result.get("driverA"));
        assertNotNull(result.get("driverB"));
        assertNotNull(result.get("delta"));
    }

    @Test
    void testGetSessions() {
        var sessions = telemetryService.getSessions(2026);
        assertFalse(sessions.isEmpty());
        assertTrue(sessions.stream().anyMatch(s -> "Race".equals(s.get("sessionType"))));
    }

    @Test
    void testGetDrivers() {
        var drivers = telemetryService.getDrivers(11234);
        assertFalse(drivers.isEmpty());
        assertTrue(drivers.stream().anyMatch(d -> d.get("driverNumber").equals(1)));
    }
}
