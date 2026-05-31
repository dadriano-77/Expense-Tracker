import { useState, useEffect } from 'react';
import { getExpenses, createExpense } from '../api/expensesApi';
import { getCategories } from '../api/categoriesApi';

const emptyForm = { category_id: '', amount: '', description: '', date: '' };

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);

  function loadExpenses() {
    getExpenses().then(res => setExpenses(res.data));
  }

  useEffect(() => {
    loadExpenses();
    getCategories().then(setCategories);
  }, []);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      await createExpense({
        category_id: Number(form.category_id),
        amount: Number(form.amount),
        description: form.description,
        date: form.date,
      });
      setForm(emptyForm);
      loadExpenses();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add expense');
    }
  }

  return (
    <div>
      <h1>Expenses</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '0.75rem' }}>Add Expense</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '400px' }}>
          <select name="category_id" value={form.category_id} onChange={handleChange} required>
            <option value="">Select category</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            value={form.amount}
            onChange={handleChange}
            placeholder="Amount"
            required
          />
          <input
            name="description"
            type="text"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            required
          />
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            required
          />
          <button type="submit">Add</button>
          {error && <p style={{ color: '#dc2626', margin: 0 }}>{error}</p>}
        </div>
      </form>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {expenses.map(exp => (
          <li key={exp.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
            <span style={{ marginRight: '1rem', color: '#6b7280' }}>{exp.date}</span>
            <span
              style={{
                marginRight: '1rem',
                padding: '0.1rem 0.5rem',
                borderRadius: '9999px',
                background: exp.category_color,
                color: '#fff',
                fontSize: '0.85rem',
              }}
            >
              {exp.category_name}
            </span>
            <span style={{ marginRight: '1rem', fontWeight: 600 }}>${exp.amount.toFixed(2)}</span>
            <span>{exp.description}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
