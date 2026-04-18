import { useEffect, useState } from "react";
import api from "../utils/axios";

const Constructors = () => {
  const [constructors, setConstructors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConstructors = async () => {
      try {
        const res = await api.get("/constructors");
        setConstructors(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchConstructors();
  }, []);

  if (loading) {
    return <div className="card">Loading constructors...</div>;
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl">CONSTRUCTORS</h1>
        <div className="racing-divider"></div>
      </div>

      {/* LEADERBOARD */}
      <div className="space-y-4">

        {constructors.map((team, index) => (
          <div
            key={team.constructorId}
            className="card flex items-center justify-between"
          >

            {/* LEFT SIDE */}
            <div className="flex items-center gap-4">

              {/* Rank */}
              <div className="text-3xl font-mono">
                {index + 1}
              </div>

              {/* Name */}
              <div>
                <p className="font-medium text-lg">{team.name}</p>
                <p className="text-textSecondary text-sm">
                  {team.wins} wins
                </p>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="text-right">
              <p className="stat-number">{team.points}</p>
              <p className="text-textSecondary text-sm">points</p>
            </div>

          </div>
        ))}

      </div>

    </div>
  );
};

export default Constructors;