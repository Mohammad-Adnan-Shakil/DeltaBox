package com.deltabox.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class LlmRateLimitFilterTest {

    private FilterChain filterChain;
    private LlmRateLimitFilter filter;

    @BeforeEach
    void setUp() {
        filterChain = mock(FilterChain.class);
        filter = new LlmRateLimitFilter(10, 50, 500);
    }

    @Test
    void eleventhRequestFromOneIpIsRateLimited() throws Exception {
        for (int i = 0; i < 10; i++) {
            runRequest("/api/race-engineer/ask", "203.0.113.10", null);
        }
        HttpServletResponse response = runRequest("/api/race-engineer/ask", "203.0.113.10", null);

        verify(filterChain, times(10)).doFilter(any(), any());
        verify(response).setStatus(429);
        verify(response).setHeader("Retry-After", "60");
    }

    @Test
    void differentIpIsUnaffected() throws Exception {
        for (int i = 0; i < 10; i++) {
            runRequest("/api/race-engineer/ask", "203.0.113.10", null);
        }

        HttpServletResponse response = runRequest("/api/race-engineer/ask", "203.0.113.11", null);

        verify(filterChain, times(11)).doFilter(any(), any());
        verify(response, never()).setStatus(429);
    }

    @Test
    void nonLlmPathIsNeverLimited() throws Exception {
        for (int i = 0; i < 11; i++) {
            runRequest("/api/race-engineer/state", "203.0.113.10", null);
        }

        verify(filterChain, times(11)).doFilter(any(), any());
    }

    @Test
    void firstForwardedIpIsUsedForRateLimiting() throws Exception {
        for (int i = 0; i < 10; i++) {
            runRequest("/api/telemetry/analyze", "203.0.113.99", "203.0.113.10, 10.0.0.1");
        }

        HttpServletResponse response = runRequest(
                "/api/telemetry/analyze", "203.0.113.99", "203.0.113.10, 10.0.0.1");

        verify(filterChain, times(10)).doFilter(any(), any());
        verify(response).setStatus(429);
    }

    private HttpServletResponse runRequest(String path, String remoteAddress, String forwardedFor)
            throws ServletException, IOException {
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mockResponse();
        when(request.getMethod()).thenReturn("POST");
        when(request.getRequestURI()).thenReturn(path);
        when(request.getRemoteAddr()).thenReturn(remoteAddress);
        when(request.getHeader("X-Forwarded-For")).thenReturn(forwardedFor);

        filter.doFilterInternal(request, response, filterChain);
        return response;
    }

    private HttpServletResponse mockResponse() throws IOException {
        HttpServletResponse response = mock(HttpServletResponse.class);
        when(response.getWriter()).thenReturn(new PrintWriter(new StringWriter()));
        return response;
    }
}
