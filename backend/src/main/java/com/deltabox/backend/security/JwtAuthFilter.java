package com.deltabox.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * ✅ Production-Ready JWT Authentication Filter
 * 
 * Responsibilities:
 * 1. Extract JWT token from Authorization header
 * 2. Validate token using JwtService
 * 3. Load user details using UserDetailsService
 * 4. Set authentication in SecurityContext
 * 5. Handle errors gracefully without breaking filter chain
 */
@Component
@ConditionalOnProperty(name = "security.enabled", havingValue = "true", matchIfMissing = true)
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthFilter.class);
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthFilter(JwtService jwtService,
                         CustomUserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                   HttpServletResponse response,
                                   FilterChain filterChain)
            throws ServletException, IOException {

        try {
            // 🔍 Step 0: Log incoming request
            String method = request.getMethod();
            String path = request.getRequestURI();
            logger.debug("🔐 JWT FILTER: {} {} | Remote: {}", method, path, request.getRemoteAddr());
            
            // 🔍 Step 1: Extract token from Authorization header
            final String authHeader = request.getHeader("Authorization");
            
            if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
                logger.debug("🔐 JWT FILTER: No valid Authorization header for {} {}", method, path);
                // No token - proceed without authentication
                filterChain.doFilter(request, response);
                return;
            }

            // 🔍 Step 2: Extract JWT token
            String token = authHeader.substring(BEARER_PREFIX.length()).trim();
            
            if (token.isEmpty()) {
                logger.debug("🔐 JWT FILTER: Empty token for {} {}", method, path);
                filterChain.doFilter(request, response);
                return;
            }

            // 🔍 Step 3: Extract username from token
            String email = jwtService.extractUsername(token);

            if (email == null) {
                logger.debug("🔐 JWT FILTER: Could not extract email from token for {} {}", method, path);
                filterChain.doFilter(request, response);
                return;
            }

            // 🔍 Step 4: Check if user is already authenticated
            if (SecurityContextHolder.getContext().getAuthentication() != null) {
                logger.debug("🔐 JWT FILTER: User already authenticated: {} for {} {}", email, method, path);
                filterChain.doFilter(request, response);
                return;
            }

            // 🔍 Step 5: Load user details from database
            UserDetails userDetails;
            try {
                userDetails = userDetailsService.loadUserByUsername(email);
            } catch (UsernameNotFoundException e) {
                logger.debug("🔐 JWT FILTER: User not found: {} for {} {}", email, method, path);
                filterChain.doFilter(request, response);
                return;
            }

            // 🔍 Step 6: Validate token
            if (!jwtService.isTokenValid(token, userDetails)) {
                logger.debug("🔐 JWT FILTER: Token validation failed for user: {} on {} {}", email, method, path);
                filterChain.doFilter(request, response);
                return;
            }

            // ✅ Step 7: Token is valid - Create authentication token
            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

            // Add request details (IP, session ID, etc.)
            authToken.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request)
            );

            // ✅ Step 8: Set authentication in SecurityContext
            SecurityContextHolder.getContext().setAuthentication(authToken);
            logger.debug("Authentication set for user: {} with authorities: {}", 
                    email, userDetails.getAuthorities());

        } catch (Exception e) {
            logger.error("Cannot set user authentication: {}", e.getMessage());
            // Don't break the filter chain on error
        }

        // ✅ Continue filter chain
        filterChain.doFilter(request, response);
    }
}
