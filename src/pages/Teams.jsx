const Teams = () => {
  const teams = [
    { position: 1, name: "Red Bull Racing", points: 240 },
    { position: 2, name: "Mercedes", points: 210 },
    { position: 3, name: "Ferrari", points: 195 },
    { position: 4, name: "McLaren", points: 170 },
    { position: 5, name: "Alpine", points: 145 },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Teams Standings</h1>

      <div className="bg-[#1A1A22] p-6 rounded-xl">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 text-sm border-b border-gray-700">
              <th className="pb-2">#</th>
              <th className="pb-2">Team</th>
              <th className="pb-2 text-right">Points</th>
            </tr>
          </thead>

          <tbody>
            {teams.map((team) => (
              <tr
                key={team.position}
                className="border-b border-gray-800 hover:bg-[#111]"
              >
                <td className="py-3">{team.position}</td>
                <td>{team.name}</td>
                <td className="text-right">{team.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Teams;
