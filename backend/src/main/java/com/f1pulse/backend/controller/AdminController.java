package com.f1pulse.backend.controller;

import com.f1pulse.backend.dto.UserSummaryResponse;
import com.f1pulse.backend.repository.UserRepository;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;

    public AdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ✅ Only ADMIN can access
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users")
    public List<UserSummaryResponse> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(user -> new UserSummaryResponse(
                        user.getEmail(),   // ✅ FIXED
                        user.getRole()
                ))
                .toList();
    }
}