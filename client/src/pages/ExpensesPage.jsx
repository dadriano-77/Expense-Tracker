import { useState, useEffect } from 'react';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../api/expensesApi';
import { getCategories } from '../api/categoriesApi';

const emptyForm = { category_id: '', amount: '', description: '', date: new Date().toISOString().slice(0, 10) };
const PAGE_SIZE = 20;

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ year: '', month: '', category_id: '', q: '' });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  function loadExpenses(activeFilters, activePage) {
    const params = {};
    const f = activeFilters ?? filters;
    const p = activePage ?? page;
    if (f.year && f.month) { params.year = f.year; params.month = f.month; }
    if (f.category_id) params.category_id = f.category_id;
    if (f.q) params.q = f.q;
    params.page = p;
    params.limit = PAGE_SIZE;
    getExpenses(params).then(res => {
      setExpenses(res.data);
      setTotal(res.total ?? 0);
      setTotalAmount(res.total_amount ?? 0);
    });
  }

  useEffect(() => {
    loadExpenses();
    getCategories().then(setCategories);
  }, []);

  function handleFilterChange(e) {
    const next = { ...filters, [e.target.name]: e.target.value };
    setFilters(next);
    setPage(1);
    loadExpenses(next, 1);
  }

  function goToPage(newPage) {
    setPage(newPage);
    loadExpenses(filters, newPage);
  }

  function handleExport() {
    const params = new URLSearchParams();
    if (filters.year && filters.month) {
      params.set('year', filters.year);
      params.set('month', filters.month);
    }
    if (filters.category_id) params.set('category_id', filters.category_id);
    if (filters.q) params.set('q', filters.q);
    window.location.href = `/api/expenses/export?${params}`;
  }

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

  function startEdit(exp) {
    setEditId(exp.id);
    setEditForm({
      category_id: String(exp.category_id),
      amount: String(exp.amount),
      description: exp.description,
      date: exp.date,
    });
  }

  function handleEditChange(e) {
    setEditForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      await updateExpense(editId, {
        category_id: Number(editForm.category_id),
        amount: Number(editForm.amount),
        description: editForm.description,
        date: editForm.date,
      });
      setEditId(null);
      loadExpenses();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update expense');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this expense?')) return;
    setError(null);
    try {
      await deleteExpense(id);
      loadExpenses();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete expense');
    }
  }

  return (
    <div>
      <h1>Expenses</h1>
      {error && <p style={{ color: '#dc2626' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center' }}>
        <select name="year" value={filters.year} onChange={handleFilterChange}>
          <option value="">All years</option>
          {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select name="month" value={filters.month} onChange={handleFilterChange}>
          <option value="">All months</option>
          {['January','February','March','April','May','June','July','August','September','October','November','December']
            .map((label, i) => <option key={i + 1} value={i + 1}>{label}</option>)}
        </select>
        <select name="category_id" value={filters.category_id} onChange={handleFilterChange}>
          <option value="">All categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input
          name="q"
          type="text"
          value={filters.q}
          onChange={handleFilterChange}
          placeholder="Search description"
          style={{ minWidth: '160px' }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>
          {total} expense{total !== 1 ? 's' : ''} · ₱{totalAmount.toFixed(2)}
        </span>
        <button type="button" onClick={handleExport}>Export CSV</button>
      </div>

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
        </div>
      </form>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {expenses.map(exp => (
          <li key={exp.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
            {editId === exp.id ? (
              <form onSubmit={handleEditSubmit} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <select name="category_id" value={editForm.category_id} onChange={handleEditChange} required>
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
                  value={editForm.amount}
                  onChange={handleEditChange}
                  placeholder="Amount"
                  required
                />
                <input
                  name="description"
                  type="text"
                  value={editForm.description}
                  onChange={handleEditChange}
                  placeholder="Description"
                  required
                />
                <input
                  name="date"
                  type="date"
                  value={editForm.date}
                  onChange={handleEditChange}
                  required
                />
                <button type="submit">Save</button>
                <button type="button" onClick={() => setEditId(null)}>Cancel</button>
              </form>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ color: '#6b7280' }}>{exp.date}</span>
                <span
                  style={{
                    padding: '0.1rem 0.5rem',
                    borderRadius: '9999px',
                    background: exp.category_color,
                    color: '#fff',
                    fontSize: '0.85rem',
                  }}
                >
                  {exp.category_name}
                </span>
                <span style={{ fontWeight: 600 }}>₱{exp.amount.toFixed(2)}</span>
                <span style={{ flex: 1 }}>{exp.description}</span>
                <button type="button" onClick={() => startEdit(exp)}>Edit</button>
                <button type="button" onClick={() => handleDelete(exp.id)}>Delete</button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {Math.ceil(total / PAGE_SIZE) > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '1rem 0' }}>
          <button type="button" onClick={() => goToPage(page - 1)} disabled={page === 1}>Previous</button>
          <span>Page {page} of {Math.ceil(total / PAGE_SIZE)}</span>
          <button type="button" onClick={() => goToPage(page + 1)} disabled={page >= Math.ceil(total / PAGE_SIZE)}>Next</button>
        </div>
      )}
    </div>
  );
}
