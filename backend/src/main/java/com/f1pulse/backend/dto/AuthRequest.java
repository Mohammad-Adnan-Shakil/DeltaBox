package com.deltabox.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class AuthRequest {

    private String username;  // Optional for registration

    @NotBlank
    private String email;

    @NotBlank
    private String password;

    // getters & setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
