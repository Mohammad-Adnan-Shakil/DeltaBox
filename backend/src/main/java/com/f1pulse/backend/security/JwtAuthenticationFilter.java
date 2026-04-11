package com.f1pulse.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService,
                                   CustomUserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();

        return path.startsWith("/api/auth/") ||
               path.startsWith("/swagger-ui") ||
               path.startsWith("/v3/api-docs") ||
               path.startsWith("/swagger-resources") ||
               path.startsWith("/webjars");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                   HttpServletResponse response,
                                   FilterChain filterChain)
            throws ServletException, IOException {

        try {
            String header = request.getHeader("Authorization");

            if (header != null && header.startsWith("Bearer ")) {

                String token = header.substring(7);

                String email = jwtService.extractEmail(token);

                if (email != null &&
                    SecurityContextHolder.getContext().getAuthentication() == null) {

                    UserDetails userDetails =
                            userDetailsService.loadUserByUsername(email);

                    if (jwtService.isTokenValid(token, userDetails.getUsername())) {

                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(
                                        userDetails,
                                        null,
                                        userDetails.getAuthorities()
                                );

                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }
            }

        } catch (Exception e) {
            System.out.println("JWT Filter error: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}