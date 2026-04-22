package com.deltabox.backend.controller;

import com.deltabox.backend.dto.UserResponse;
import com.deltabox.backend.service.UserService;
import com.deltabox.backend.dto.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@Tag(name = "User Profile", description = "User profile management and preferences")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser() {

    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    String email = auth.getName();

    UserResponse user = userService.getCurrentUser(email);

    return ResponseEntity.ok(
            new ApiResponse<>(true, "User fetched successfully", user)
    );
}
}
