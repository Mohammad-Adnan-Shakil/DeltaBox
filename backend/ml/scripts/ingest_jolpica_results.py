#!/usr/bin/env python3
"""
Ingest historical F1 race results from Jolpica into DeltaBox Postgres tables.

Source: https://api.jolpi.ca/ergast/f1/

The script is idempotent for the historical_* tables it writes: seasons,
drivers, constructors, races, and results are upserted by their existing unique
keys. It intentionally uses the DB connection helper from feature_engineering_v3
so local environment variables keep working.
"""

from __future__ import annotations

import argparse
import re
import sys
import time
from datetime import datetime
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen
import json


BASE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BASE_DIR))

from utils.feature_engineering_v3 import get_db_connection  # noqa: E402


BASE_URL = "https://api.jolpi.ca/ergast/f1"
LAPPED_FINISH_RE = re.compile(r"^\+\d+\s+Laps?$", re.IGNORECASE)


def fetch_json(url: str, timeout: int = 30) -> dict[str, Any] | None:
    request = Request(url, headers={"User-Agent": "DeltaBox-ML-Ingestion/1.0"})
    try:
        with urlopen(request, timeout=timeout) as response:
            return json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        print(f"SKIP HTTP {exc.code}: {url}")
    except (URLError, TimeoutError) as exc:
        print(f"SKIP network error: {url} ({exc})")
    except json.JSONDecodeError as exc:
        print(f"SKIP malformed JSON: {url} ({exc})")
    return None


def jolpica_results_url(season: int, limit: int, offset: int) -> str:
    query = urlencode({"limit": limit, "offset": offset})
    return f"{BASE_URL}/{season}/results.json?{query}"


def get_nested(payload: dict[str, Any], *keys: str, default: Any = None) -> Any:
    current: Any = payload
    for key in keys:
        if not isinstance(current, dict) or key not in current:
            return default
        current = current[key]
    return current


def to_int(value: Any) -> int | None:
    try:
        if value in (None, ""):
            return None
        return int(value)
    except (TypeError, ValueError):
        return None


def to_decimal(value: Any) -> Decimal | None:
    try:
        if value in (None, ""):
            return None
        return Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError):
        return None


def normalize_status(raw_status: str | None) -> str | None:
    if not raw_status:
        return None
    if raw_status == "Finished" or LAPPED_FINISH_RE.match(raw_status):
        return "Finished"
    return raw_status


def fastest_lap_time(result: dict[str, Any]) -> str | None:
    time_payload = get_nested(result, "FastestLap", "Time", default={})
    if isinstance(time_payload, dict):
        return time_payload.get("time")
    return None


def upsert_season(cur, year: int, total_rounds: int | None) -> None:
    cur.execute(
        """
        INSERT INTO historical_season (year, total_rounds, updated_at)
        VALUES (%s, %s, CURRENT_TIMESTAMP)
        ON CONFLICT (year) DO UPDATE SET
            total_rounds = COALESCE(EXCLUDED.total_rounds, historical_season.total_rounds),
            updated_at = CURRENT_TIMESTAMP
        """,
        (year, total_rounds),
    )


def upsert_driver(cur, driver: dict[str, Any]) -> int:
    driver_ref = driver["driverId"]
    full_name = f"{driver.get('givenName', '')} {driver.get('familyName', '')}".strip()
    cur.execute(
        """
        INSERT INTO historical_driver
            (driver_ref, full_name, code, nationality, date_of_birth, updated_at)
        VALUES (%s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
        ON CONFLICT (driver_ref) DO UPDATE SET
            full_name = EXCLUDED.full_name,
            code = COALESCE(EXCLUDED.code, historical_driver.code),
            nationality = COALESCE(EXCLUDED.nationality, historical_driver.nationality),
            date_of_birth = COALESCE(EXCLUDED.date_of_birth, historical_driver.date_of_birth),
            updated_at = CURRENT_TIMESTAMP
        RETURNING id
        """,
        (
            driver_ref,
            full_name or None,
            driver.get("code") or driver.get("permanentNumber"),
            driver.get("nationality"),
            driver.get("dateOfBirth"),
        ),
    )
    return cur.fetchone()[0]


def upsert_constructor(cur, constructor: dict[str, Any]) -> int:
    constructor_ref = constructor["constructorId"]
    cur.execute(
        """
        INSERT INTO historical_constructor
            (constructor_ref, name, nationality, updated_at)
        VALUES (%s, %s, %s, CURRENT_TIMESTAMP)
        ON CONFLICT (constructor_ref) DO UPDATE SET
            name = EXCLUDED.name,
            nationality = COALESCE(EXCLUDED.nationality, historical_constructor.nationality),
            updated_at = CURRENT_TIMESTAMP
        RETURNING id
        """,
        (constructor_ref, constructor.get("name"), constructor.get("nationality")),
    )
    return cur.fetchone()[0]


