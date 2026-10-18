package com.deltabox.backend.config;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import static org.springframework.test.web.client.ExpectedCount.once;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class MLServiceTokenInterceptorTest {

    @Test
    void mlServiceRequestsCarryInternalToken() {
        RestTemplate restTemplate = new AppConfig()
                .restTemplate("http://ml-service.test", "test-token");
        MockRestServiceServer server = MockRestServiceServer.bindTo(restTemplate).build();
        server.expect(once(), requestTo("http://ml-service.test/predict"))
                .andExpect(header("X-Internal-Token", "test-token"))
                .andRespond(withSuccess());

        restTemplate.exchange(
                "http://ml-service.test/predict", HttpMethod.POST, null, String.class);

        server.verify();
    }
}
