export const ResultsTable = ({ results = [] }) => {
  if (!results || results.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-glass-border)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-glass-border)] bg-[var(--color-base-800)]">
            <th className="sticky top-0 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">
              Pos
            </th>
            <th className="sticky top-0 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">
              Driver
            </th>
            <th className="sticky top-0 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">
              Team
            </th>
            <th className="sticky top-0 px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">
              Points
            </th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => (
            <tr
              key={r.resultId || i}
              className="border-b border-[var(--color-glass-border)] transition-colors duration-100 hover:bg-white/5"
            >
              <td className="px-4 py-3 font-mono text-sm font-medium text-[var(--color-text-primary)]">
                {r.position || i + 1}
              </td>
              <td className="px-4 py-3 text-[var(--color-text-primary)]">
                {r.name}
              </td>
              <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                {r.team}
              </td>
              <td className="px-4 py-3 text-right font-mono text-sm font-bold text-[var(--color-data-warning)]">
                {r.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;
