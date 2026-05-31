import { useState, useEffect } from 'react';
import { getBudgets, upsertBudget, deleteBudget } from '../api/budgetsApi';
import { getCategories } from '../api/categoriesApi';

const now = new Date();
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function BudgetsPage() {
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ category_id: '', amount: '' });
  const [error, setError] = useState(null);

  function loadBudgets() {
    getBudgets(year, month).then(setBudgets);
  }

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    loadBudgets();
  }, [year, month]);

  async function handleUpsert(e) {
    e.preventDefault();
    setError(null);
    try {
      await upsertBudget({
        category_id: Number(form.category_id),
        amount: Number(form.amount),
        year,
        month,
      });
      setForm({ category_id: '', amount: '' });
      loadBudgets();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to set budget');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this budget?')) return;
    setError(null);
    try {
      await deleteBudget(id);
      loadBudgets();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete budget');
    }
  }

  return (
    <div>
      <h1>Budgets</h1>
      {error && <p style={{ color: '#dc2626' }}>{error}</p>}

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

      <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem' }}>
        {budgets.map(b => (
          <li key={b.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span
              style={{
                display: 'inline-block',
                width: '16px',
                height: '16px',
                borderRadius: '3px',
                background: b.category_color,
                flexShrink: 0,
              }}
            />
            <span style={{ flex: 1 }}>{b.category_name}</span>
            <span style={{ fontWeight: 600 }}>${b.amount.toFixed(2)}</span>
            <button type="button" onClick={() => handleDelete(b.id)}>Delete</button>
          </li>
        ))}
        {budgets.length === 0 && (
          <li style={{ color: '#6b7280' }}>No budgets set for this month.</li>
        )}
      </ul>

      <form onSubmit={handleUpsert}>
        <h2 style={{ marginBottom: '0.75rem' }}>Set Budget</h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={form.category_id}
            onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
            required
          >
            <option value="">Select category</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
            placeholder="Amount"
            required
          />
          <button type="submit">Set</button>
        </div>
      </form>
    </div>
  );
}
