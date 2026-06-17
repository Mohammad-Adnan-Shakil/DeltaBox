package com.f1pulse.backend.config;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class DatabaseUrlEnvironmentPostProcessorTest {

    @Test
    void normalizesRawPostgresUrlFromNeon() {
        var normalized = DatabaseUrlEnvironmentPostProcessor.normalize(
                "postgresql://neondb_owner:p%40ssw0rd@ep-cool-darkness.us-east-2.aws.neon.tech/neondb"
                        + "?sslmode=require&channel_binding=require"
        );

        assertThat(normalized.jdbcUrl())
                .isEqualTo("jdbc:postgresql://ep-cool-darkness.us-east-2.aws.neon.tech/neondb"
                        + "?sslmode=require&channelBinding=require");
        assertThat(normalized.username()).isEqualTo("neondb_owner");
        assertThat(normalized.password()).isEqualTo("p@ssw0rd");
    }

    @Test
    void leavesJdbcPostgresUrlAsJdbcUrl() {
        var normalized = DatabaseUrlEnvironmentPostProcessor.normalize(
                "jdbc:postgresql://ep-cool-darkness.us-east-2.aws.neon.tech/neondb"
                        + "?user=neondb_owner&password=p%40ssw0rd&sslmode=require&channelBinding=require"
        );

        assertThat(normalized.jdbcUrl())
                .isEqualTo("jdbc:postgresql://ep-cool-darkness.us-east-2.aws.neon.tech/neondb"
                        + "?user=neondb_owner&password=p%40ssw0rd&sslmode=require&channelBinding=require");
        assertThat(normalized.username()).isNull();
        assertThat(normalized.password()).isNull();
    }

    @Test
    void ignoresNonPostgresUrls() {
        assertThat(DatabaseUrlEnvironmentPostProcessor.normalize("jdbc:h2:mem:testdb")).isNull();
    }
}
