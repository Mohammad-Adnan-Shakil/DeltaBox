package com.deltabox.backend;

import com.deltabox.backend.dto.AuthResponse;
import com.deltabox.backend.model.User;
import com.deltabox.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class AuthIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void cleanup() {
        userRepository.deleteAll();
    }

    @Test
    void registerLoginAndAccessProtectedEndpoint() {
        AuthRequest authRequest = new AuthRequest();
        authRequest.setUsername("itest");
        authRequest.setIdentifier("itest@example.com");
        authRequest.setPassword("1234");

        ResponseEntity<AuthResponse> registerResponse = restTemplate.postForEntity(
                "/api/auth/register", authRequest, AuthResponse.class);
        assertThat(registerResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(registerResponse.getBody()).isNotNull();

        ResponseEntity<AuthResponse> loginResponse = restTemplate.postForEntity(
                "/api/auth/login", authRequest, AuthResponse.class);
        assertThat(loginResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(loginResponse.getBody()).isNotNull();
        assertThat(loginResponse.getBody().getToken()).isNotNull();

        String token = loginResponse.getBody().getToken();

        ResponseEntity<String> unauthorizedResponse = restTemplate.getForEntity(
                "/api/user/profile", String.class);
        assertThat(unauthorizedResponse.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<Void> authorizedEntity = new HttpEntity<>(headers);

        ResponseEntity<String> protectedResponse = restTemplate.exchange(
                "/api/user/profile", HttpMethod.GET, authorizedEntity, String.class);
        assertThat(protectedResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void userCannotAccessAdminEndpoint() {
        AuthResponse auth = registerAndLogin("admin-endpoint-user");

        ResponseEntity<String> response = getWithBearer("/api/admin/ingest/status", auth.getToken());

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void userCannotAccessDebugEndpoint() {
        AuthResponse auth = registerAndLogin("debug-endpoint-user");

        ResponseEntity<String> response = getWithBearer("/api/debug/race-stats", auth.getToken());

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void unauthenticatedAdminEndpointRequestIsUnauthorized() {
        ResponseEntity<String> response = restTemplate.getForEntity(
                "/api/admin/ingest/status", String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void refreshTokenCannotAccessProtectedEndpoint() {
        AuthResponse auth = registerAndLogin("refresh-endpoint-user");

        ResponseEntity<String> response = getWithBearer(
                "/api/user/profile", auth.getRefreshToken());

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void adminCanAccessAdminEndpoint() {
        User admin = new User();
        admin.setUsername("admin-endpoint-user");
        admin.setEmail("admin-endpoint-user@example.com");
        admin.setPassword(passwordEncoder.encode("1234"));
        admin.setRole("ADMIN");
        userRepository.save(admin);

        AuthRequest authRequest = new AuthRequest();
        authRequest.setUsername(admin.getUsername());
        authRequest.setIdentifier(admin.getEmail());
        authRequest.setPassword("1234");

        ResponseEntity<AuthResponse> loginResponse = restTemplate.postForEntity(
                "/api/auth/login", authRequest, AuthResponse.class);
        assertThat(loginResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(loginResponse.getBody()).isNotNull();

        ResponseEntity<String> response = getWithBearer(
                "/api/admin/ingest/status", loginResponse.getBody().getToken());

        assertThat(response.getStatusCode()).isNotEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getStatusCode()).isNotEqualTo(HttpStatus.FORBIDDEN);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    private AuthResponse registerAndLogin(String username) {
        AuthRequest authRequest = new AuthRequest();
        authRequest.setUsername(username);
        authRequest.setIdentifier(username + "@example.com");
        authRequest.setPassword("1234");

        ResponseEntity<AuthResponse> registerResponse = restTemplate.postForEntity(
                "/api/auth/register", authRequest, AuthResponse.class);
        assertThat(registerResponse.getStatusCode()).isEqualTo(HttpStatus.OK);

        ResponseEntity<AuthResponse> loginResponse = restTemplate.postForEntity(
                "/api/auth/login", authRequest, AuthResponse.class);
        assertThat(loginResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(loginResponse.getBody()).isNotNull();
        assertThat(loginResponse.getBody().getToken()).isNotNull();
        AuthResponse auth = loginResponse.getBody();
        assertThat(getWithBearer("/api/user/profile", auth.getToken()).getStatusCode())
                .isEqualTo(HttpStatus.OK);
        return auth;
    }

    private ResponseEntity<String> getWithBearer(String path, String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        return restTemplate.exchange(path, HttpMethod.GET, new HttpEntity<>(headers), String.class);
    }

    private static class AuthRequest {
        private String username;
        private String identifier;
        private String password;

        public AuthRequest() {
        }

        public AuthRequest(String username, String password) {
            this.username = username;
            this.password = password;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getIdentifier() {
            return identifier;
        }

        public void setIdentifier(String identifier) {
            this.identifier = identifier;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }
}
