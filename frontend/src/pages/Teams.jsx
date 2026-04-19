import { useState } from "react";
import { useFetch } from "../hooks/useFetch";
import { Card, Input, SkeletonCard } from "../components/common";
import { motion } from "framer-motion";

const Teams = () => {
  const { data: teams, loading } = useFetch("/constructors");
  const { data: drivers } = useFetch("/drivers");
  const [search, setSearch] = useState("");

  // Filter teams
  const filteredTeams = (teams || []).filter((team) =>
    team.name?.toLowerCase().includes(search.toLowerCase())
  );

  // Get drivers for each team
  const getTeamDrivers = (teamName) => {
    return (drivers || []).filter((d) => d.team === teamName);
  };

  // Calculate team points
  const getTeamPoints = (teamName) => {
    const teamDrivers = getTeamDrivers(teamName);
    return teamDrivers.reduce((sum, d) => sum + (d.points || 0), 0);
  };

  // Sort teams by points
  const sortedTeams = filteredTeams
    .map((team) => ({
      ...team,
      totalPoints: getTeamPoints(team.name),
      teamDrivers: getTeamDrivers(team.name),
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-white flex items-center gap-3 mb-2">
            <span className="text-red-500">🏆</span> Constructor Championship
          </h1>
          <p className="text-gray-400">{teams?.length || 0} Teams</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg h-48 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white flex items-center gap-3 mb-2">
          <span className="text-red-500">🏆</span> Constructor Championship
        </h1>
        <p className="text-gray-400">{sortedTeams.length} teams competing</p>
      </div>

      {/* Search */}
      <Input
        placeholder="Search teams by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Teams Grid */}
      {sortedTeams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedTeams.map((team, idx) => (
            <motion.div
              key={team.constructorId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card hover className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-800">
                  <div>
                    <p className="text-gray-400 text-xs font-bold uppercase mb-2">
                      Position #{idx + 1}
                    </p>
                    <h3 className="text-2xl font-bold text-white">{team.name}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-red-500">{team.totalPoints}</p>
                    <p className="text-xs text-gray-400">points</p>
                  </div>
                </div>

                {/* Team Info */}
                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-gray-400 text-xs font-bold uppercase mb-2">Drivers</p>
                    <div className="space-y-2">
                      {team.teamDrivers && team.teamDrivers.length > 0 ? (
                        team.teamDrivers.map((driver) => (
                          <div key={driver.driverId} className="flex justify-between text-sm">
                            <span className="text-white">{driver.name}</span>
                            <span className="text-green-500 font-semibold">
                              {driver.points || 0} pts
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No drivers assigned</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
                  <div>
                    <p className="text-gray-400 text-xs font-bold uppercase mb-1">Wins</p>
                    <p className="text-2xl font-bold text-blue-500">{team.wins || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs font-bold uppercase mb-1">Nationality</p>
                    <p className="text-white font-semibold">
                      {team.nationality || "—"}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <p className="text-gray-400 text-lg">No teams found matching your search</p>
        </Card>
      )}

      {/* Standings Table */}
      <Card>
        <h2 className="text-xl font-bold text-white mb-4">Constructor Standings</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-800">
              <tr className="text-gray-400 text-xs font-bold uppercase">
                <th className="px-4 py-3 text-left">Position</th>
                <th className="px-4 py-3 text-left">Team</th>
                <th className="px-4 py-3 text-right">Points</th>
                <th className="px-4 py-3 text-right">Wins</th>
                <th className="px-4 py-3 text-right">Drivers</th>
              </tr>
            </thead>
            <tbody>
              {sortedTeams.map((team, idx) => (
                <tr
                  key={team.constructorId}
                  className="border-b border-gray-800 hover:bg-gray-800/30 transition"
                >
                  <td className="px-4 py-4">
                    <span className="inline-block w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {idx + 1}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-white font-semibold">{team.name}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="font-bold text-green-500">{team.totalPoints}</span>
                  </td>
                  <td className="px-4 py-4 text-right text-gray-400">{team.wins || 0}</td>
                  <td className="px-4 py-4 text-right text-gray-400">
                    {team.teamDrivers?.length || 0}
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

export default Teams;