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
  const [editId, setEditId] = useState(null);
  const [editAmount, setEditAmount] = useState('');
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

  function startEdit(b) {
    setEditId(b.id);
    setEditAmount(String(b.amount));
  }

  async function handleEditSave(b) {
    setError(null);
    try {
      await upsertBudget({ category_id: b.category_id, amount: Number(editAmount), year, month });
      setEditId(null);
      loadBudgets();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update budget');
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
      {error && <p className="error-msg">{error}</p>}

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

      <ul className="data-list" style={{ marginBottom: '1.5rem' }}>
        {budgets.map(b => (
          <li key={b.id} className="list-item">
            <span className="swatch" style={{ background: b.category_color }} />
            <span style={{ flex: 1 }}>{b.category_name}</span>
            {editId === b.id ? (
              <>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-input amount-input"
                  value={editAmount}
                  onChange={e => setEditAmount(e.target.value)}
                  aria-label="Edit amount"
                />
                <button type="button" className="btn btn-primary" onClick={() => handleEditSave(b)}>Save</button>
                <button type="button" className="btn btn-ghost" onClick={() => setEditId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <span style={{ fontWeight: 600 }}>₱{b.amount.toFixed(2)}</span>
                <button type="button" className="btn btn-ghost" onClick={() => startEdit(b)}>Edit</button>
                <button type="button" className="btn btn-danger" onClick={() => handleDelete(b.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
        {budgets.length === 0 && (
          <li className="empty-state">No budgets set for this month.</li>
        )}
      </ul>

      <div className="card">
        <h2>Set Budget</h2>
        <form onSubmit={handleUpsert}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              className="form-select"
              style={{ flex: 1, minWidth: '140px' }}
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
              className="form-input amount-input"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              placeholder="Amount"
              required
            />
            <button type="submit" className="btn btn-primary">Set</button>
          </div>
        </form>
      </div>
    </div>
  );
}
