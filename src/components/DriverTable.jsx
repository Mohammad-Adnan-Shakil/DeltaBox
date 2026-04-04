const drivers = [
  { position: 1, name: "Max Verstappen", points: 110 },
  { position: 2, name: "Lewis Hamilton", points: 95 },
  { position: 3, name: "Charles Leclerc", points: 88 },
  { position: 4, name: "Lando Norris", points: 76 },
  { position: 5, name: "Carlos Sainz", points: 70 },
];

const DriverTable = () => {
  return (
    <div className="bg-[#1A1A22] p-6 rounded-xl mt-8">

      <h2 className="text-lg font-semibold mb-4">
        Driver Standings
      </h2>

      <table className="w-full text-left">
        <thead>
          <tr className="text-gray-400 text-sm border-b border-gray-700">
            <th className="pb-2">#</th>
            <th className="pb-2">Driver</th>
            <th className="pb-2 text-right">Points</th>
          </tr>
        </thead>

        <tbody>
          {drivers.map((driver) => (
            <tr
              key={driver.position}
              className="border-b border-gray-800 hover:bg-[#111]"
            >
              <td className="py-3">{driver.position}</td>
              <td>{driver.name}</td>
              <td className="text-right">{driver.points}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
};

export default DriverTable;