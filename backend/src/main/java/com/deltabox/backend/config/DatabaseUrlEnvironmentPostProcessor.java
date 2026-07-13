package com.deltabox.backend.config;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.util.StringUtils;

public class DatabaseUrlEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

    private static final String PROPERTY_SOURCE_NAME = "normalizedDatabaseUrl";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String rawUrl = firstNonBlank(
                environment.getProperty("SPRING_DATASOURCE_URL"),
                environment.getProperty("DATABASE_URL"),
                environment.getProperty("spring.datasource.url")
        );

        if (!StringUtils.hasText(rawUrl)) {
            return;
        }

        NormalizedDatabaseUrl normalized = normalize(rawUrl);
        if (normalized == null) {
            return;
        }

        Map<String, Object> properties = new HashMap<>();
        properties.put("spring.datasource.url", normalized.jdbcUrl());

        if (StringUtils.hasText(normalized.username()) && !hasTextProperty(environment, "SPRING_DATASOURCE_USERNAME")) {
            properties.put("spring.datasource.username", normalized.username());
        }

        if (StringUtils.hasText(normalized.password()) && !hasTextProperty(environment, "SPRING_DATASOURCE_PASSWORD")) {
            properties.put("spring.datasource.password", normalized.password());
        }

        environment.getPropertySources().addFirst(new MapPropertySource(PROPERTY_SOURCE_NAME, properties));
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 10;
    }

    static NormalizedDatabaseUrl normalize(String rawUrl) {
        if (rawUrl.startsWith("jdbc:postgresql://")) {
            return new NormalizedDatabaseUrl(normalizeJdbcQuery(rawUrl), null, null);
        }

        if (!rawUrl.startsWith("postgresql://") && !rawUrl.startsWith("postgres://")) {
            return null;
        }

        URI uri = URI.create(rawUrl);
        StringBuilder jdbcUrl = new StringBuilder("jdbc:postgresql://");
        jdbcUrl.append(uri.getHost());

        if (uri.getPort() > 0) {
            jdbcUrl.append(":").append(uri.getPort());
        }

        if (StringUtils.hasText(uri.getRawPath())) {
            jdbcUrl.append(uri.getRawPath());
        }

        if (StringUtils.hasText(uri.getRawQuery())) {
            jdbcUrl.append("?").append(normalizeQuery(uri.getRawQuery()));
        }

        String username = null;
        String password = null;
        if (StringUtils.hasText(uri.getRawUserInfo())) {
            String[] parts = uri.getRawUserInfo().split(":", 2);
            username = urlDecode(parts[0]);
            if (parts.length > 1) {
                password = urlDecode(parts[1]);
            }
        }

        return new NormalizedDatabaseUrl(jdbcUrl.toString(), username, password);
    }

    private static String normalizeJdbcQuery(String jdbcUrl) {
        int queryStart = jdbcUrl.indexOf('?');
        if (queryStart < 0) {
            return jdbcUrl;
        }
        return jdbcUrl.substring(0, queryStart + 1) + normalizeQuery(jdbcUrl.substring(queryStart + 1));
    }

    private static String normalizeQuery(String query) {
        String[] pairs = query.split("&");
        StringBuilder filtered = new StringBuilder();
        for (String pair : pairs) {
            if (pair.startsWith("channel_binding=") || pair.startsWith("channelBinding=")) {
                continue;
            }
            if (!filtered.isEmpty()) {
                filtered.append("&");
            }
            filtered.append(pair);
        }
        return filtered.toString();
    }

    private static boolean hasTextProperty(ConfigurableEnvironment environment, String propertyName) {
        return StringUtils.hasText(environment.getProperty(propertyName));
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (StringUtils.hasText(value)) {
                return value;
            }
        }
        return null;
    }

    private static String urlDecode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }

    record NormalizedDatabaseUrl(String jdbcUrl, String username, String password) {
    }
}
