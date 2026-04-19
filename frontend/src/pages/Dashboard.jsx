import { useFetch } from "../hooks/useFetch";
import { Card, SkeletonTable } from "../components/common";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const { data: drivers, loading: driversLoading } = useFetch("/drivers");
  const { data: races, loading: racesLoading } = useFetch("/races");

  const isLoading = driversLoading || racesLoading;

  // Prepare chart data
  const driverChartData = drivers
    ?.slice(0, 8)
    .map((d) => ({
      name: d.code || d.name,
      points: d.points || 0,
    })) || [];

  const raceData = races?.slice(0, 10) || [];

  // Find top performers
  const topDriver = drivers?.reduce((prev, current) =>
    (prev.points || 0) > (current.points || 0) ? prev : current
  ) || {};

  const topTeam = drivers
    ?.filter((d) => d.team)
    ?.reduce((acc, d) => {
      const existing = acc.find((t) => t.name === d.team);
      if (existing) {
        existing.points += d.points || 0;
      } else {
        acc.push({ name: d.team, points: d.points || 0 });
      }
      return acc;
    }, [])
    ?.sort((a, b) => b.points - a.points)[0] || {};

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg h-32 animate-pulse"></div>
          ))}
        </div>

        {/* Chart Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg h-80 animate-pulse"></div>
          ))}
        </div>

        {/* Table Skeleton */}
        <SkeletonTable rows={6} cols={4} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 📊 Key Statistics */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="text-red-500">◼</span> Key Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card hover className="flex flex-col items-center text-center">
            <p className="text-gray-400 text-sm font-medium">Active Drivers</p>
            <p className="text-5xl font-bold text-red-500 mt-3">{drivers?.length || 0}</p>
            <p className="text-xs text-gray-500 mt-2">2026 Season</p>
          </Card>

          <Card hover className="flex flex-col items-center text-center">
            <p className="text-gray-400 text-sm font-medium">Scheduled Races</p>
            <p className="text-5xl font-bold text-blue-500 mt-3">{races?.length || 0}</p>
            <p className="text-xs text-gray-500 mt-2">Upcoming & Past</p>
          </Card>

          <Card hover className="flex flex-col items-center text-center">
            <p className="text-gray-400 text-sm font-medium">Top Driver</p>
            <p className="text-2xl font-bold text-green-500 mt-3">{topDriver.name || "—"}</p>
            <p className="text-sm text-gray-400 mt-2">{topDriver.points || 0} pts</p>
          </Card>

          <Card hover className="flex flex-col items-center text-center">
            <p className="text-gray-400 text-sm font-medium">Top Team</p>
            <p className="text-2xl font-bold text-yellow-500 mt-3">{topTeam.name || "—"}</p>
            <p className="text-sm text-gray-400 mt-2">{topTeam.points || 0} pts</p>
          </Card>
        </div>
      </section>

      {/* 📈 Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Driver Standings Chart */}
        <Card>
          <h3 className="text-xl font-bold mb-4 text-white">Driver Standings</h3>
          {driverChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={driverChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => `${value} pts`}
                />
                <Bar dataKey="points" fill="#EF4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-12">No data available</p>
          )}
        </Card>

        {/* Race Calendar Chart */}
        <Card>
          <h3 className="text-xl font-bold mb-4 text-white">Race Calendar</h3>
          {raceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={raceData.slice(0, 10).map((r, idx) => ({
                round: `R${idx + 1}`,
                position: r.position || idx + 1,
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="round" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
                <Line type="monotone" dataKey="position" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-12">No race data</p>
          )}
        </Card>
      </section>

      {/* 🏁 Upcoming Races */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="text-red-500">◼</span> Upcoming Races
        </h2>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-400">
              <thead className="text-xs font-bold text-white border-b border-gray-700 uppercase">
                <tr>
                  <th className="px-6 py-4">Race</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {raceData.slice(0, 5).map((race, idx) => (
                  <tr key={idx} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                    <td className="px-6 py-4 font-semibold text-white">{race.raceName || `Race ${idx + 1}`}</td>
                    <td className="px-6 py-4">{race.location || race.country || "—"}</td>
                    <td className="px-6 py-4 text-gray-500">{race.date || "TBD"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        race.status === 'COMPLETED' 
                          ? 'bg-gray-500/20 text-gray-400' 
                          : 'bg-green-500/20 text-green-500'
                      }`}>
                        {race.status || 'SCHEDULED'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default Dashboard;