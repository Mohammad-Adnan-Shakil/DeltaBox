import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: 'var(--color-base-800)',
          border: '1px solid var(--color-glass-border)',
          borderRadius: '8px',
          color: 'var(--color-text-primary)',
        }}
        className="px-3 py-2 shadow-lg"
      >
        <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>{label}</p>
        <p className="text-sm font-bold" style={{ color: 'var(--color-accent-500)' }}>{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export const StandingsChart = ({
  data = [],
  dataKey = "value",
  xKey = "label",
  color = "var(--color-accent-500)",
  gradientId = "standingsGradient",
}) => {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.2} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--color-base-600)" strokeOpacity={0.5} vertical={false} />
        <XAxis
          dataKey={xKey}
          axisLine={{ stroke: 'var(--color-base-600)' }}
          tickLine={false}
          tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
        />
        <YAxis
          axisLine={{ stroke: 'var(--color-base-600)' }}
          tickLine={false}
          tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          animationDuration={300}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default StandingsChart;
