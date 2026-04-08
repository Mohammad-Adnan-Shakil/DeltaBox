import { useEffect, useState } from "react";
import axios from "axios";

function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch from DB
  const fetchDrivers = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/f1/drivers/db");
      setDrivers(res.data);
    } catch (err) {
      console.error("Error fetching drivers:", err);
    }
  };

  // 🔹 Sync (API → DB → UI)
  const syncDrivers = async () => {
    setLoading(true);
    try {
      await axios.post("http://localhost:8080/api/f1/drivers/save");
      await fetchDrivers(); // refresh UI
    } catch (err) {
      console.error("Sync failed:", err);
    }
    setLoading(false);
  };

  // 🔹 Initial load
  useEffect(() => {
    fetchDrivers();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Drivers</h1>

      {/* 🔹 Sync Button */}
      <button
        onClick={syncDrivers}
        className="mb-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Sync Latest Data
      </button>

      {/* 🔹 Loading */}
      {loading && <p className="mb-4 text-yellow-400">Syncing data...</p>}

      {/* 🔹 Drivers Grid */}
      <div className="grid grid-cols-3 gap-4">
        {drivers.map((driver) => (
          <div
            key={driver.id}
            className="bg-gray-800 text-white p-4 rounded-lg shadow hover:scale-105 transition"
          >
            <h2 className="text-lg font-bold">{driver.name}</h2>
            <p className="text-sm text-gray-400">{driver.code}</p>
            <p className="text-sm">{driver.nationality}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Drivers;