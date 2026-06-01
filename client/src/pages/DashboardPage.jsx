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

      <div className="period-picker">
        <select
          className="form-select"
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
          className="form-input year-input"
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          aria-label="Year"
        />
      </div>

      {loading && <p style={{ color: 'var(--text-muted)' }}>Loading...</p>}
      {error && <p className="error-msg">{error}</p>}

      {data && !loading && (
        <>
          <div className="stat-row">
            <div className="stat-card">
              <div className="stat-label">Total Budget</div>
              <div className="stat-value">₱{data.total_budget.toFixed(2)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Spent</div>
              <div className="stat-value">₱{data.total_spent.toFixed(2)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Remaining</div>
              <div
                className="stat-value"
                style={{ color: (data.total_budget - data.total_spent) < 0 ? 'var(--danger)' : undefined }}
              >
                ₱{(data.total_budget - data.total_spent).toFixed(2)}
              </div>
            </div>
          </div>

          {data.categories.length === 0 ? (
            <p className="empty-state">No budget or spending data for this month.</p>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Budget</th>
                      <th>Spent</th>
                      <th>Remaining</th>
                      <th style={{ minWidth: '140px' }}>Utilization</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.categories.map(row => (
                      <tr key={row.category_id} className={row.remaining_amount < 0 ? 'over-budget' : ''}>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span className="swatch" style={{ background: row.category_color }} />
                            {row.category_name}
                          </div>
                        </td>
                        <td>₱{row.budget_amount.toFixed(2)}</td>
                        <td>₱{row.spent_amount.toFixed(2)}</td>
                        <td style={{
                          color: row.remaining_amount < 0 ? 'var(--danger)' : undefined,
                          fontWeight: row.remaining_amount < 0 ? 600 : undefined,
                        }}>
                          ₱{row.remaining_amount.toFixed(2)}
                        </td>
                        <td>
                          <div style={{ fontSize: '0.8rem', marginBottom: '4px', color: 'var(--text-muted)' }}>
                            {row.utilization_percent}%
                          </div>
                          <BudgetProgressBar spent={row.spent_amount} budget={row.budget_amount} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
