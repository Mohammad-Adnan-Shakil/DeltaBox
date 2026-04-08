package com.f1pulse.backend.repository;

import com.f1pulse.backend.model.Driver;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DriverRepository extends JpaRepository<Driver, Long> {
}