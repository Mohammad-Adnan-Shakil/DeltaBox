package com.deltabox.backend.repository;

import com.deltabox.backend.model.HistoricalResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HistoricalResultRepository extends JpaRepository<HistoricalResult, Long> {
    List<HistoricalResult> findByRaceId(Long raceId);
    List<HistoricalResult> findByDriverId(Long driverId);
    Optional<HistoricalResult> findByRaceIdAndDriverId(Long raceId, Long driverId);
}
