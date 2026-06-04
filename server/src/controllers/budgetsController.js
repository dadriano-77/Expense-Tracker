const db = require('../db/database');

exports.getAll = (req, res) => {
  const year = parseInt(req.query.year, 10);
  const month = parseInt(req.query.month, 10);

  if (!year || isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    return res.status(400).json({ error: 'year and month (1-12) are required' });
  }

  const rows = db.prepare(`
    SELECT b.*, c.name AS category_name, c.color AS category_color
    FROM budgets b
    JOIN categories c ON b.category_id = c.id
    WHERE b.year = ? AND b.month = ? AND b.user_id = ?
    ORDER BY c.name ASC
  `).all(year, month, req.user.id);

  res.json(rows);
};

exports.upsert = (req, res) => {
  const { category_id, amount, year, month } = req.body;

  if (!category_id || amount == null || !year || !month) {
    return res.status(400).json({ error: 'category_id, amount, year, and month are required' });
  }

  const parsedAmount = Number(amount);
  if (isNaN(parsedAmount) || parsedAmount < 0) {
    return res.status(400).json({ error: 'amount must be >= 0' });
  }

  const parsedMonth = parseInt(month, 10);
  const parsedYear = parseInt(year, 10);
  if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
    return res.status(400).json({ error: 'month must be between 1 and 12' });
  }
  if (isNaN(parsedYear)) {
    return res.status(400).json({ error: 'year must be a valid integer' });
  }

  const cat = db.prepare('SELECT id FROM categories WHERE id = ? AND user_id = ?').get(Number(category_id), req.user.id);
  if (!cat) return res.status(400).json({ error: 'category not found' });

  db.prepare(`
    INSERT INTO budgets (category_id, year, month, amount, user_id)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(category_id, year, month) DO UPDATE SET amount = excluded.amount
  `).run(Number(category_id), parsedYear, parsedMonth, parsedAmount, req.user.id);

  const row = db.prepare(`
    SELECT b.*, c.name AS category_name, c.color AS category_color
    FROM budgets b JOIN categories c ON b.category_id = c.id
    WHERE b.category_id = ? AND b.year = ? AND b.month = ?
  `).get(Number(category_id), parsedYear, parsedMonth);

  res.json(row);
};

exports.remove = (req, res) => {
  const id = Number(req.params.id);
  const row = db.prepare('SELECT id FROM budgets WHERE id = ? AND user_id = ?').get(id, req.user.id);
  if (!row) return res.status(404).json({ error: 'budget not found' });

  db.prepare('DELETE FROM budgets WHERE id = ? AND user_id = ?').run(id, req.user.id);
  res.sendStatus(204);
};
