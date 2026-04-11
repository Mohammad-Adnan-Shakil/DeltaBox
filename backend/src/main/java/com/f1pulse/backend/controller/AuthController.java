package com.f1pulse.backend.controller;

import com.f1pulse.backend.model.User;
import com.f1pulse.backend.repository.UserRepository;
import com.f1pulse.backend.security.JWTUtil;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final JWTUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository,
            JWTUtil jwtUtil,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public String register(@RequestBody User user) {

        User existing = userRepository.findByUsername(user.getUsername());

        if (existing != null) {
            throw new RuntimeException("Username already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);

        return "User registered";
    }

    @PostMapping("/login")
    public String login(@RequestBody User user) {

        User existing = userRepository.findByUsername(user.getUsername());

        if (existing != null && passwordEncoder.matches(user.getPassword(), existing.getPassword())) {
            return jwtUtil.generateToken(user.getUsername());
        }

throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");    }
}