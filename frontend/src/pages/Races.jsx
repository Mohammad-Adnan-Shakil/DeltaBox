import { useState } from "react";
import { useFetch } from "../hooks/useFetch";
import { Card, Input, SkeletonTable } from "../components/common";
import { motion } from "framer-motion";

const Races = () => {
  const { data: races, loading } = useFetch("/races");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // Filter races
  const filteredRaces = (races || []).filter((race) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      race.raceName?.toLowerCase().includes(searchLower) ||
      race.location?.toLowerCase().includes(searchLower) ||
      race.country?.toLowerCase().includes(searchLower);

    if (filter === "all") return matchesSearch;
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-white flex items-center gap-3 mb-2">
            <span className="text-red-500">🏁</span> F1 2024 Calendar
          </h1>
          <p className="text-gray-400">{races?.length || 0} Races scheduled</p>
        </div>
        <SkeletonTable rows={8} cols={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white flex items-center gap-3 mb-2">
          <span className="text-red-500">🏁</span> F1 2024 Calendar
        </h1>
        <p className="text-gray-400">{filteredRaces.length} races</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          placeholder="Search by race name, location, or country..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
            focus:outline-none focus:border-red-500"
        >
          <option value="all">All Races</option>
          <option value="completed">Completed</option>
          <option value="upcoming">Upcoming</option>
        </select>
      </div>

      {/* Timeline View */}
      {filteredRaces.length > 0 ? (
        <div className="space-y-4">
          {filteredRaces.map((race, idx) => (
            <motion.div
              key={race.raceId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex gap-6"
            >
              {/* Timeline Marker */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-4 h-4 rounded-full border-2 flex items-center justify-center
                    ${
                      idx % 2 === 0
                        ? "bg-red-500 border-red-500"
                        : "bg-blue-500 border-blue-500"
                    }
                  `}
                >
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                {idx !== filteredRaces.length - 1 && (
                  <div className="w-[2px] h-24 bg-gradient-to-b from-red-500 to-transparent mt-2"></div>
                )}
              </div>

              {/* Race Card */}
              <Card hover className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Race Info */}
                  <div className="md:col-span-2">
                    <p className="text-gray-400 text-xs font-bold uppercase mb-2">Round {idx + 1}</p>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {race.raceName || `Race ${idx + 1}`}
                    </h3>
                    <div className="space-y-1 text-gray-400">
                      <p className="flex items-center gap-2">
                        📍 {race.location || race.country || "—"}
                      </p>
                      <p className="flex items-center gap-2">
                        🏰 {race.circuitName || "—"}
                      </p>
                      <p className="flex items-center gap-2">
                        📅 {race.date || "TBD"}
                      </p>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div>
                    <p className="text-gray-400 text-xs font-bold uppercase mb-2">Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        race.position
                          ? "bg-green-500/20 text-green-500"
                          : "bg-yellow-500/20 text-yellow-500"
                      }`}
                    >
                      {race.position ? "COMPLETED" : "SCHEDULED"}
                    </span>
                  </div>

                  <div>
                    <p className="text-gray-400 text-xs font-bold uppercase mb-2">Position</p>
                    <p className="text-3xl font-bold text-red-500">
                      P{race.position || "—"}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <p className="text-gray-400 text-lg">No races found matching your search</p>
        </Card>
      )}

      {/* Table View */}
      <Card>
        <h2 className="text-xl font-bold text-white mb-4">Race Schedule Table</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-800">
              <tr className="text-gray-400 text-xs font-bold uppercase">
                <th className="px-4 py-3 text-left">Round</th>
                <th className="px-4 py-3 text-left">Race</th>
                <th className="px-4 py-3 text-left">Circuit</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRaces.map((race, idx) => (
                <tr
                  key={race.raceId}
                  className="border-b border-gray-800 hover:bg-gray-800/30 transition"
                >
                  <td className="px-4 py-4 text-white font-bold">#{idx + 1}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-white font-semibold">
                        {race.raceName || `Race ${idx + 1}`}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {race.location}, {race.country}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-400">{race.circuitName || "—"}</td>
                  <td className="px-4 py-4 text-gray-400">{race.date || "TBD"}</td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        race.position
                          ? "bg-green-500/20 text-green-500"
                          : "bg-yellow-500/20 text-yellow-500"
                      }`}
                    >
                      {race.position ? "Done" : "Scheduled"}
                    </span>
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

export default Races;