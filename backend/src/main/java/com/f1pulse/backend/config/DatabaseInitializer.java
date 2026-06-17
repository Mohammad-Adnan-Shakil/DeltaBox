package com.f1pulse.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import com.f1pulse.backend.model.Race;
import com.f1pulse.backend.repository.RaceRepository;
import java.util.ArrayList;
import java.util.List;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    private final RaceRepository raceRepository;

    public DatabaseInitializer(RaceRepository raceRepository) {
        this.raceRepository = raceRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Only seed if database is empty
        if (raceRepository.count() > 0) {
            System.out.println("✓ Database already initialized");
            return;
        }

        System.out.println("Initializing 2026 season races...");

        List<Race> races = new ArrayList<>();
        
        // Completed races
        addRace(races, 1, "Australian Grand Prix", "Albert Park Grand Prix Circuit", "Melbourne", "Australia", "2026-03-15", "COMPLETED");
        addRace(races, 2, "Chinese Grand Prix", "Shanghai International Circuit", "Shanghai", "China", "2026-03-22", "COMPLETED");
        addRace(races, 3, "Japanese Grand Prix", "Suzuka Circuit", "Suzuka", "Japan", "2026-04-05", "COMPLETED");
        
        // Scheduled races
        addRace(races, 4, "Miami Grand Prix", "Miami International Autodrome", "Miami", "USA", "2026-05-03", "SCHEDULED");
        addRace(races, 5, "Emilia Romagna Grand Prix", "Autodromo Enzo e Dino Ferrari", "Imola", "Italy", "2026-05-17", "SCHEDULED");
        addRace(races, 6, "Monaco Grand Prix", "Circuit de Monaco", "Monte Carlo", "Monaco", "2026-05-24", "SCHEDULED");
        addRace(races, 7, "Spanish Grand Prix", "Circuit de Barcelona-Catalunya", "Barcelona", "Spain", "2026-06-07", "SCHEDULED");
        addRace(races, 8, "Canadian Grand Prix", "Circuit Gilles Villeneuve", "Montreal", "Canada", "2026-06-14", "SCHEDULED");
        addRace(races, 9, "Austrian Grand Prix", "Red Bull Ring", "Spielberg", "Austria", "2026-06-28", "SCHEDULED");
        addRace(races, 10, "British Grand Prix", "Silverstone Circuit", "Silverstone", "UK", "2026-07-05", "SCHEDULED");
        addRace(races, 11, "Belgian Grand Prix", "Circuit de Spa-Francorchamps", "Spa", "Belgium", "2026-07-26", "SCHEDULED");
        addRace(races, 12, "Hungarian Grand Prix", "Hungaroring", "Budapest", "Hungary", "2026-08-02", "SCHEDULED");
        addRace(races, 13, "Dutch Grand Prix", "Circuit Zandvoort", "Zandvoort", "Netherlands", "2026-08-30", "SCHEDULED");
        addRace(races, 14, "Italian Grand Prix", "Autodromo di Monza", "Monza", "Italy", "2026-09-06", "SCHEDULED");
        addRace(races, 15, "Azerbaijan Grand Prix", "Baku City Circuit", "Baku", "Azerbaijan", "2026-09-20", "SCHEDULED");
        addRace(races, 16, "Singapore Grand Prix", "Marina Bay Street Circuit", "Singapore", "Singapore", "2026-10-04", "SCHEDULED");
        addRace(races, 19, "United States Grand Prix", "Circuit of the Americas", "Austin", "USA", "2026-11-22", "SCHEDULED");
        addRace(races, 20, "Mexico City Grand Prix", "Autodromo Hermanos Rodriguez", "Mexico City", "Mexico", "2026-11-29", "SCHEDULED");
        addRace(races, 21, "Abu Dhabi Grand Prix", "Yas Marina Circuit", "Abu Dhabi", "UAE", "2026-12-06", "SCHEDULED");
        addRace(races, 22, "Saudi Arabian Grand Prix", "Jeddah Corniche Circuit", "Jeddah", "Saudi Arabia", "2026-12-13", "SCHEDULED");

        raceRepository.saveAll(races);
        System.out.println("✓ Database initialized with " + races.size() + " races for 2026 season");
    }

    private void addRace(List<Race> races, int round, String name, String circuit, String location, String country, String date, String status) {
        Race race = new Race(null, name, circuit, location, country, date, null);
        race.setRound(round);
        race.setSeason(2026);
        race.setStatus(status);
        races.add(race);
    }
}
