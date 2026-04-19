package com.f1pulse.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * ✅ Production-Ready Security Configuration
 * 
 * Features:
 * 1. Stateless session (STATELESS) - suitable for JWT
 * 2. CORS properly configured for frontend
 * 3. CSRF disabled (stateless API)
 * 4. JWT filter added before UsernamePasswordAuthenticationFilter
 * 5. Proper authentication/authorization setup
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // ✅ CORS configuration
                .cors()
                .and()
                
                // ✅ CSRF disabled (stateless API doesn't need CSRF protection)
                .csrf().disable()
                
                // ✅ Stateless session (important for JWT)
                .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
                
                // ✅ Authorization rules
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/public/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        
                        // All other requests require authentication
                        .anyRequest().authenticated()
                )
                
                // ✅ Exception handling (optional but recommended)
                .exceptionHandling()
                .authenticationEntryPoint((request, response, authException) -> {
                    response.sendError(401, "Unauthorized");
                })
                .and()
                
                // ✅ JWT filter MUST be added before UsernamePasswordAuthenticationFilter
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // ✅ Allow frontend origin
        config.setAllowedOrigins(List.of(
                "http://localhost:5173",      // Development
                "http://localhost:5174",      // Development (alternate port)
                "http://localhost:3000",      // Alternative dev port
                "http://127.0.0.1:5173",
                "http://127.0.0.1:5174"
        ));

        // ✅ Allow HTTP methods
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));

        // ✅ Allow headers (important for Authorization header)
        config.setAllowedHeaders(List.of("*"));
        
        // ✅ Allow credentials (cookies/auth headers)
        config.setAllowCredentials(true);
        
        // ✅ Cache preflight requests
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) 
            throws Exception {
        return config.getAuthenticationManager();
    }
}