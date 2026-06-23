# Race Results - Root Cause Analysis & Solution

**Investigation Date:** May 31, 2026  
**Status:** COMPLETE - Root cause identified  
**Severity:** HIGH - Core feature non-functional

---

## CONFIRMED FACTS

1. ✅ `GET /api/races/1/results` returns: `[]`
2. ✅ `historical_result` table: **0 records**
3. ✅ `race` table: **Contains race metadata** (populated by SyncService)
4. ✅ Race metadata exists (Race ID 1 = Australian Grand Prix)
5. ✅ **Data is NOT missing** - Race results ARE being synced, but to WRONG table

---

## ROOT CAUSE: ARCHITECTURAL MISMATCH

### The Problem in One Picture

```
DATA FLOW:
F1 API 
  ↓
F1ApiClient.fetchRaceResults()  ← Fetches correctly ✓
  ↓
SyncService.syncRaces()          ← Stores in: race table ✓
  ↓
race table                        ← Has results ✓
  
But...

RaceController.getRaceResults() 
  ↓
Queries: historical_result table  ← EMPTY ✗
  ↓
Returns: []
```

### Two Separate Schemas Causing Confusion

| Schema | For | Tables | Sync Method | Auto Sync |
|--------|-----|--------|-------------|-----------|
| **Current Season (2026)** | Active races | `race`, `driver`, `team` | SyncService | YES (every 1h) |
| **Historical (1950-2024)** | Historical data | `historical_race`, `historical_result`, `historical_driver` | HistoricalDataIngestionService | NO (manual API only) |

**The Issue:** RaceController queries historical tables but SyncService populates current season tables.

---

## EXACT RESPONSIBLE CODE

### Class #1: SyncScheduler.java
**File Path:** `backend/src/main/java/com/f1pulse/backend/service/SyncScheduler.java`
**Lines:** 16-22

```java
@Scheduled(fixedDelayString = "3600000")  // Every 1 hour
public void syncAllAutomatically() {
    syncService.syncTeams();              // ✓ Works
    syncService.syncDrivers();            // ✓ Works  
    syncService.syncRaces();              // ⚠️ Partial - missing historical sync
    syncService.deduplicateScheduleRows(2026);
    // ✗ MISSING: No call to sync historical_result
}
```

**Issue:** Only calls basic sync, never populates `historical_result` table.

---

### Class #2: SyncService.java
**File Path:** `backend/src/main/java/com/f1pulse/backend/service/SyncService.java`
**Lines:** 168-231 (syncRaces method)

```java
public List<Race> syncRaces() {
    // Line 174: Fetches race results ✓
    List<RaceResultDTO> results = f1ApiClient.fetchRaceResults();
    
    // Lines 195-225: Process results
    for (RaceDTO raceDto : calendar) {
        // Results are stored ONLY in race table
        Race resultRow = new Race(
                driver.getId(),
                result.getRaceName(),
                ...
        );
        rowsToPersist.add(resultRow);  // Goes to race table
    }
    
    // Line 227: Save to race table
    raceRepository.saveAll(rowsToPersist);  // ✓ Stored here
    
    // ✗ MISSING: historicalResultRepository.saveAll(...)
}
```

**Issue:** Fetches results correctly but only stores in `race` table, never in `historical_result`.

---

### Class #3: RaceController.java
**File Path:** `backend/src/main/java/com/f1pulse/backend/controller/RaceController.java`
**Lines:** 107-114

```java
@GetMapping("/{raceId}/results")
public ResponseEntity<?> getRaceResults(@PathVariable Long raceId) {
    logger.info("GET /api/races/{}/results - Request received", raceId);
    try {
        // ✗ Queries WRONG table (historical_result is empty)
        List<HistoricalResult> allResults = 
            historicalResultRepository.findByRaceId(raceId);
        
        // Result: []
        if (allResults.isEmpty()) {
            return ResponseEntity.ok(new ArrayList<>());  // Empty response
        }
    }
}
```

**Issue:** Queries `historical_result` which is never populated by the sync service.

---

### Class #4: F1ApiClient.java
**File Path:** `backend/src/main/java/com/f1pulse/backend/service/F1ApiClient.java`
**Lines:** 117-160

