package com.f1pulse.backend.repository;

import com.f1pulse.backend.model.Race;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RaceRepository extends JpaRepository<Race, Long> {

    // For DriverInsightsService
    List<Race> findTop10ByDriverIdOrderByDateDesc(Long driverId);

    // For SimulationService (ascending order)
    List<Race> findByDriverIdOrderByDateAsc(Long driverId);

    
}