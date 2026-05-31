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
      {error && <p style={{ color: '#dc2626' }}>{error}</p>}

      <form onSubmit={handleAdd} style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '0.75rem' }}>Add Category</h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Name"
            required
          />
          <input
            type="color"
            value={form.color}
            onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
          />
          <button type="submit">Add</button>
        </div>
      </form>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {categories.map(cat => (
          <li key={cat.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
            {editId === cat.id ? (
              <form onSubmit={handleEdit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
                <input
                  type="color"
                  value={editForm.color}
                  onChange={e => setEditForm(f => ({ ...f, color: e.target.value }))}
                />
                <button type="submit">Save</button>
                <button type="button" onClick={() => setEditId(null)}>Cancel</button>
              </form>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: '16px',
                    height: '16px',
                    borderRadius: '3px',
                    background: cat.color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ flex: 1 }}>{cat.name}</span>
                <button type="button" onClick={() => startEdit(cat)}>Edit</button>
                <button type="button" onClick={() => handleDelete(cat.id)}>Delete</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