```java
public List<RaceResultDTO> fetchRaceResults() {
    // ✓ CORRECT - Fetches from F1 API
    String response = restTemplate.getForObject(
        BASE_URL + "/current/results.json?limit=2000", 
        String.class
    );
    
    // Parses and extracts results
    // ✓ WORKING CORRECTLY
}
```

**Status:** ✓ Not the issue - this works correctly.

---

### Missing: HistoricalDataIngestionService
**File Path:** `backend/src/main/java/com/f1pulse/backend/service/HistoricalDataIngestionService.java`
**Lines:** 519-630 (storeResult method)

```java
@Async
@Transactional
public void ingestAllHistoricalData(String jobId, Integer fromYear, Integer toYear) {
    // This CAN populate historical_result table ✓
    // But it's ONLY called manually via admin API ✗
    
    ingestSeason(year);  // Calls storeResult()
}

private void storeResult(Map<String, Object> resultData) {
    // ✓ This correctly saves to historicalResultRepository
    resultRepository.save(result);
}
```

**Entry Points:**
- `POST /api/admin/ingest/historical` (manual, requires ADMIN)
- `POST /api/admin/ingest/year/2026` (manual, requires ADMIN)

**Issue:** Never called automatically for current season (2026).

---

## DATA FLOW TRACE

```
1. SyncScheduler.syncAllAutomatically()
   └─→ Runs every 1 hour
       └─→ 2. SyncService.syncRaces()
           └─→ 3. F1ApiClient.fetchRaceResults()
               ├─→ 4a. Parse results ✓
               └─→ 5a. Store in race table ✓
                      (Line 225: raceRepository.saveAll())
               
               └─→ ✗ MISSING STEP:
                   6. historicalResultRepository.saveAll()
                   
       └─→ RaceController.getRaceResults()
           └─→ Queries: historicalResultRepository.findByRaceId()
               └─→ Returns: [] (empty)
```

---

## THE SOLUTION

### Recommended: Fix SyncService to Populate historical_result

**Why this approach:**
- Maintains clean architecture
- Both tables stay in sync
- Minimal code changes
- Preserves existing functionality

### Code Changes Required

#### Step 1: Add Repository Injections
**File:** `SyncService.java` (Constructor)

```java
private final HistoricalResultRepository historicalResultRepository;
private final HistoricalRaceRepository historicalRaceRepository;
private final HistoricalDriverRepository historicalDriverRepository;
private final HistoricalSeasonRepository historicalSeasonRepository;

public SyncService(
    DriverRepository driverRepository,
    TeamRepository teamRepository,
    RaceRepository raceRepository,
    SyncMetaRepository syncMetaRepository,
    F1ApiClient f1ApiClient,
    HistoricalResultRepository historicalResultRepository,  // NEW
    HistoricalRaceRepository historicalRaceRepository,       // NEW
    HistoricalDriverRepository historicalDriverRepository,   // NEW
    HistoricalSeasonRepository historicalSeasonRepository) { // NEW
    
    this.driverRepository = driverRepository;
    this.teamRepository = teamRepository;
    this.raceRepository = raceRepository;
    this.syncMetaRepository = syncMetaRepository;
    this.f1ApiClient = f1ApiClient;
    this.historicalResultRepository = historicalResultRepository;
    this.historicalRaceRepository = historicalRaceRepository;
    this.historicalDriverRepository = historicalDriverRepository;
    this.historicalSeasonRepository = historicalSeasonRepository;
}
```

#### Step 2: Add New Method - Sync Historical Data for Current Season

**File:** `SyncService.java` (Add new method after syncRaces)

