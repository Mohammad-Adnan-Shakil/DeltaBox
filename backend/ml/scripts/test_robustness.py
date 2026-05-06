#!/usr/bin/env python3
"""Test telemetry with multiple races to ensure robustness"""
import sys
import json
sys.path.insert(0, '/projects/DeltaBox/backend/ml/scripts')

from telemetry_openf1 import analyze

test_cases = [
    {"year": 2024, "race": "Canadian", "session": "R", "driver1": "VER", "driver2": "LEC", "desc": "2024 Canadian GP Race"},
    {"year": 2024, "race": "Monaco", "session": "Q", "driver1": "NOR", "driver2": "LEC", "desc": "2024 Monaco GP Qualifying"},
    {"year": 2024, "race": "Monaco", "session": "R", "driver1": "NOR", "driver2": "ALO", "desc": "2024 Monaco GP Race"},
]

print("\n" + "="*80)
print("MULTI-RACE TELEMETRY ROBUSTNESS TEST")
print("="*80)

results = []

for i, test in enumerate(test_cases, 1):
    print("\nTest {}: {}".format(i, test['desc']))
    print("   Input: {} {} {} {} vs {}".format(test['year'], test['race'], test['session'], test['driver1'], test['driver2']))
    
    result = analyze(test['year'], test['race'], test['session'], test['driver1'], test['driver2'])
    
    if 'error' in result:
        status = "FAILED"
        details = result['error']
        results.append((test['desc'], status, details))
        print("   {}: {}".format(status, details))
    else:
        points = len(result.get('distance', []))
        driver1_avg_speed = sum(result.get('driver1_speed', [])) / max(len(result.get('driver1_speed', [])), 1)
        driver2_avg_speed = sum(result.get('driver2_speed', [])) / max(len(result.get('driver2_speed', [])), 1)
        status = "PASSED"
        details = "{} points, avg speeds: {:.1f} / {:.1f} km/h".format(points, driver1_avg_speed, driver2_avg_speed)
        results.append((test['desc'], status, details))
        print("   {}: {}".format(status, details))

print("\n" + "="*80)
print("TEST SUMMARY")
print("="*80)

for desc, status, details in results:
    print("[{}] {}".format(status, desc))
    print("     {}".format(details))

passed = sum(1 for _, status, _ in results if "PASSED" in status)
total = len(results)
print("\n" + "="*80)
print("Result: {}/{} tests passed".format(passed, total))
if passed == total:
    print("SUCCESS - All tests passed - Fix is robust")
else:
    print("WARNING - Some tests failed - check logs above")
print("="*80)
