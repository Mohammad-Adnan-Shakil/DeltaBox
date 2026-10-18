package com.deltabox.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.ExpectedCount.once;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class TelemetryServiceTest {

    private RestTemplate restTemplate;
    private MockRestServiceServer server;
    private TelemetryService telemetryService;

    @BeforeEach
    void setUp() {
        restTemplate = new RestTemplate();
        server = MockRestServiceServer.bindTo(restTemplate).build();
        telemetryService = new TelemetryService(restTemplate, 0, 0);
    }

    @Test
    void testCompareLaps() {
        expectLaps(1, "2024-06-01T12:00:00Z", 90.0);
        expectLaps(3, "2024-06-01T12:01:00Z", 90.0);
        expectCarData(1, "2024-06-01T12:00:00Z", "2024-06-01T12:01:30Z");
        expectCarData(3, "2024-06-01T12:01:00Z", "2024-06-01T12:02:30Z");
        expectDrivers();

        Map<String, Object> result = telemetryService.compareLaps(11234, 1, 3, 3, 3);

        assertNull(result.get("error"), "Got error: " + result.get("error"));
        assertNotNull(result.get("telemetry"));
        assertNotNull(result.get("driverA"));
        assertNotNull(result.get("driverB"));
        assertNotNull(result.get("delta"));
        server.verify();
    }

    @Test
    void testGetSessions() {
        server.expect(once(), request -> assertTrue(request.getURI().getQuery().contains("year=2024")))
            .andRespond(withSuccess(sessionsJson(), MediaType.APPLICATION_JSON));
        server.expect(once(), request -> assertTrue(request.getURI().getQuery().contains("session_name=Qualifying")))
            .andRespond(withSuccess(sessionsJson(), MediaType.APPLICATION_JSON));

        var sessions = telemetryService.getSessions(java.util.List.of(2024));

        assertFalse(sessions.isEmpty());
        assertTrue(sessions.stream().anyMatch(s -> "Race".equals(s.get("sessionType"))));
        server.verify();
    }

    @Test
    void testGetDrivers() {
        server.expect(once(), request -> assertTrue(request.getURI().getQuery().contains("session_key=11234")))
            .andRespond(withSuccess(driversJson(), MediaType.APPLICATION_JSON));

        var drivers = telemetryService.getDrivers(11234);

        assertFalse(drivers.isEmpty());
        assertTrue(drivers.stream().anyMatch(d -> d.get("driverNumber").equals(1)));
        server.verify();
    }

    @Test
    void carDataRequestsContainLapDateBounds() {
        expectLaps(1, "2024-06-01T12:00:00Z", 90.0);
        expectLaps(3, "2024-06-01T12:01:00Z", 90.0);
        expectCarData(1, "2024-06-01T12:00:00Z", "2024-06-01T12:01:30Z");
        expectCarData(3, "2024-06-01T12:01:00Z", "2024-06-01T12:02:30Z");
        expectDrivers();

        Map<String, Object> result = telemetryService.compareLaps(11234, 1, 3, 3, 3);

        assertNull(result.get("error"), "Got error: " + result.get("error"));
        server.verify();
    }

    private void expectLaps(int driverNumber, String start, double duration) {
        server.expect(once(), request -> {
            String query = request.getURI().getQuery();
            assertTrue(query.contains("driver_number=" + driverNumber));
            assertTrue(query.contains("lap_number=3"));
        })
            .andRespond(withSuccess("[{\"lap_number\":3,\"lap_duration\":" + duration
                    + ",\"date_start\":\"" + start + "\"}]", MediaType.APPLICATION_JSON));
    }

    private void expectCarData(int driverNumber, String start, String end) {
        server.expect(once(), request -> {
            String query = request.getURI().getQuery();
            assertTrue(query.contains("driver_number=" + driverNumber));
            assertTrue(query.contains("date%3E=") || query.contains("date>="));
            assertTrue(query.contains("date%3C=") || query.contains("date<="));
            assertTrue(query.contains(start.replace(":", "%3A")) || query.contains(start));
            assertTrue(query.contains(end.replace(":", "%3A")) || query.contains(end));
        }).andRespond(withSuccess(carDataJson(start), MediaType.APPLICATION_JSON));
    }

    private void expectDrivers() {
        server.expect(once(), request -> assertTrue(request.getURI().getQuery().contains("session_key=11234")))
            .andRespond(withSuccess(driversJson(), MediaType.APPLICATION_JSON));
    }

    private String sessionsJson() {
        return "[{\"session_key\":11234,\"circuit_short_name\":\"Monza\",\"session_name\":\"Race\","
                + "\"date_start\":\"2024-09-01T12:00:00Z\",\"year\":2024,\"is_cancelled\":false}]";
    }

    private String driversJson() {
        return "[{\"driver_number\":1,\"name_acronym\":\"VER\",\"full_name\":\"Max Verstappen\","
                + "\"team_name\":\"Red Bull\",\"team_colour\":\"3671C6\"},"
                + "{\"driver_number\":3,\"name_acronym\":\"RIC\",\"full_name\":\"Daniel Ricciardo\","
                + "\"team_name\":\"RB\",\"team_colour\":\"6692FF\"}]";
    }

    private String carDataJson(String start) {
        return "[{\"date\":\"" + start + "\",\"speed\":300,\"throttle\":90,\"brake\":0},"
                + "{\"date\":\"" + start + "\",\"speed\":301,\"throttle\":91,\"brake\":0},"
                + "{\"date\":\"" + start + "\",\"speed\":302,\"throttle\":92,\"brake\":0}]";
    }
}