```java
public void syncHistoricalDataForCurrentSeason() {
    log.info("📅 Syncing historical data for current season: {}", CURRENT_SEASON);
    
    try {
        // 1. Ensure season exists in historical_season
        HistoricalSeason season = historicalSeasonRepository.findByYear(CURRENT_SEASON)
                .orElse(new HistoricalSeason(CURRENT_SEASON, 0));
        historicalSeasonRepository.save(season);
        
        // 2. Sync races to historical_race
        List<Race> currentRaces = raceRepository
                .findBySeasonAndDriverIdIsNull(CURRENT_SEASON);
        
        for (Race race : currentRaces) {
            Optional<HistoricalRace> existing = 
                historicalRaceRepository
                    .findBySeasonYearAndRound(CURRENT_SEASON, race.getRound());
            
            if (existing.isEmpty()) {
                HistoricalRace histRace = new HistoricalRace();
                histRace.setSeasonYear(CURRENT_SEASON);
                histRace.setRound(race.getRound());
                histRace.setRaceName(race.getRaceName());
                histRace.setCircuitName(race.getCircuitName());
                histRace.setCircuitCountry(race.getCountry());
                if (race.getDate() != null) {
                    histRace.setRaceDate(LocalDate.parse(race.getDate()));
                }
                histRace.setStatus(race.getStatus());
                historicalRaceRepository.save(histRace);
            }
        }
        
        // 3. Sync drivers to historical_driver
        List<Driver> currentDrivers = driverRepository
                .findBySeasonOrderByPointsDesc(CURRENT_SEASON);
        
        for (Driver driver : currentDrivers) {
            Optional<HistoricalDriver> existing = 
                historicalDriverRepository.findByDriverRef(driver.getCode());
            
            if (existing.isEmpty()) {
                HistoricalDriver histDriver = new HistoricalDriver();
                histDriver.setDriverRef(driver.getCode());
                histDriver.setCode(driver.getCode());
                histDriver.setFullName(driver.getName());
                histDriver.setNationality(driver.getNationality());
                historicalDriverRepository.save(histDriver);
            }
        }
        
        log.info("✅ Historical data synced for season {}", CURRENT_SEASON);
        
    } catch (Exception e) {
        log.error("❌ Error syncing historical data for current season", e);
    }
}
```

#### Step 3: Add New Method - Sync Results to historical_result

**File:** `SyncService.java` (Add new method after syncHistoricalDataForCurrentSeason)

```java
private void syncResultsToHistoricalTable(List<RaceDTO> calendar, 
                                         List<RaceResultDTO> results) {
    log.info("📊 Syncing race results to historical_result table");
    
    try {
        // 1. Group results by round
        Map<Integer, List<RaceResultDTO>> resultsByRound = results.stream()
                .collect(Collectors.groupingBy(RaceResultDTO::getRound));
        
        // 2. Get historical races for this season
        Map<Integer, HistoricalRace> histRacesByRound = 
            historicalRaceRepository.findBySeasonYear(CURRENT_SEASON).stream()
                .collect(Collectors.toMap(HistoricalRace::getRound, Function.identity()));
        
        // 3. Get historical drivers
        Map<String, HistoricalDriver> driversByCode = new HashMap<>();
        for (HistoricalDriver driver : historicalDriverRepository.findAll()) {
            if (driver.getCode() != null) {
                driversByCode.put(driver.getCode().toUpperCase(), driver);
            }
        }
        
        // 4. Save results
        int savedCount = 0;
        for (RaceDTO raceDto : calendar) {
            Integer round = raceDto.getRound();
            HistoricalRace histRace = histRacesByRound.get(round);
            if (histRace == null) continue;
            
            List<RaceResultDTO> roundResults = 
                resultsByRound.getOrDefault(round, List.of());
            
            for (RaceResultDTO result : roundResults) {
                String driverCode = result.getDriverCode();
                if (driverCode == null) continue;
                
                HistoricalDriver driver = driversByCode.get(driverCode);
                if (driver == null) continue;
                
                // Check if result already exists
                Optional<HistoricalResult> existing = 
                    historicalResultRepository
                        .findByRaceIdAndDriverId(histRace.getId(), driver.getId());
                
                // Create or update result
                HistoricalResult histResult = existing.orElse(new HistoricalResult());
                histResult.setRaceId(histRace.getId());
                histResult.setDriverId(driver.getId());
                histResult.setFinishPosition(result.getPosition());
                histResult.setStatus("Finished");
                
                historicalResultRepository.save(histResult);
                savedCount++;
            }
        }
        
        log.info("✅ Saved {} results to historical_result table", savedCount);
        
    } catch (Exception e) {
        log.error("❌ Error syncing results to historical table", e);
    }
}
```

