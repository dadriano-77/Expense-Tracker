import { useState, useEffect } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/categoriesApi';

const emptyForm = { name: '', color: '#6366f1' };

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', color: '' });
  const [error, setError] = useState(null);

  function loadCategories() {
    getCategories().then(setCategories);
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setError(null);
    try {
      await createCategory(form);
      setForm(emptyForm);
      loadCategories();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add category');
    }
  }

  function startEdit(cat) {
    setEditId(cat.id);
    setEditForm({ name: cat.name, color: cat.color });
  }

  async function handleEdit(e) {
    e.preventDefault();
    setError(null);
    try {
      await updateCategory(editId, editForm);
      setEditId(null);
      loadCategories();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update category');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this category?')) return;
    setError(null);
    try {
      await deleteCategory(id);
      loadCategories();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete category');
    }
  }

  return (
    <div>
      <h1>Categories</h1>
      {error && <p className="error-msg">{error}</p>}

      <div className="card">
        <h2>Add Category</h2>
        <form onSubmit={handleAdd}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="form-input"
              style={{ flex: 1, minWidth: '140px' }}
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Name"
              required
            />
            <input
              type="color"
              value={form.color}
              onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
              style={{ width: '42px', height: '38px', padding: '2px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: 'var(--surface)' }}
            />
            <button type="submit" className="btn btn-primary">Add</button>
          </div>
        </form>
      </div>

      <ul className="data-list">
        {categories.map(cat => (
          <li key={cat.id} className="list-item">
            {editId === cat.id ? (
              <form className="inline-edit" style={{ width: '100%' }} onSubmit={handleEdit}>
                <input
                  type="text"
                  className="form-input"
                  style={{ flex: 1, minWidth: '140px' }}
                  value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
                <input
                  type="color"
                  value={editForm.color}
                  onChange={e => setEditForm(f => ({ ...f, color: e.target.value }))}
                  style={{ width: '42px', height: '38px', padding: '2px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: 'var(--surface)' }}
                />
                <button type="submit" className="btn btn-primary">Save</button>
                <button type="button" className="btn btn-ghost" onClick={() => setEditId(null)}>Cancel</button>
              </form>
            ) : (
              <>
                <span className="swatch" style={{ background: cat.color }} />
                <span style={{ flex: 1 }}>{cat.name}</span>
                <button type="button" className="btn btn-ghost" onClick={() => startEdit(cat)}>Edit</button>
                <button type="button" className="btn btn-danger" onClick={() => handleDelete(cat.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
        {categories.length === 0 && (
          <li className="empty-state">No categories yet.</li>
        )}
      </ul>
    </div>
  );
}
