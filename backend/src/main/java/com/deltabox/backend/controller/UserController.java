package com.deltabox.backend.controller;

import com.deltabox.backend.dto.UserResponse;
import com.deltabox.backend.dto.FavoriteDriverRequest;
import com.deltabox.backend.service.UserService;
import com.deltabox.backend.dto.ApiResponse;
import com.deltabox.backend.exception.UserNotFoundException;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@Tag(name = "User Profile", description = "User profile management and preferences")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    
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

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        UserResponse user = userService.getCurrentUser(email);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Profile fetched successfully", user)
        );
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @Valid @RequestBody FavoriteDriverRequest request) {
        
        try {
            logger.info("🎯 USER CONTROLLER: PUT /api/user/profile | Favorite Driver: {}", request.getFavoriteDriver());
            
            logger.debug("🔒 AUTH: JWT validation required");
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            logger.debug("👤 Authenticated user: {}", email);
            
            logger.info("💾 UserService.updateFavoriteDriver() called for email: {}", email);
            UserResponse user = userService.updateFavoriteDriver(email, request);
            
            logger.info("✅ USER CONTROLLER SUCCESS: Favorite driver updated to: {}", user.getFavoriteDriver());

            return ResponseEntity.ok(
                    new ApiResponse<>(true, "Profile updated successfully", user)
            );
            
        } catch (UserNotFoundException e) {
            logger.error("❌ USER NOT FOUND: {}", e.getMessage());
            return ResponseEntity.status(404)
                    .body(new ApiResponse<>(false, "User not found", null));

        } catch (IllegalArgumentException e) {
            logger.warn("❌ VALIDATION ERROR: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
                    
        } catch (Exception e) {
            logger.error("❌ USER CONTROLLER ERROR: {} - {}", e.getClass().getSimpleName(), e.getMessage());
            logger.error("Exception trace: ", e);
            return ResponseEntity.status(500)
                    .body(new ApiResponse<>(false, "Internal server error", null));
        }
    }

    @PutMapping("/profile/favorite-driver")
    public ResponseEntity<ApiResponse<UserResponse>> updateFavoriteDriver(
            @Valid @RequestBody FavoriteDriverRequest request) {
        
        try {
            logger.info("Updating favorite driver for user: {}", request.getFavoriteDriver());
            
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            
            logger.debug("Authenticated user email: {}", email);

            UserResponse user = userService.updateFavoriteDriver(email, request);
            
            logger.info("Successfully updated favorite driver for user: {}", email);

            return ResponseEntity.ok(
                    new ApiResponse<>(true, "Favorite driver updated successfully", user)
            );
            
        } catch (UserNotFoundException e) {
            logger.error("User not found during favorite driver update: {}", e.getMessage());
            return ResponseEntity.status(404)
                    .body(new ApiResponse<>(false, "User not found", null));

        } catch (IllegalArgumentException e) {
            logger.warn("Invalid favorite driver update request: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
                    
        } catch (Exception e) {
            logger.error("Error updating favorite driver: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(new ApiResponse<>(false, "Internal server error", null));
        }
    }
}
