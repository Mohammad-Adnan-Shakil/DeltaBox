package com.f1pulse.backend.controller;

import com.f1pulse.backend.dto.UserSummaryResponse;
import com.f1pulse.backend.service.UserService;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserService userService;

    public AdminController(UserService userService) {
        this.userService = userService;
    }

    // ✅ Only ADMIN can access
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users")
    public List<UserSummaryResponse> getAllUsers() {
        return userService.getAllUsers();
    }
}