package com.deltabox.backend.dto;

public class AuthResponse {

    private String token;
    private String refreshToken;
    private String username;
    private String email;
    private String role;

    public AuthResponse(String token, String refreshToken, String username, String email, String role) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.username = username;
        this.email = email;
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }
}
