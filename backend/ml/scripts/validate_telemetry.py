#!/usr/bin/env python3
"""Verify end-to-end telemetry integration"""
import sys
import json
sys.path.insert(0, '/projects/DeltaBox/backend/ml/scripts')

from telemetry_openf1 import analyze

# Test: 2024 Canadian GP Race, VER vs LEC
result = analyze(2024, "Canadian", "R", "VER", "LEC")

print("\n" + "="*80)
print("✅ TELEMETRY DATA STRUCTURE VALIDATION")
print("="*80)

# Check result structure
if 'error' in result:
    print(f"❌ ERROR: {result['error']}")
    sys.exit(1)

expected_keys = ['driver1', 'driver2', 'year', 'race', 'session', 'distance', 
                 'driver1_speed', 'driver2_speed', 'driver1_throttle', 'driver2_throttle',
                 'driver1_brake', 'driver2_brake', 'driver1_gear', 'driver2_gear', 'delta']

print(f"\n📋 Checking response keys...")
for key in expected_keys:
    if key in result:
        val = result[key]
        if isinstance(val, list):
            print(f"  ✅ {key}: {len(val)} values")
        else:
            print(f"  ✅ {key}: {val}")
    else:
        print(f"  ❌ MISSING: {key}")

# Verify data alignment
print(f"\n📊 Checking data alignment...")
distance_len = len(result.get('distance', []))
speed1_len = len(result.get('driver1_speed', []))
speed2_len = len(result.get('driver2_speed', []))
throttle1_len = len(result.get('driver1_throttle', []))
throttle2_len = len(result.get('driver2_throttle', []))
brake1_len = len(result.get('driver1_brake', []))
brake2_len = len(result.get('driver2_brake', []))
delta_len = len(result.get('delta', []))

print(f"  Distance points: {distance_len}")
print(f"  Driver1 Speed: {speed1_len}")
print(f"  Driver2 Speed: {speed2_len}")
print(f"  Driver1 Throttle: {throttle1_len}")
print(f"  Driver2 Throttle: {throttle2_len}")
print(f"  Driver1 Brake: {brake1_len}")
print(f"  Driver2 Brake: {brake2_len}")
print(f"  Delta: {delta_len}")

if len(set([distance_len, speed1_len, speed2_len, throttle1_len, throttle2_len, brake1_len, brake2_len, delta_len])) == 1:
    print(f"  ✅ All arrays aligned to {distance_len} points")
else:
    print(f"  ❌ Array length mismatch!")

# Validate data ranges
print(f"\n🔍 Checking data value ranges...")
speeds_1 = result.get('driver1_speed', [])
speeds_2 = result.get('driver2_speed', [])
if speeds_1:
    print(f"  Driver1 Speed: min={min(speeds_1):.1f}, max={max(speeds_1):.1f} km/h")
if speeds_2:
    print(f"  Driver2 Speed: min={min(speeds_2):.1f}, max={max(speeds_2):.1f} km/h")

throttles_1 = result.get('driver1_throttle', [])
if throttles_1:
    print(f"  Driver1 Throttle: min={min(throttles_1):.1f}, max={max(throttles_1):.1f} %")

brakes_1 = result.get('driver1_brake', [])
if brakes_1:
    print(f"  Driver1 Brake: min={min(brakes_1):.1f}, max={max(brakes_1):.1f} %")

deltas = result.get('delta', [])
if deltas:
    print(f"  Lap Delta: min={min(deltas):.3f}, max={max(deltas):.3f} sec")
    print(f"  Final Gap: {deltas[-1]:.3f} sec")

print(f"\n📄 Race Context:")
print(f"  Year: {result.get('year')}")
print(f"  Race: {result.get('race')}")
print(f"  Session: {result.get('session')}")
print(f"  Driver1: {result.get('driver1')}")
print(f"  Driver2: {result.get('driver2')}")

print(f"\n{'='*80}")
print(f"✅ END-TO-END VALIDATION COMPLETE")
print(f"{'='*80}")
