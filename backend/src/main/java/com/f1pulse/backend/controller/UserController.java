package com.f1pulse.backend.controller;

import com.f1pulse.backend.dto.UserResponse;
import com.f1pulse.backend.model.User;
import com.f1pulse.backend.repository.UserRepository;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public UserResponse getCurrentUser() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // ✅ This is now EMAIL (important!)
        String email = auth.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new UserResponse(
                user.getEmail(),   // ✅ FIXED
                user.getRole()
        );
    }
}