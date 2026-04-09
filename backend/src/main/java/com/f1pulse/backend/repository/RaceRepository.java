package com.f1pulse.backend.repository;

import com.f1pulse.backend.model.Race;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RaceRepository extends JpaRepository<Race, Long> {
}