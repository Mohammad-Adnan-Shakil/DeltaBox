package com.deltabox.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class JwtAuthFilterTest {

    private JwtService jwtService;
    private CustomUserDetailsService userDetailsService;
    private TestableJwtAuthFilter filter;
    private HttpServletRequest request;
    private HttpServletResponse response;
    private FilterChain filterChain;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        jwtService = mock(JwtService.class);
        userDetailsService = mock(CustomUserDetailsService.class);
        filter = new TestableJwtAuthFilter(jwtService, userDetailsService);
        request = mock(HttpServletRequest.class);
        response = mock(HttpServletResponse.class);
        filterChain = mock(FilterChain.class);

        when(request.getMethod()).thenReturn("GET");
        when(request.getRequestURI()).thenReturn("/api/protected");
    }

    @Test
    void validAccessTokenAuthenticatesUser() throws ServletException, IOException {
        var userDetails = org.springframework.security.core.userdetails.User
                .withUsername("user@example.com")
                .password("password")
                .roles("USER")
                .build();
        when(request.getHeader("Authorization")).thenReturn("Bearer access-token");
        when(jwtService.isAccessToken("access-token")).thenReturn(true);
        when(jwtService.extractUsername("access-token")).thenReturn("user@example.com");
        when(userDetailsService.loadUserByUsername("user@example.com")).thenReturn(userDetails);
        when(jwtService.isTokenValid("access-token", userDetails)).thenReturn(true);

        filter.run(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                .isEqualTo(userDetails);
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void validRefreshTokenDoesNotAuthenticateUser() throws ServletException, IOException {
        when(request.getHeader("Authorization")).thenReturn("Bearer refresh-token");
        when(jwtService.isAccessToken("refresh-token")).thenReturn(false);

        filter.run(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(userDetailsService, never()).loadUserByUsername(anyString());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void missingAuthorizationHeaderDoesNotAuthenticateUser() throws ServletException, IOException {
        when(request.getHeader("Authorization")).thenReturn(null);

        filter.run(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
    }

    private static class TestableJwtAuthFilter extends JwtAuthFilter {

        private TestableJwtAuthFilter(JwtService jwtService,
                                      CustomUserDetailsService userDetailsService) {
            super(jwtService, userDetailsService);
        }

        private void run(HttpServletRequest request,
                         HttpServletResponse response,
                         FilterChain filterChain) throws ServletException, IOException {
            doFilterInternal(request, response, filterChain);
        }
    }
}
