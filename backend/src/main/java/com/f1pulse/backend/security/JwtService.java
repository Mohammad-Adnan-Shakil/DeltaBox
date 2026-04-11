package com.f1pulse.backend.security;

import com.f1pulse.backend.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {

    private final String SECRET_KEY = "my-secret-key"; // ⚠️ later move to env

    // 🔐 Generate token from User
    public String generateToken(User user) {
        return generateToken(user.getEmail());
    }

    // 🔐 Generate token from email
    public String generateToken(String email) {
        Map<String, Object> claims = new HashMap<>();

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(email)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) // 24h
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
                .compact();
    }

    // 🔍 Extract email (subject)
    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    // 🔍 Extract all claims
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .parseClaimsJws(token)
                .getBody();
    }

    // ✅ Validate token
    public boolean isTokenValid(String token, String email) {
        return extractEmail(token).equals(email);
    }
}