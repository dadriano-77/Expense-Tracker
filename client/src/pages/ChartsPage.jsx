import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  PieChart, Pie, Cell, Tooltip as PieTooltip, Legend as PieLegend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as BarTooltip, Legend as BarLegend,
  ResponsiveContainer,
} from 'recharts';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

export default function ChartsPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.get('/api/dashboard', { params: { year, month } })
      .then(r => setData(r.data))
      .catch(() => setError('Failed to load chart data'))
      .finally(() => setLoading(false));
  }, [year, month]);

  const pieData = (data?.categories ?? [])
    .filter(c => c.spent_amount > 0)
    .map(c => ({ name: c.category_name, value: c.spent_amount, fill: c.category_color }));

  const barData = (data?.categories ?? []).map(c => ({
    name: c.category_name,
    Budget: c.budget_amount,
    Actual: c.spent_amount,
  }));

  return (
    <div>
      <h1>Charts</h1>

      <div className="period-picker">
        <select className="form-select" value={month} onChange={e => setMonth(Number(e.target.value))}>
          {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
        </select>
        <select className="form-select" value={year} onChange={e => setYear(Number(e.target.value))}>
          {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {loading && <p style={{ color: 'var(--text-muted)' }}>Loading...</p>}
      {error && <p className="error-msg">{error}</p>}

      {data && (
        <>
          <div className="chart-section">
            <h2>Spending by Category</h2>
            {pieData.length === 0 ? (
              <p className="empty-state">No spending data for this period.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <PieTooltip formatter={v => `₱${Number(v).toFixed(2)}`} />
                  <PieLegend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="chart-section">
            <h2>Budget vs Actual</h2>
            {barData.length === 0 ? (
              <p className="empty-state">No data for this period.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                  <BarTooltip formatter={v => `₱${Number(v).toFixed(2)}`} />
                  <BarLegend />
                  <Bar dataKey="Budget" fill="#7c6ff7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Actual" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
}
