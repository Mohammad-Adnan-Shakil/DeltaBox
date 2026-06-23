package com.deltabox.backend.repository;

import com.deltabox.backend.model.HistoricalRace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HistoricalRaceRepository extends JpaRepository<HistoricalRace, Long> {
    List<HistoricalRace> findBySeasonYearOrderByRound(Integer seasonYear);
    Optional<HistoricalRace> findBySeasonYearAndRound(Integer seasonYear, Integer round);
    List<HistoricalRace> findByCircuitName(String circuitName);
}
