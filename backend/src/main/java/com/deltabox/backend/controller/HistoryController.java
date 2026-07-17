package com.deltabox.backend.controller;

import com.deltabox.backend.dto.ApiResponse;
import com.deltabox.backend.model.User;
import com.deltabox.backend.model.UserActivityHistory;
import com.deltabox.backend.repository.UserActivityHistoryRepository;
import com.deltabox.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/history")
public class HistoryController {

    private static final Logger log = LoggerFactory.getLogger(HistoryController.class);
    private static final int MAX_PER_TOOL = 20;

    private final UserActivityHistoryRepository historyRepository;
    private final UserRepository userRepository;

    public HistoryController(UserActivityHistoryRepository historyRepository, UserRepository userRepository) {
        this.historyRepository = historyRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserActivityHistory>>> getHistory(
            @RequestParam(value = "type", required = false) String toolType) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        User user = userRepository.findByEmail(email)
                .orElse(null);
        if (user == null) {
            return ResponseEntity.status(404)
                    .body(new ApiResponse<>(false, "User not found", null));
        }

        List<UserActivityHistory> history;
        if (toolType != null && !toolType.isBlank()) {
            history = historyRepository.findByUserIdAndToolTypeOrderByCreatedAtDesc(user.getId(), toolType.toUpperCase());
        } else {
            history = historyRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        }

        return ResponseEntity.ok(new ApiResponse<>(true, "History fetched", history));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserActivityHistory>> saveHistory(
            @RequestBody Map<String, String> body) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        User user = userRepository.findByEmail(email)
                .orElse(null);
        if (user == null) {
            return ResponseEntity.status(404)
                    .body(new ApiResponse<>(false, "User not found", null));
        }

        String toolType = body.getOrDefault("toolType", "").toUpperCase();
        String summary = body.getOrDefault("summary", "");
        String payload = body.getOrDefault("payload", "{}");

        if (!List.of("DELTA_ANALYST", "RACE_ENGINEER", "APEX_INTELLIGENCE").contains(toolType)) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Invalid toolType", null));
        }

        UserActivityHistory entry = new UserActivityHistory(user.getId(), toolType, summary, payload);
        historyRepository.save(entry);

        long count = historyRepository.countByUserIdAndToolType(user.getId(), toolType);
        if (count > MAX_PER_TOOL) {
            List<UserActivityHistory> all = historyRepository.findByUserIdAndToolTypeOrderByCreatedAtDesc(user.getId(), toolType);
            if (all.size() > MAX_PER_TOOL) {
                List<UserActivityHistory> toDelete = all.subList(MAX_PER_TOOL, all.size());
                historyRepository.deleteAll(toDelete);
            }
        }

        log.info("Saved {} history for user {}: {}", toolType, user.getId(), summary);
        return ResponseEntity.ok(new ApiResponse<>(true, "History saved", entry));
    }
}
