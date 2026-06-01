const db = require('../db/database');

function buildWhere(query) {
  const { year, month, category_id, q } = query;
  const conditions = [];
  const params = [];

  if (year && month) {
    const parsedYear = Number(year);
    const parsedMonth = Number(month);
    if (!Number.isInteger(parsedYear) || !Number.isInteger(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
      return null;
    }
    conditions.push(`substr(e.date, 1, 7) = ?`);
    params.push(`${parsedYear}-${String(parsedMonth).padStart(2, '0')}`);
  }

  if (category_id) {
    conditions.push('e.category_id = ?');
    params.push(Number(category_id));
  }

  if (q) {
    conditions.push('e.description LIKE ?');
    params.push(`%${q}%`);
  }

  return { where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '', params };
}

exports.getAll = (req, res) => {
  const built = buildWhere(req.query);
  if (!built) return res.status(400).json({ error: 'invalid year or month' });
  const { where, params } = built;

  const { total, total_amount } = db.prepare(`
    SELECT COUNT(*) AS total, COALESCE(SUM(e.amount), 0) AS total_amount
    FROM expenses e
    JOIN categories c ON e.category_id = c.id
    ${where}
  `).get(...params);

  const parsedLimit = Math.max(1, Number(req.query.limit) || 20);
  const parsedPage = Math.max(1, Number(req.query.page) || 1);
  const offset = (parsedPage - 1) * parsedLimit;

  const rows = db.prepare(`
    SELECT e.*, c.name AS category_name, c.color AS category_color
    FROM expenses e
    JOIN categories c ON e.category_id = c.id
    ${where}
    ORDER BY e.date DESC, e.id DESC
    LIMIT ? OFFSET ?
  `).all(...params, parsedLimit, offset);

  res.json({ data: rows, total, total_amount, page: parsedPage, limit: parsedLimit });
};

exports.exportCsv = (req, res) => {
  const built = buildWhere(req.query);
  if (!built) return res.status(400).json({ error: 'invalid year or month' });
  const { where, params } = built;

  const rows = db.prepare(`
    SELECT e.*, c.name AS category_name, c.color AS category_color
    FROM expenses e
    JOIN categories c ON e.category_id = c.id
    ${where}
    ORDER BY e.date DESC, e.id DESC
  `).all(...params);

  function csvField(v) {
    const s = String(v ?? '');
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  }

  const header = 'Date,Category,Amount,Description\n';
  const lines = rows.map(r =>
    [csvField(r.date), csvField(r.category_name), r.amount, csvField(r.description)].join(',')
  ).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=expenses.csv');
  res.send(header + lines);
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

exports.update = (req, res) => {
  const id = Number(req.params.id);
  const row = db.prepare('SELECT id FROM expenses WHERE id = ?').get(id);
  if (!row) return res.status(404).json({ error: 'expense not found' });

  const { category_id, amount, description, date } = req.body;
  if (!category_id || amount == null || !description || !date) {
    return res.status(400).json({ error: 'category_id, amount, description, and date are required' });
  }

  const parsedAmount = Number(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number' });
  }

  const cat = db.prepare('SELECT id FROM categories WHERE id = ?').get(Number(category_id));
  if (!cat) return res.status(400).json({ error: 'category not found' });

  db.prepare(
    "UPDATE expenses SET category_id = ?, amount = ?, description = ?, date = ?, updated_at = datetime('now') WHERE id = ?"
  ).run(Number(category_id), parsedAmount, description, date, id);

  const expense = db.prepare(`
    SELECT e.*, c.name AS category_name, c.color AS category_color
    FROM expenses e JOIN categories c ON e.category_id = c.id
    WHERE e.id = ?
  `).get(id);
  res.json(expense);
};

exports.remove = (req, res) => {
  const id = Number(req.params.id);
  const row = db.prepare('SELECT id FROM expenses WHERE id = ?').get(id);
  if (!row) return res.status(404).json({ error: 'expense not found' });

  db.prepare('DELETE FROM expenses WHERE id = ?').run(id);
  res.sendStatus(204);
};
