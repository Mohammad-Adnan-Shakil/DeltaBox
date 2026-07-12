import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const PredictionDistributionChart = ({ data }) => {
  if (!data || data.length === 0) {
    return null;
  }

  const chartData = data.map(item => ({
    position: `P${item.position}`,
    probability: (item.probability * 100).toFixed(1)
  }));

  const maxProb = Math.max(...data.map(d => d.probability));
  const mostLikelyPosition = data.find(d => d.probability === maxProb);

  const CustomTooltip = ({ active, payload }) => {
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
          <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>{payload[0].payload.position}</p>
          <p className="text-sm font-bold" style={{ color: 'var(--color-accent-500)' }}>{payload[0].value}% probability</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-glass-border)] bg-[var(--color-base-800)]/40 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Probability Distribution</h3>
        {mostLikelyPosition && (
          <span className="text-xs rounded-full px-2 py-1" style={{ color: 'var(--color-data-warning)', background: 'var(--color-data-warning)/10' }}>
            Most likely: P{mostLikelyPosition.position}
          </span>
        )}
      </div>
      <p className="text-xs mb-4" style={{ color: 'var(--color-text-secondary)' }}>Probability of finishing at each position</p>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid stroke="var(--color-base-600)" strokeOpacity={0.5} strokeDasharray="3 3" />
          <XAxis
            dataKey="position"
            tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--color-base-600)' }}
          />
          <YAxis
            tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--color-base-600)' }}
            label={{ value: '%', angle: -90, position: 'insideLeft', style: { fill: 'var(--color-text-secondary)' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="probability"
            fill="var(--color-accent-500)"
            radius={[4, 4, 0, 0]}
            opacity={0.8}
            animationDuration={300}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PredictionDistributionChart;
