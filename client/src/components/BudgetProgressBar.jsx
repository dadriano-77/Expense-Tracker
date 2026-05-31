export default function BudgetProgressBar({ spent, budget }) {
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const color = pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#22c55e';

  return (
    <div style={{ background: '#e5e7eb', borderRadius: 4, height: 12, overflow: 'hidden' }}>
      <div style={{
        width: `${pct}%`,
        background: color,
        height: '100%',
        transition: 'width 0.3s',
      }} />
    </div>
  );
}
