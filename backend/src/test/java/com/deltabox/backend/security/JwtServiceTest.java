package com.deltabox.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private static final String SECRET = "test-only-jwt-secret-0123456789abcdef";
    private static final long ACCESS_EXPIRATION_MS = 900_000L;

    @Test
    void constructorRejectsBlankSecret() {
        assertThatThrownBy(() -> new JwtService("   ", ACCESS_EXPIRATION_MS))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("must not be null or blank");
    }

    @Test
    void constructorRejectsShortSecret() {
        assertThatThrownBy(() -> new JwtService("too-short", ACCESS_EXPIRATION_MS))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("at least 32 bytes");
    }

    @Test
    void generatedAccessTokenExpiresAfterApproximatelyFifteenMinutes() {
        JwtService jwtService = new JwtService(SECRET, ACCESS_EXPIRATION_MS);
        UserDetails userDetails = userDetails();
        long issuedAt = System.currentTimeMillis();

        String token = jwtService.generateToken(userDetails);

        Claims claims = parseClaims(token);
        long expectedExpiry = issuedAt + ACCESS_EXPIRATION_MS;
        assertThat(claims.getExpiration().getTime())
                .isBetween(expectedExpiry - 5_000L, expectedExpiry + 5_000L);
    }

    @Test
    void accessAndRefreshTokensHaveDifferentAccessTypes() {
        JwtService jwtService = new JwtService(SECRET, ACCESS_EXPIRATION_MS);
        UserDetails userDetails = userDetails();

        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        assertThat(jwtService.isAccessToken(accessToken)).isTrue();
        assertThat(jwtService.isAccessToken(refreshToken)).isFalse();
    }

    private UserDetails userDetails() {
        return User.withUsername("user@example.com")
                .password("password")
                .roles("USER")
                .build();
    }

    private Claims parseClaims(String token) {
        SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
