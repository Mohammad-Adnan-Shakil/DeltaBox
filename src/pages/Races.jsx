const Races = () => {
  const races = [
    { round: 1, name: "Bahrain Grand Prix", date: "Mar 24, 2024", winner: "Max Verstappen" },
    { round: 2, name: "Saudi Arabian GP", date: "Mar 31, 2024", winner: "George Russell" },
    { round: 3, name: "Australian GP", date: "Apr 07, 2024", winner: "Lewis Hamilton" },
    { round: 4, name: "Japanese GP", date: "Apr 21, 2024", winner: "Max Verstappen" },
    { round: 5, name: "Chinese GP", date: "Apr 28, 2024", winner: "Charles Leclerc" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Races</h1>

      <div className="bg-[#1A1A22] p-6 rounded-xl">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 text-sm border-b border-gray-700">
              <th className="pb-2">Round</th>
              <th className="pb-2">Race</th>
              <th className="pb-2">Date</th>
              <th className="pb-2">Winner</th>
            </tr>
          </thead>

          <tbody>
            {races.map((race) => (
              <tr
                key={race.round}
                className="border-b border-gray-800 hover:bg-[#111]"
              >
                <td className="py-3">{race.round}</td>
                <td>{race.name}</td>
                <td>{race.date}</td>
                <td>{race.winner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Races;
