#!/usr/bin/env python3
"""
OpenF1 Telemetry Data Fetcher
Replaces FastF1 with OpenF1 API for real-time telemetry data.

OpenF1 provides:
- Live telemetry data for current seasons
- Driver telemetry: Speed, Throttle, Brake, Gear, DRS, RPM
- Lap times and comparisons
- Current season and recent races
- Real-time updates

API: https://api.openf1.org
"""

import sys
import json
import logging
import requests
import numpy as np
from typing import Optional, Dict, List, Any
from urllib.parse import unquote
import warnings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Disable output buffering for proper streaming
sys.stdout.reconfigure(line_buffering=True)

# Suppress warnings
warnings.filterwarnings('ignore')

# OpenF1 API configuration
OPENF1_API_BASE = "https://api.openf1.org/v1"
CURRENT_SEASON = 2024  # Will be updated dynamically

# Session type mapping: shorthand -> OpenF1 full name
SESSION_TYPE_MAP = {
    'R': 'Race',
    'Q': 'Qualifying',
    'FP1': 'Practice 1',
    'FP2': 'Practice 2',
    'FP3': 'Practice 3',
    'S': 'Sprint',
    'RACE': 'Race',
    'QUALIFYING': 'Qualifying',
    'PRACTICE 1': 'Practice 1',
    'PRACTICE 2': 'Practice 2',
    'PRACTICE 3': 'Practice 3',
    'SPRINT': 'Sprint',
}


