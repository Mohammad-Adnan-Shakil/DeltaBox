package com.deltabox.backend.repository;

import com.deltabox.backend.model.Race;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RaceRepository extends JpaRepository<Race, Long> {

    List<Race> findTop10ByDriverIdAndPositionIsNotNullOrderByDateDesc(Long driverId);

    List<Race> findByDriverIdAndPositionIsNotNullOrderByDateAsc(Long driverId);

    List<Race> findBySeasonAndDriverIdIsNullOrderByDateAsc(Integer season);

    List<Race> findBySeasonAndDriverIdIsNull(Integer season);
}
