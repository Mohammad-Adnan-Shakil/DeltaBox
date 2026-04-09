import { useEffect, useState } from "react";
import axios from "axios";

function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTeams = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/f1/teams/db");
      setTeams(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const syncTeams = async () => {
    setLoading(true);
    try {
      await axios.post("http://localhost:8080/api/f1/teams/save");
      await fetchTeams();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      await fetchTeams();
    })();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Teams</h1>

      <button
        onClick={syncTeams}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Sync Teams
      </button>

      {loading && <p className="text-yellow-400">Syncing...</p>}

      <div className="bg-[#1A1A22] p-6 rounded-xl">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 text-sm border-b border-gray-700">
              <th className="pb-2">#</th>
              <th className="pb-2">Team</th>
              <th className="pb-2">Nationality</th>
            </tr>
          </thead>

          <tbody>
            {teams.map((team, index) => (
              <tr
                key={team.id}
                className="border-b border-gray-800 hover:bg-[#111]"
              >
                <td className="py-3">{index + 1}</td>
                <td>{team.name}</td>
                <td>{team.nationality}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Teams;