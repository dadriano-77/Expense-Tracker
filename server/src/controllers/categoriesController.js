const db = require('../db/database');

exports.getAll = (req, res) => {
  const rows = db.prepare('SELECT * FROM categories ORDER BY name ASC').all();
  res.json(rows);
};

exports.create = (req, res) => {
  const { name, color = '#6366f1' } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });

  const existing = db.prepare('SELECT id FROM categories WHERE name = ?').get(name);
  if (existing) return res.status(409).json({ error: 'Category name already exists' });

  const result = db.prepare(
    'INSERT INTO categories (name, color) VALUES (?, ?)'
  ).run(name, color);

  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(category);
};

exports.update = (req, res) => {
  const id = Number(req.params.id);
  const row = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  if (!row) return res.status(404).json({ error: 'category not found' });

  const { name, color = row.color } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });

  const conflict = db.prepare('SELECT id FROM categories WHERE name = ? AND id != ?').get(name, id);
  if (conflict) return res.status(409).json({ error: 'Category name already exists' });

  db.prepare('UPDATE categories SET name = ?, color = ? WHERE id = ?').run(name, color, id);
  res.json(db.prepare('SELECT * FROM categories WHERE id = ?').get(id));
};

exports.remove = (req, res) => {
  const id = Number(req.params.id);
  const row = db.prepare('SELECT id FROM categories WHERE id = ?').get(id);
  if (!row) return res.status(404).json({ error: 'category not found' });

  const { count } = db.prepare('SELECT COUNT(*) AS count FROM expenses WHERE category_id = ?').get(id);
  if (count > 0) return res.status(409).json({ error: 'Cannot delete category with linked expenses' });

  db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  res.sendStatus(204);
};
