const Predictions = () => {
  const predictions = [
    { race: "next_race", prediction: "Max Verstappen", confidence: "92%" },
    { race: "race_2", prediction: "Lewis Hamilton", confidence: "87%" },
    { race: "race_3", prediction: "Charles Leclerc", confidence: "84%" },
    { race: "race_4", prediction: "Lando Norris", confidence: "79%" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">AI Predictions</h1>

      <div className="grid grid-cols-1 gap-4">
        {predictions.map((pred, idx) => (
          <div 
            key={idx}
            className="bg-[#1A1A22] p-6 rounded-xl border border-[#E10600] border-opacity-30"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-gray-400 text-sm mb-2">
                  {pred.race.replace("_", " ").toUpperCase()}
                </h3>
                <p className="text-2xl font-bold">{pred.prediction}</p>
              </div>
              <div className="text-right">
                <p className="text-[#E10600] text-3xl font-bold">
                  {pred.confidence}
                </p>
                <p className="text-gray-500 text-sm">Confidence</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Predictions;
