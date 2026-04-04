import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const data = [
  { race: "Bahrain", points: 25 },
  { race: "Saudi", points: 18 },
  { race: "Australia", points: 15 },
  { race: "Japan", points: 25 },
  { race: "China", points: 12 },
];

const PointsChart = () => {
  return (
    <div className="bg-[#1A1A22] p-6 rounded-xl mt-8">
      
      <h2 className="text-lg font-semibold mb-4">
        Points Trend
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="race" stroke="#888" />
          <YAxis stroke="#888" />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="points" 
            stroke="#E10600" 
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>

    </div>
  );
};

export default PointsChart;