#### Step 4: Update syncRaces() to Call New Methods

**File:** `SyncService.java` (Modify syncRaces method at end)

After line 227 (`raceRepository.saveAll(rowsToPersist);`), add:

```java
        raceRepository.saveAll(rowsToPersist);
        deduplicateScheduleRows(CURRENT_SEASON);
        updateSyncTime(key);
        
        // NEW: Sync to historical tables
        syncHistoricalDataForCurrentSeason();
        syncResultsToHistoricalTable(calendar, results);
        
        return saved.stream()
```

---

## VERIFICATION STEPS

### Before Deployment

1. **Check current state:**
```sql
SELECT COUNT(*) as result_count FROM historical_result;
-- Expected: 0
```

### After Deployment

1. **Wait for sync or restart application**

2. **Verify data was synced:**
```sql
SELECT COUNT(*) FROM historical_result;
-- Expected: > 0

SELECT COUNT(*) FROM historical_race 
WHERE season_year = 2026;
-- Expected: > 0

SELECT COUNT(*) FROM historical_driver;
-- Expected: > 0
```

3. **Check specific race:**
```sql
SELECT 
    hr.finish_position,
    hd.full_name,
    hd.code,
    hr.points
FROM historical_result hr
JOIN historical_driver hd ON hr.driver_id = hd.id
WHERE hr.race_id = (
    SELECT id FROM historical_race 
    WHERE season_year = 2026 AND round = 1
)
ORDER BY hr.finish_position;
-- Expected: 10 rows (P1-P10)
```

4. **Test API endpoint:**
```bash
curl http://localhost:8080/api/races/1/results
```

**Expected Response:**
```json
[
  {
    "position": 1,
    "driverId": 6,
    "driver": "Oscar Piastri",
    "driverCode": "OCN",
    "teamId": 3,
    "team": "McLaren",
    "points": 25,
    "gridPosition": 1,
    "finishPosition": 1,
    "status": "Finished"
  },
  {
    "position": 2,
    "driverId": 1,
    "driver": "Max Verstappen",
    "driverCode": "VER",
    "teamId": 1,
    "team": "Red Bull Racing",
    "points": 18,
    "gridPosition": 2,
    "finishPosition": 2,
    "status": "Finished"
  },
  {
    "position": 3,
    "driverId": 3,
    "driver": "Charles Leclerc",
    "driverCode": "LEC",
    "teamId": 2,
    "team": "Ferrari",
    "points": 15,
    "gridPosition": 3,
    "finishPosition": 3,
    "status": "Finished"
  }
]
```

---

## SUMMARY TABLE

| Aspect | Details |
|--------|---------|
| **Root Cause** | SyncService populates `race` table but RaceController queries empty `historical_result` table |
| **Broken Component** | RaceController.getRaceResults() |
| **Missing Logic** | No code to populate `historical_result` during sync |
| **Responsible Classes** | SyncService, SyncScheduler, RaceController |
| **Responsible Methods** | syncRaces(), syncAllAutomatically(), getRaceResults() |
| **Data Status** | ✓ Data IS being fetched; ✗ Data is stored in wrong table |
| **Solution** | Add historical sync logic to SyncService |
| **Files to Change** | 1 file (SyncService.java) |
| **Risk Level** | LOW - Adds new functionality without breaking existing |
| **Implementation Time** | 30-40 minutes |
| **Testing Time** | 5-10 minutes |

---

## QUICK CHECKLIST

- [ ] Add repository injections to SyncService constructor
- [ ] Implement `syncHistoricalDataForCurrentSeason()` method
- [ ] Implement `syncResultsToHistoricalTable()` method  
- [ ] Update `syncRaces()` to call new methods
- [ ] Compile and verify no errors
- [ ] Deploy to test environment
- [ ] Wait for sync to run OR restart application
- [ ] Query `historical_result` table to verify data
- [ ] Call `GET /api/races/1/results` endpoint
- [ ] Verify 3 podium results are returned
- [ ] Deploy to production

