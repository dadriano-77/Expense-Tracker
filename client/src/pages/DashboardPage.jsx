import { useState, useEffect } from 'react';
import axios from 'axios';
import BudgetProgressBar from '../components/BudgetProgressBar';

const now = new Date();
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function DashboardPage() {
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.get('/api/dashboard', { params: { year, month } })
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => { setError('Failed to load dashboard'); setLoading(false); });
  }, [year, month]);

  return (
    <div>
      <h1>Dashboard</h1>

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.5rem' }}>
        <select
          value={month}
          onChange={e => setMonth(Number(e.target.value))}
          aria-label="Month"
        >
          {MONTHS.map((label, i) => (
            <option key={i + 1} value={i + 1}>{label}</option>
          ))}
        </select>
        <input
          type="number"
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          style={{ width: '80px' }}
          aria-label="Year"
        />
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: '#dc2626' }}>{error}</p>}

      {data && !loading && (
        <>
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '2rem' }}>
            <span>Total Budget: <strong>${data.total_budget.toFixed(2)}</strong></span>
            <span>Total Spent: <strong>${data.total_spent.toFixed(2)}</strong></span>
          </div>

          {data.categories.length === 0 ? (
            <p style={{ color: '#6b7280' }}>No budget or spending data for this month.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '0.5rem 0.75rem' }}>Category</th>
                  <th style={{ padding: '0.5rem 0.75rem' }}>Budget</th>
                  <th style={{ padding: '0.5rem 0.75rem' }}>Spent</th>
                  <th style={{ padding: '0.5rem 0.75rem' }}>Remaining</th>
                  <th style={{ padding: '0.5rem 0.75rem', minWidth: '140px' }}>Utilization</th>
                </tr>
              </thead>
              <tbody>
                {data.categories.map(row => (
                  <tr
                    key={row.category_id}
                    style={{
                      borderBottom: '1px solid #e5e7eb',
                      background: row.remaining_amount < 0 ? '#fef2f2' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{
                          display: 'inline-block',
                          width: '12px',
                          height: '12px',
                          borderRadius: '3px',
                          background: row.category_color,
                          flexShrink: 0,
                        }} />
                        {row.category_name}
                      </div>
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>${row.budget_amount.toFixed(2)}</td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>${row.spent_amount.toFixed(2)}</td>
                    <td style={{
                      padding: '0.5rem 0.75rem',
                      color: row.remaining_amount < 0 ? '#dc2626' : 'inherit',
                      fontWeight: row.remaining_amount < 0 ? 600 : 'normal',
                    }}>
                      ${row.remaining_amount.toFixed(2)}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      <div style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                        {row.utilization_percent}%
                      </div>
                      <BudgetProgressBar spent={row.spent_amount} budget={row.budget_amount} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
