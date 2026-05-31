const db = require('../db/database');

exports.getAll = (req, res) => {
  const rows = db.prepare(`
    SELECT e.*, c.name AS category_name, c.color AS category_color
    FROM expenses e
    JOIN categories c ON e.category_id = c.id
    ORDER BY e.date DESC, e.id DESC
  `).all();
  res.json({ data: rows, total: rows.length });
};

exports.getOne = (req, res) => {
  const row = db.prepare(`
    SELECT e.*, c.name AS category_name, c.color AS category_color
    FROM expenses e
    JOIN categories c ON e.category_id = c.id
    WHERE e.id = ?
  `).get(Number(req.params.id));
  if (!row) return res.status(404).json({ error: 'expense not found' });
  res.json(row);
};

exports.create = (req, res) => {
  const { category_id, amount, description, date } = req.body;

  if (!category_id || amount == null || !description || !date) {
    return res.status(400).json({ error: 'category_id, amount, description, and date are required' });
  }

  const parsedAmount = Number(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number' });
  }

  const cat = db.prepare('SELECT id FROM categories WHERE id = ?').get(Number(category_id));
  if (!cat) {
    return res.status(400).json({ error: 'category not found' });
  }

  const result = db.prepare(
    'INSERT INTO expenses (category_id, amount, description, date) VALUES (?, ?, ?, ?)'
  ).run(Number(category_id), parsedAmount, description, date);

  const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(expense);
};

exports.update = (req, res) => res.json({});
exports.remove = (req, res) => res.sendStatus(204);
