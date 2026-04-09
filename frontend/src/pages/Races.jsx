import { useEffect, useState } from "react";
import axios from "axios";

function Races() {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch from DB
  const fetchRaces = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/f1/races/db");
      setRaces(res.data);
    } catch (err) {
      console.error("Error fetching races:", err);
    }
  };

  // 🔹 Sync (API → DB → UI)
  const syncRaces = async () => {
    setLoading(true);
    try {
      await axios.post("http://localhost:8080/api/f1/races/save");
      await fetchRaces();
    } catch (err) {
      console.error("Sync failed:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    const loadRaces = async () => {
      await fetchRaces();
    };
    loadRaces();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Races</h1>

      {/* 🔹 Sync Button */}
      <button
        onClick={syncRaces}
        disabled={loading}
        className="mb-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        {loading ? "Syncing..." : "Sync Races"}
      </button>

      {/* 🔹 Table */}
      <div className="bg-[#1A1A22] p-6 rounded-xl overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 text-sm border-b border-gray-700">
              <th className="pb-2">#</th>
              <th className="pb-2">Race</th>
              <th className="pb-2">Circuit</th>
              <th className="pb-2">Location</th>
              <th className="pb-2">Country</th>
              <th className="pb-2">Date</th>
            </tr>
          </thead>

          <tbody>
            {races.map((race, index) => (
              <tr
                key={race.id}
                className="border-b border-gray-800 hover:bg-[#111]"
              >
                <td className="py-3">{index + 1}</td>
                <td>{race.raceName}</td>
                <td>{race.circuitName}</td>
                <td>{race.location}</td>
                <td>{race.country}</td>
                <td>{race.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Races;