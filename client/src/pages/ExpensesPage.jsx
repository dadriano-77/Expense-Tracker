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
      {error && <p className="error-msg">{error}</p>}

      <div className="filter-bar">
        <select name="year" className="form-select" value={filters.year} onChange={handleFilterChange}>
          <option value="">All years</option>
          {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select name="month" className="form-select" value={filters.month} onChange={handleFilterChange}>
          <option value="">All months</option>
          {['January','February','March','April','May','June','July','August','September','October','November','December']
            .map((label, i) => <option key={i + 1} value={i + 1}>{label}</option>)}
        </select>
        <select name="category_id" className="form-select" value={filters.category_id} onChange={handleFilterChange}>
          <option value="">All categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input
          name="q"
          type="text"
          className="form-input search-input"
          value={filters.q}
          onChange={handleFilterChange}
          placeholder="Search description"
        />
      </div>

      <div className="toolbar">
        <span className="toolbar-meta">
          {total} expense{total !== 1 ? 's' : ''} · ₱{totalAmount.toFixed(2)}
        </span>
        <button type="button" className="btn btn-ghost" onClick={handleExport}>Export CSV</button>
      </div>

      <div className="card">
        <h2>Add Expense</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '400px' }}>
            <select name="category_id" className="form-select" value={form.category_id} onChange={handleChange} required>
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
              className="form-input"
              value={form.amount}
              onChange={handleChange}
              placeholder="Amount"
              required
            />
            <input
              name="description"
              type="text"
              className="form-input"
              value={form.description}
              onChange={handleChange}
              placeholder="Description"
              required
            />
            <input
              name="date"
              type="date"
              className="form-input"
              value={form.date}
              onChange={handleChange}
              required
            />
            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Add</button>
          </div>
        </form>
      </div>

      <ul className="data-list">
        {expenses.map(exp => (
          <li key={exp.id} className="list-item" style={{ flexWrap: 'wrap' }}>
            {editId === exp.id ? (
              <form className="inline-edit" style={{ width: '100%' }} onSubmit={handleEditSubmit}>
                <select name="category_id" className="form-select" value={editForm.category_id} onChange={handleEditChange} required>
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
                  className="form-input amount-input"
                  value={editForm.amount}
                  onChange={handleEditChange}
                  placeholder="Amount"
                  required
                />
                <input
                  name="description"
                  type="text"
                  className="form-input"
                  style={{ flex: 1, minWidth: '120px' }}
                  value={editForm.description}
                  onChange={handleEditChange}
                  placeholder="Description"
                  required
                />
                <input
                  name="date"
                  type="date"
                  className="form-input"
                  value={editForm.date}
                  onChange={handleEditChange}
                  required
                />
                <button type="submit" className="btn btn-primary">Save</button>
                <button type="button" className="btn btn-ghost" onClick={() => setEditId(null)}>Cancel</button>
              </form>
            ) : (
              <>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{exp.date}</span>
                <span className="badge" style={{ background: exp.category_color }}>{exp.category_name}</span>
                <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>₱{exp.amount.toFixed(2)}</span>
                <span style={{ flex: 1, minWidth: '80px' }}>{exp.description}</span>
                <button type="button" className="btn btn-ghost" onClick={() => startEdit(exp)}>Edit</button>
                <button type="button" className="btn btn-danger" onClick={() => handleDelete(exp.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
        {expenses.length === 0 && (
          <li className="empty-state">No expenses found.</li>
        )}
      </ul>

      {Math.ceil(total / PAGE_SIZE) > 1 && (
        <div className="pagination">
          <button type="button" className="btn btn-ghost" onClick={() => goToPage(page - 1)} disabled={page === 1}>Previous</button>
          <span>Page {page} of {Math.ceil(total / PAGE_SIZE)}</span>
          <button type="button" className="btn btn-ghost" onClick={() => goToPage(page + 1)} disabled={page >= Math.ceil(total / PAGE_SIZE)}>Next</button>
        </div>
      )}
    </div>
  );
}
