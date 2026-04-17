def build_features(input_json, le_constructor, le_track):
    try:
        constructor_encoded = le_constructor.transform([input_json["constructor_id"]])[0]
        track_encoded = le_track.transform([input_json["track_id"]])[0]
    except:
        constructor_encoded = 0
        track_encoded = 0

    return [
        input_json["qualifying_position"],
        constructor_encoded,
        track_encoded,
        input_json["season_year"],
        input_json["recent_avg_position_last_5"],
        input_json["recent_std_last_5"],
        input_json["grid_position"],
        input_json["is_home_race"]
    ]