def upsert_race(cur, race: dict[str, Any]) -> int:
    circuit = race.get("Circuit") or {}
    location = circuit.get("Location") or {}
    cur.execute(
        """
        INSERT INTO historical_race
            (season_year, round, race_name, circuit_name, circuit_country,
             race_date, status, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, 'COMPLETED', CURRENT_TIMESTAMP)
        ON CONFLICT (season_year, round) DO UPDATE SET
            race_name = EXCLUDED.race_name,
            circuit_name = EXCLUDED.circuit_name,
            circuit_country = EXCLUDED.circuit_country,
            race_date = EXCLUDED.race_date,
            status = EXCLUDED.status,
            updated_at = CURRENT_TIMESTAMP
        RETURNING id
        """,
        (
            to_int(race.get("season")),
            to_int(race.get("round")),
            race.get("raceName"),
            circuit.get("circuitName"),
            location.get("country"),
            race.get("date"),
        ),
    )
    return cur.fetchone()[0]


def upsert_result(cur, race_id: int, driver_id: int, constructor_id: int, result: dict[str, Any]) -> None:
    cur.execute(
        """
        INSERT INTO historical_result
            (race_id, driver_id, constructor_id, grid_position, finish_position,
             points, status, fastest_lap_time, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
        ON CONFLICT (race_id, driver_id) DO UPDATE SET
            constructor_id = EXCLUDED.constructor_id,
            grid_position = EXCLUDED.grid_position,
            finish_position = EXCLUDED.finish_position,
            points = EXCLUDED.points,
            status = EXCLUDED.status,
            fastest_lap_time = EXCLUDED.fastest_lap_time,
            updated_at = CURRENT_TIMESTAMP
        """,
        (
            race_id,
            driver_id,
            constructor_id,
            to_int(result.get("grid")),
            to_int(result.get("positionOrder") or result.get("position")),
            to_decimal(result.get("points")),
            normalize_status(result.get("status")),
            fastest_lap_time(result),
        ),
    )


def ingest_season(conn, season: int, delay_seconds: float, page_limit: int) -> tuple[int, int]:
    offset = 0
    total = None
    race_count = 0
    result_count = 0
    seen_races: set[tuple[int, int]] = set()

    while total is None or offset < total:
        url = jolpica_results_url(season, page_limit, offset)
        payload = fetch_json(url)
        time.sleep(delay_seconds)
        if payload is None:
            break

        race_table = get_nested(payload, "MRData", "RaceTable", default={})
        races = race_table.get("Races") if isinstance(race_table, dict) else None
        if not isinstance(races, list):
            print(f"SKIP malformed race table for season {season} offset {offset}")
            break

        total = to_int(get_nested(payload, "MRData", "total", default=0)) or 0
        cur = conn.cursor()
        try:
            upsert_season(cur, season, None)
            for race in races:
                if not isinstance(race, dict):
                    print(f"SKIP malformed race in season {season} offset {offset}")
                    continue
                round_num = to_int(race.get("round"))
                if round_num is None:
                    print(f"SKIP race without round in season {season}: {race.get('raceName')}")
                    continue

                race_id = upsert_race(cur, race)
                race_key = (season, round_num)
                if race_key not in seen_races:
                    race_count += 1
                    seen_races.add(race_key)

                results = race.get("Results") or []
                if not isinstance(results, list):
                    print(f"SKIP malformed results for {season} round {round_num}")
                    continue

                for result in results:
                    try:
                        driver = result["Driver"]
                        constructor = result["Constructor"]
                        driver_id = upsert_driver(cur, driver)
                        constructor_id = upsert_constructor(cur, constructor)
                        upsert_result(cur, race_id, driver_id, constructor_id, result)
                        result_count += 1
                    except (KeyError, TypeError) as exc:
                        print(f"SKIP malformed result {season} round {round_num}: {exc}")
                        continue

            cur.execute(
                """
                UPDATE historical_season
                SET total_rounds = (
                    SELECT COUNT(*) FROM historical_race WHERE season_year = %s
                ),
                updated_at = CURRENT_TIMESTAMP
                WHERE year = %s
                """,
                (season, season),
            )
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            cur.close()

        offset += page_limit
        if not races:
            break

    return race_count, result_count


def main() -> None:
    parser = argparse.ArgumentParser(description="Ingest Jolpica F1 race results into DeltaBox.")
    parser.add_argument("--start-year", type=int, default=2020)
    parser.add_argument("--end-year", type=int, default=2025)
    parser.add_argument("--delay", type=float, default=0.4)
    parser.add_argument("--limit", type=int, default=100)
    args = parser.parse_args()

    started = datetime.now()
    print(f"Starting Jolpica ingestion: {args.start_year}-{args.end_year}")
    print(f"Delay: {args.delay:.2f}s between requests")

    conn = get_db_connection()
    try:
        total_races = 0
        total_results = 0
        for season in range(args.start_year, args.end_year + 1):
            races, results = ingest_season(conn, season, args.delay, args.limit)
            total_races += races
            total_results += results
            print(f"{season}: upserted {races} races, {results} results")

        print("Ingestion complete")
        print(f"Total upserted races seen: {total_races}")
        print(f"Total upserted results seen: {total_results}")
        print(f"Elapsed seconds: {(datetime.now() - started).total_seconds():.1f}")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
