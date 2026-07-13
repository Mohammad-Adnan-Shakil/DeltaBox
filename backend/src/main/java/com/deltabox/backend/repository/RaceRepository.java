package com.deltabox.backend.repository;

import com.deltabox.backend.model.Race;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RaceRepository extends JpaRepository<Race, Long> {

    List<Race> findTop10ByDriverIdAndPositionIsNotNullOrderByDateDesc(Long driverId);

    List<Race> findByDriverIdAndPositionIsNotNullOrderByDateAsc(Long driverId);

    List<Race> findBySeasonAndDriverIdIsNullOrderByDateAsc(Integer season);

    List<Race> findBySeasonAndDriverIdIsNull(Integer season);
    
    List<Race> findByRoundAndDriverIdIsNotNullOrderByPositionAsc(Integer round);
    
    List<Race> findByDriverIdAndCircuitNameAndPositionIsNotNull(Long driverId, String circuitName);
    
    List<Race> findByDriverIdInAndPositionIsNotNull(List<Long> driverIds);
    
    }
