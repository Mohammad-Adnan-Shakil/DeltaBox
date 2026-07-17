package com.deltabox.backend.repository;

import com.deltabox.backend.model.UserActivityHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserActivityHistoryRepository extends JpaRepository<UserActivityHistory, Long> {
    List<UserActivityHistory> findByUserIdAndToolTypeOrderByCreatedAtDesc(Long userId, String toolType);
    List<UserActivityHistory> findByUserIdOrderByCreatedAtDesc(Long userId);
    long countByUserIdAndToolType(Long userId, String toolType);
}
