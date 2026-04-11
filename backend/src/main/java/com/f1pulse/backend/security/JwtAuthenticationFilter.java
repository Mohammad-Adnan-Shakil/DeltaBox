package com.f1pulse.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JWTUtil jwtUtil;

    public JwtAuthenticationFilter(JWTUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/api/auth/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String header = request.getHeader("Authorization");
            System.out.println("Authorization header: " + header); // DEBUG
            
            if (header != null) {
                // Extract token - handle both "Bearer token" and direct token formats
                String token = header.startsWith("Bearer ") ? header.substring(7) : header;
                System.out.println("Token received: " + token.substring(0, Math.min(50, token.length())) + "..."); // DEBUG
                
                boolean isValid = jwtUtil.validateToken(token);
                System.out.println("Token valid: " + isValid); // DEBUG
                
                if (isValid) {
                    String username = jwtUtil.extractUsername(token);
                    System.out.println("Username extracted: " + username); // DEBUG
                    UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(username, null, Collections.emptyList());
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    System.out.println("Authentication set for user: " + username); // DEBUG
                }
            }
        } catch (Exception e) {
            System.out.println("JWT Filter error: " + e.getMessage()); // DEBUG
            e.printStackTrace();
        }
        filterChain.doFilter(request, response);
    }
}