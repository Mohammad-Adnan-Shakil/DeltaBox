package com.f1pulse;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowCredentials(true);
        config.setAllowedOrigins(List.of(
                "http://localhost:5173",   // dev server
                "http://localhost:5174",   // dev server (alt)
                "http://localhost:5175",   // dev server (alt)
                "http://localhost:4173",   // preview server (production build)
                "http://localhost:3000",   // alternative dev server
                "http://127.0.0.1:5173",   // localhost IP
                "http://127.0.0.1:5174",   // localhost IP
                "http://127.0.0.1:5175",   // localhost IP
                "http://127.0.0.1:4173",   // localhost IP (preview)
                "https://delta-box.vercel.app",   // Vercel production frontend
                "https://deltabox-2.onrender.com"  // Render production frontend
        ));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}
