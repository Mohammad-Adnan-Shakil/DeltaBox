import { useState } from "react";
import { useFetch } from "../hooks/useFetch";
import { Card, Input, SkeletonTable } from "../components/common";
import { motion } from "framer-motion";

const Drivers = () => {
  const { data: drivers, loading } = useFetch("/drivers");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("points");

  // Filter and sort
  const filteredDrivers = (drivers || [])
    .filter((d) => {
      const searchLower = search.toLowerCase();
      return (
        d.name?.toLowerCase().includes(searchLower) ||
        d.code?.toLowerCase().includes(searchLower) ||
        d.team?.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      const aVal = a[sortBy] || 0;
      const bVal = b[sortBy] || 0;
      return typeof aVal === "string"
        ? aVal.localeCompare(bVal)
        : bVal - aVal;
    });

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-white flex items-center gap-3 mb-2">
            <span className="text-red-500">🏎️</span> Formula 1 Drivers
          </h1>
          <p className="text-gray-400">2024 Season Standings</p>
        </div>
        <SkeletonTable rows={10} cols={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white flex items-center gap-3 mb-2">
          <span className="text-red-500">🏎️</span> Formula 1 Drivers
        </h1>
        <p className="text-gray-400">{filteredDrivers.length} drivers</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Input
            placeholder="Search by name, code, or team..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
            focus:outline-none focus:border-red-500"
        >
          <option value="points">Sort by Points</option>
          <option value="name">Sort by Name</option>
          <option value="team">Sort by Team</option>
        </select>
      </div>

      {/* Drivers Grid - Card Layout */}
      {filteredDrivers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrivers.map((driver, idx) => (
            <motion.div
              key={driver.driverId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card
                hover
                className="flex flex-col h-full cursor-pointer transform transition"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{driver.name}</h3>
                    <p className="text-gray-400 text-sm">{driver.code}</p>
                  </div>
                  <span className="text-3xl font-bold text-red-500">#{idx + 1}</span>
                </div>

                {/* Team */}
                <div className="mb-4 pb-4 border-b border-gray-800">
                  <p className="text-gray-400 text-xs font-bold uppercase mb-1">Team</p>
                  <p className="text-white font-semibold">{driver.team || "—"}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 flex-1">
                  <div>
                    <p className="text-gray-400 text-xs font-bold uppercase mb-1">Points</p>
                    <p className="text-2xl font-bold text-green-500">
                      {driver.points || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs font-bold uppercase mb-1">Nationality</p>
                    <p className="text-white font-semibold">{driver.nationality || "—"}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <p className="text-gray-400 text-lg">No drivers found matching your search</p>
        </Card>
      )}

      {/* Table Alternative View - for detailed stats */}
      <Card>
        <h2 className="text-xl font-bold text-white mb-4">Detailed Standings</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-800">
              <tr className="text-gray-400 text-xs font-bold uppercase">
                <th className="px-4 py-3 text-left">Position</th>
                <th className="px-4 py-3 text-left">Driver</th>
                <th className="px-4 py-3 text-left">Team</th>
                <th className="px-4 py-3 text-right">Points</th>
                <th className="px-4 py-3 text-right">Nationality</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrivers.map((driver, idx) => (
                <tr
                  key={driver.driverId}
                  className="border-b border-gray-800 hover:bg-gray-800/30 transition"
                >
                  <td className="px-4 py-4 text-white font-bold">#{idx + 1}</td>
                  <td className="px-4 py-4 text-white font-semibold">{driver.name}</td>
                  <td className="px-4 py-4 text-gray-400">{driver.team || "—"}</td>
                  <td className="px-4 py-4 text-right font-bold text-green-500">
                    {driver.points || 0}
                  </td>
                  <td className="px-4 py-4 text-right text-gray-400">
                    {driver.nationality || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Drivers;