def get_current_season() -> int:
    """Get the current F1 season from OpenF1 API."""
    try:
        logger.info("📋 Fetching current season from OpenF1...")
        response = requests.get(f"{OPENF1_API_BASE}/drivers", timeout=5)
        response.raise_for_status()
        data = response.json()
        
        if data:
            # Get year from first driver's data
            current_year = max([d.get('session_key', 0) // 1000000 for d in data if 'session_key' in d])
            if current_year > 0:
                logger.info(f"✅ Current season detected: {current_year}")
                return current_year
        
        return 2024  # Default fallback
    except Exception as e:
        logger.warning(f"⚠️  Could not fetch current season: {str(e)}, using 2024")
        return 2024


def get_races(year: int) -> List[Dict[str, Any]]:
    """Fetch all races for a given season."""
    try:
        logger.info(f"🔍 Fetching races for {year}...")
        response = requests.get(f"{OPENF1_API_BASE}/races", params={"year": year}, timeout=10)
        response.raise_for_status()
        races = response.json()
        
        logger.info(f"✅ Found {len(races)} races for {year}")
        return races
    except Exception as e:
        logger.error(f"❌ Failed to fetch races for {year}: {str(e)}")
        return []


def get_meetings(year: int) -> List[Dict[str, Any]]:
    """Get all meetings (race events) for a given year."""
    try:
        logger.info(f"🏁 Fetching meetings for {year}...")
        response = requests.get(f"{OPENF1_API_BASE}/meetings", params={"year": year}, timeout=10)
        response.raise_for_status()
        meetings = response.json()
        
        logger.info(f"✅ Found {len(meetings)} meetings for {year}")
        return meetings
    except Exception as e:
        logger.error(f"❌ Failed to fetch meetings for {year}: {str(e)}")
        return []


def get_sessions(meeting_key: int) -> List[Dict[str, Any]]:
    """Get all sessions for a specific meeting."""
    try:
        response = requests.get(f"{OPENF1_API_BASE}/sessions", params={"meeting_key": meeting_key}, timeout=10)
        response.raise_for_status()
        sessions = response.json()
        
        return sessions
    except Exception as e:
        logger.error(f"❌ Failed to fetch sessions for meeting {meeting_key}: {str(e)}")
        return []


def find_race(year: int, grand_prix: str) -> Optional[Dict[str, Any]]:
    """Find a specific race by year and grand prix name."""
    try:
        races = get_races(year)
        
        grand_prix_lower = grand_prix.lower().strip()
        
        for race in races:
            race_name = race.get('race_name', '').lower()
            location = race.get('location', '').lower()
            
            if grand_prix_lower in race_name or grand_prix_lower in location:
                logger.info(f"✅ Found race: {race.get('race_name')}")
                return race
        
        logger.warning(f"⚠️  Race '{grand_prix}' not found for {year}")
        return None
    except Exception as e:
        logger.error(f"❌ Error finding race: {str(e)}")
        return None


def find_session(meeting_key: int, session_type: str) -> Optional[Dict[str, Any]]:
    """Find a specific session by meeting key and session type."""
    try:
        sessions = get_sessions(meeting_key)
        
        if not sessions:
            logger.warning(f"⚠️  No sessions found for meeting {meeting_key}")
            return None
        
        # Normalize requested session type
        session_type_upper = session_type.strip().upper()
        requested_session = SESSION_TYPE_MAP.get(session_type_upper, session_type_upper)
        
        logger.info(f"  🔍 Looking for session type: '{requested_session}' (input: '{session_type}')")
        
        for session in sessions:
            session_name = session.get('session_name', '').strip()
            
            # Debug: Log all available sessions
            if session == sessions[0]:
                logger.info(f"  📋 Available sessions: {[s.get('session_name') for s in sessions]}")
            
            # Exact match on session name
            if session_name == requested_session:
                logger.info(f"  ⏱ Found session: '{session_name}' (key: {session.get('session_key')})")
                return session
        
        logger.warning(f"⚠️  Session '{requested_session}' not found. Available: {[s.get('session_name') for s in sessions]}")
        return None
    except Exception as e:
        logger.error(f"❌ Error finding session: {str(e)}")
        return None


def get_drivers_for_session(session_key: int) -> List[Dict[str, Any]]:
    """Get all drivers that participated in a session."""
    try:
        response = requests.get(f"{OPENF1_API_BASE}/drivers", params={"session_key": session_key}, timeout=10)
        response.raise_for_status()
        drivers = response.json()
        
        logger.info(f"📊 Found {len(drivers)} drivers for session {session_key}")
        return drivers
    except Exception as e:
        logger.error(f"❌ Failed to fetch drivers: {str(e)}")
        return []


def get_driver_telemetry(session_key: int, driver_number: int) -> Optional[List[Dict[str, Any]]]:
    """
    Fetch telemetry data for a specific driver in a session.
    
    Returns telemetry points with: timestamp, speed, throttle, brake, gear, drs, rpm
    """
    try:
        logger.info(f"  📥 Fetching telemetry for driver {driver_number} in session {session_key}...")
        
        response = requests.get(
            f"{OPENF1_API_BASE}/telemetry",
            params={
                "session_key": session_key,
                "driver_number": driver_number
            },
            timeout=15
        )
        response.raise_for_status()
        telemetry = response.json()
        
        if not telemetry:
            logger.warning(f"  ⚠️  No telemetry available for driver {driver_number}")
            return None
        
        logger.info(f"  ✅ Retrieved {len(telemetry)} telemetry points for driver {driver_number}")
        return telemetry
    except Exception as e:
        logger.error(f"  ❌ Failed to fetch telemetry: {str(e)}")
        return None


def get_lap_times(session_key: int, driver_number: int) -> Optional[List[Dict[str, Any]]]:
    """Fetch lap times for a driver."""
    try:
        response = requests.get(
            f"{OPENF1_API_BASE}/laps",
            params={
                "session_key": session_key,
                "driver_number": driver_number
            },
            timeout=10
        )
        response.raise_for_status()
        laps = response.json()
        
        if laps:
            logger.info(f"  ✅ Retrieved {len(laps)} laps for driver {driver_number}")
            return laps
        
        return None
    except Exception as e:
        logger.warning(f"  ⚠️  Could not fetch laps: {str(e)}")
        return None


def process_telemetry_data(telemetry_data: List[Dict[str, Any]]) -> Dict[str, np.ndarray]:
    """
    Process raw OpenF1 telemetry into aligned arrays.
    
    Returns: {
        'speed': ndarray,
        'throttle': ndarray,
        'brake': ndarray,
        'gear': ndarray,
        'distance': ndarray,
    }
    """
    if not telemetry_data:
        return None
    
    try:
        # Extract data points
        speeds = []
        throttles = []
        brakes = []
        gears = []
        distances = []
        
        for point in telemetry_data:
            speeds.append(point.get('speed', 0))
            throttles.append(point.get('throttle', 0))
            brakes.append(point.get('brake', 0))
            gears.append(point.get('n_gear', 0))
            distances.append(point.get('distance', 0))
        
        if not distances:
            return None
        
        return {
            'speed': np.array(speeds, dtype=float),
            'throttle': np.array(throttles, dtype=float),
            'brake': np.array(brakes, dtype=float),
            'gear': np.array(gears, dtype=int),
            'distance': np.array(distances, dtype=float),
        }
    except Exception as e:
        logger.error(f"❌ Error processing telemetry: {str(e)}")
        return None


def align_telemetry_data(tel1: Dict[str, np.ndarray], tel2: Dict[str, np.ndarray]) -> tuple:
    """
    Align two telemetry datasets to the same distance points.
    """
    try:
        # Use minimum distance range
        max_distance = min(tel1['distance'].max(), tel2['distance'].max())
        min_distance = max(tel1['distance'].min(), tel2['distance'].min())
        
        # Create uniform distance array (1m intervals)
        distance_uniform = np.arange(min_distance, max_distance, 1.0)
        
        # Interpolate each telemetry variable
        tel1_aligned = {
            'distance': distance_uniform,
            'speed': np.interp(distance_uniform, tel1['distance'], tel1['speed']),
            'throttle': np.interp(distance_uniform, tel1['distance'], tel1['throttle']),
            'brake': np.interp(distance_uniform, tel1['distance'], tel1['brake']),
            'gear': np.interp(distance_uniform, tel1['distance'], tel1['gear']),
        }
        
        tel2_aligned = {
            'distance': distance_uniform,
            'speed': np.interp(distance_uniform, tel2['distance'], tel2['speed']),
            'throttle': np.interp(distance_uniform, tel2['distance'], tel2['throttle']),
            'brake': np.interp(distance_uniform, tel2['distance'], tel2['brake']),
            'gear': np.interp(distance_uniform, tel2['distance'], tel2['gear']),
        }
        
        return tel1_aligned, tel2_aligned
    except Exception as e:
        logger.error(f"❌ Error aligning telemetry: {str(e)}")
        return None, None


def calculate_lap_delta(speed1: np.ndarray, speed2: np.ndarray) -> List[float]:
    """Calculate lap delta (time difference) from speed data."""
    try:
        delta = []
        cumulative_delta = 0.0
        
        for i in range(len(speed1)):
            if i == 0:
                delta.append(0.0)
            else:
                # Estimate time difference: time = 1m / (speed/3.6)
                if speed2[i] > 0 and speed1[i] > 0:
                    time_driver1 = 1.0 / (speed1[i] / 3.6)
                    time_driver2 = 1.0 / (speed2[i] / 3.6)
                    point_delta = (time_driver1 - time_driver2) * 1000  # milliseconds
                else:
                    point_delta = 0.0
                
                cumulative_delta += point_delta
                delta.append(cumulative_delta / 1000)  # Back to seconds
        
        return delta
    except Exception as e:
        logger.error(f"❌ Error calculating delta: {str(e)}")
        return []


def downsample_data(data: Dict[str, List], max_points: int = 500) -> Dict[str, List]:
    """Downsample data to maximum number of points."""
    try:
        distance = data.get('distance', [])
        length = len(distance)
        
        if length <= max_points:
            return data
        
        # Calculate step size
        step = length // max_points
        if step < 1:
            step = 1
        
        indices = np.arange(0, length, step)
        if indices[-1] != length - 1:
            indices = np.append(indices, length - 1)
        
        downsampled = {}
        for key, values in data.items():
            if isinstance(values, np.ndarray):
                downsampled[key] = values[indices].tolist()
            else:
                downsampled[key] = [values[i] for i in indices if i < len(values)]
        
        logger.info(f"  📊 Downsampled from {length} to {len(indices)} points")
        return downsampled
    except Exception as e:
        logger.error(f"❌ Error downsampling: {str(e)}")
        return data


def analyze(year: int, grand_prix: str, session_type: str, driver1: str, driver2: str) -> Dict[str, Any]:
    """
    Analyze telemetry for two drivers using OpenF1 API.
    
    Args:
        year: F1 season year
        grand_prix: Grand prix name (e.g., "Monaco")
        session_type: Session type (e.g., "Q", "R")
        driver1: First driver code (e.g., "VER")
        driver2: Second driver code (e.g., "LEC")
    
    Returns:
        Dictionary with telemetry data
    """
    # Normalize and decode inputs
    grand_prix_decoded = unquote(grand_prix) if grand_prix else grand_prix
    session_type_decoded = unquote(session_type).upper() if session_type else session_type
    driver1_code = unquote(driver1).upper() if driver1 else driver1
    driver2_code = unquote(driver2).upper() if driver2 else driver2
    
    # 🚀 LOG ENTRY
    logger.info(f"🚀 OPENF1 TELEMETRY ANALYZE: Received request")
    logger.info(f"  📋 Input (raw): year={year}, grand_prix='{grand_prix}', session_type='{session_type}', driver1='{driver1}', driver2='{driver2}'")
    logger.info(f"  ✅ Input (decoded): year={year}, grand_prix='{grand_prix_decoded}', session_type='{session_type_decoded}', driver1='{driver1_code}', driver2='{driver2_code}'")
    
    try:
        # Step 1: Find the race (meeting)
        logger.info(f"🏁 Requested Race: {year} {grand_prix_decoded} ({session_type_decoded})")
        race = find_race(year, grand_prix_decoded)
        
        if not race:
            error_msg = f"Race not found: {grand_prix_decoded} {year}. Please check race name and year (2024 and later supported)."
            logger.error(f"❌ {error_msg}")
            return {"error": error_msg}
        
        # Get meeting key from race
        meeting_key = race.get('meeting_key')
        if not meeting_key:
            error_msg = f"Could not find meeting key for {grand_prix_decoded} {year}"
            logger.error(f"❌ {error_msg}")
            return {"error": error_msg}
        
        logger.info(f"🏎 Meeting Found: key={meeting_key}, race='{race.get('race_name')}'")
        
        # Step 2: Find the session
        session = find_session(meeting_key, session_type_decoded)
        
        if not session:
            error_msg = f"Session '{session_type}' not found for {grand_prix_decoded} {year}"
            logger.error(f"❌ OpenF1 Failure: {error_msg}")
            return {"error": error_msg}
        
        session_key = session.get('session_key')
        if not session_key:
            error_msg = f"Could not find session key for {grand_prix_decoded} {year} - {session_type_decoded}"
            logger.error(f"❌ {error_msg}")
            return {"error": error_msg}
        
        logger.info(f"⏱ Session Found: key={session_key}, type='{session.get('session_name')}'")
        
        # Step 3: Get drivers for this session
        logger.info(f"👥 Fetching drivers for session...")
        session_drivers = get_drivers_for_session(session_key)
        
        if not session_drivers:
            error_msg = f"No drivers found for session {session_key}"
            logger.error(f"❌ {error_msg}")
            return {"error": error_msg}
        
        # Find driver numbers by code
        driver_map = {d.get('name_acronym', '').upper(): d.get('driver_number') for d in session_drivers}
        
        logger.info(f"  Available drivers: {list(driver_map.keys())}")
        
        driver1_number = driver_map.get(driver1_code)
        driver2_number = driver_map.get(driver2_code)
        
        if not driver1_number:
            error_msg = f"Driver {driver1_code} not found in session. Available: {', '.join(driver_map.keys())}"
            logger.error(f"❌ {error_msg}")
            return {"error": error_msg}
        
        if not driver2_number:
            error_msg = f"Driver {driver2_code} not found in session. Available: {', '.join(driver_map.keys())}"
            logger.error(f"❌ {error_msg}")
            return {"error": error_msg}
        
        # Step 4: Fetch telemetry for both drivers
        logger.info(f"📡 Telemetry Loaded: Fetching for {driver1_code} and {driver2_code}...")
        
        tel1_raw = get_driver_telemetry(session_key, driver1_number)
        tel2_raw = get_driver_telemetry(session_key, driver2_number)
        
        if not tel1_raw or not tel2_raw:
            error_msg = f"Telemetry not available for drivers in this session"
            logger.error(f"❌ {error_msg}")
            return {"error": error_msg}
        
        # Process telemetry
        logger.info(f"⚙️  Processing telemetry data...")
        tel1_processed = process_telemetry_data(tel1_raw)
        tel2_processed = process_telemetry_data(tel2_raw)
        
        if not tel1_processed or not tel2_processed:
            error_msg = "Failed to process telemetry data"
            logger.error(f"❌ {error_msg}")
            return {"error": error_msg}
        
        # Align telemetry
        logger.info(f"🔄 Aligning telemetry data...")
        tel1_aligned, tel2_aligned = align_telemetry_data(tel1_processed, tel2_processed)
        
        if tel1_aligned is None:
            error_msg = "Failed to align telemetry data"
            logger.error(f"❌ {error_msg}")
            return {"error": error_msg}
        
        # Calculate delta
        logger.info(f"📊 Calculating lap delta...")
        delta = calculate_lap_delta(tel1_aligned['speed'], tel2_aligned['speed'])
        
        # Prepare output
        result_data = {
            'distance': tel1_aligned['distance'].tolist(),
            'driver1_speed': tel1_aligned['speed'].tolist(),
            'driver2_speed': tel2_aligned['speed'].tolist(),
            'driver1_throttle': tel1_aligned['throttle'].tolist(),
            'driver2_throttle': tel2_aligned['throttle'].tolist(),
            'driver1_brake': tel1_aligned['brake'].tolist(),
            'driver2_brake': tel2_aligned['brake'].tolist(),
            'driver1_gear': tel1_aligned['gear'].tolist(),
            'driver2_gear': tel2_aligned['gear'].tolist(),
            'delta': delta,
        }
        
        # Downsample
        downsampled = downsample_data(result_data, max_points=500)
        
        # Get session name for output
        session_name = session.get('session_name', session_type_decoded)
        
        # Build final output
        output = {
            'driver1': driver1_code,
            'driver2': driver2_code,
            'year': year,
            'race': grand_prix_decoded,
            'session': session_name,
            **downsampled
        }
        
        logger.info(f"✅ TELEMETRY ANALYSIS COMPLETE: {len(downsampled['distance'])} points for {driver1_code} vs {driver2_code}")
        
        return output
        
    except Exception as e:
        error_msg = f"Telemetry analysis failed: {str(e)}"
        logger.error(f"❌ OpenF1 Failure: {error_msg}", exc_info=True)
        return {"error": error_msg}


def main():
    """CLI entry point for testing."""
    if len(sys.argv) != 6:
        print("Usage: python telemetry_openf1.py <year> <grand_prix> <session_type> <driver1> <driver2>")
        print("Example: python telemetry_openf1.py 2024 Monaco Q VER LEC")
        sys.exit(1)
    
    year = int(sys.argv[1])
    grand_prix = sys.argv[2]
    session_type = sys.argv[3]
    driver1 = sys.argv[4]
    driver2 = sys.argv[5]
    
    result = analyze(year, grand_prix, session_type, driver1, driver2)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
