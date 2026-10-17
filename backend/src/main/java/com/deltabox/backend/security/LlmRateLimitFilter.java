package com.deltabox.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class LlmRateLimitFilter extends OncePerRequestFilter {

    private static final long MINUTE_WINDOW_MS = 60_000L;
    private static final long DAY_WINDOW_MS = 86_400_000L;

    private final int perMinuteLimit;
    private final int perDayLimit;
    private final int globalPerDayLimit;
    private final ConcurrentHashMap<String, ClientWindow> clientWindows = new ConcurrentHashMap<>();
    private final AtomicInteger globalCount = new AtomicInteger();
    private volatile long globalWindowStart = System.currentTimeMillis();

    public LlmRateLimitFilter(
            @Value("${ratelimit.llm.per-minute:10}") int perMinuteLimit,
            @Value("${ratelimit.llm.per-day:50}") int perDayLimit,
            @Value("${ratelimit.llm.global-per-day:500}") int globalPerDayLimit) {
        this.perMinuteLimit = perMinuteLimit;
        this.perDayLimit = perDayLimit;
        this.globalPerDayLimit = globalPerDayLimit;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        if (!isLlmEndpoint(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = clientIp(request);
        String rejectedMessage;
        synchronized (clientWindows.computeIfAbsent(clientIp, ignored -> new ClientWindow())) {
            ClientWindow window = clientWindows.get(clientIp);
            long now = System.currentTimeMillis();
            window.resetIfExpired(now);
            if (window.minuteCount.incrementAndGet() > perMinuteLimit) {
                rejectedMessage = "per-minute limit exceeded";
            } else if (window.dayCount.incrementAndGet() > perDayLimit) {
                rejectedMessage = "per-day limit exceeded";
            } else if (!allowGlobal(now)) {
                rejectedMessage = "global daily limit exceeded";
            } else {
                filterChain.doFilter(request, response);
                return;
            }
        }

        writeRateLimitedResponse(response, rejectedMessage);
    }

    private boolean isLlmEndpoint(HttpServletRequest request) {
        if (!"POST".equalsIgnoreCase(request.getMethod())) {
            return false;
        }
        String path = request.getRequestURI();
        return "/api/race-engineer/ask".equals(path) || "/api/telemetry/analyze".equals(path);
    }

    private String clientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",", 2)[0].trim();
        }
        return request.getRemoteAddr();
    }

    private synchronized boolean allowGlobal(long now) {
        if (now - globalWindowStart >= DAY_WINDOW_MS) {
            globalWindowStart = now;
            globalCount.set(0);
        }
        return globalCount.incrementAndGet() <= globalPerDayLimit;
    }

    private void writeRateLimitedResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(429);
        response.setHeader("Retry-After", "60");
        response.setContentType("application/json");
        response.getWriter().write("{\"error\":\"rate_limited\",\"message\":\"" + message + "\"}");
    }

    private static final class ClientWindow {
        private long minuteWindowStart = System.currentTimeMillis();
        private long dayWindowStart = minuteWindowStart;
        private final AtomicInteger minuteCount = new AtomicInteger();
        private final AtomicInteger dayCount = new AtomicInteger();

        private void resetIfExpired(long now) {
            if (now - dayWindowStart >= DAY_WINDOW_MS) {
                dayWindowStart = now;
                dayCount.set(0);
            }
            if (now - minuteWindowStart >= MINUTE_WINDOW_MS) {
                minuteWindowStart = now;
                minuteCount.set(0);
            }
        }
    }
}
