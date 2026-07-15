package com.deltabox.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    private static final String TOKEN_TYPE_ACCESS = "access";
    private static final String TOKEN_TYPE_REFRESH = "refresh";
    private static final long REFRESH_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000L; // 7 days

    private final SecretKey SECRET_KEY;
    private final long ACCESS_EXPIRATION;

    public JwtService(@Value("${jwt.secret}") String secretString,
                      @Value("${jwt.expiration}") long accessExpiration) {
        this.SECRET_KEY = Keys.hmacShaKeyFor(secretString.getBytes());
        this.ACCESS_EXPIRATION = accessExpiration;
    }

    public String extractUsername(String token) {
        try {
            return extractAllClaims(token).getSubject();
        } catch (Exception e) {
            return null;
        }
    }

    public String generateToken(UserDetails userDetails) {
        return buildToken(userDetails, TOKEN_TYPE_ACCESS, ACCESS_EXPIRATION);
    }

    public String generateRefreshToken(UserDetails userDetails) {
        return buildToken(userDetails, TOKEN_TYPE_REFRESH, REFRESH_EXPIRATION_MS);
    }

    private String buildToken(UserDetails userDetails, String tokenType, long expirationMs) {
        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .claim("type", tokenType)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(SECRET_KEY, SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            return username != null &&
                   username.equals(userDetails.getUsername()) &&
                   !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isAccessToken(String token) {
        try {
            return TOKEN_TYPE_ACCESS.equals(extractAllClaims(token).get("type", String.class));
        } catch (Exception e) {
            return false;
        }
    }

    public boolean validateRefreshToken(String token) {
        try {
            Claims claims = extractAllClaims(token);
            boolean isRefresh = TOKEN_TYPE_REFRESH.equals(claims.get("type", String.class));
            boolean notExpired = claims.getExpiration() != null && claims.getExpiration().after(new Date());
            return isRefresh && notExpired;
        } catch (Exception e) {
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        try {
            Date expiration = extractAllClaims(token).getExpiration();
            return expiration != null && expiration.before(new Date());
        } catch (Exception e) {
            return true;
        }
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
