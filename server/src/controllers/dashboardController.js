const db = require('../db/database');

exports.getDashboard = (req, res) => {
  const parsedYear = parseInt(req.query.year, 10);
  const parsedMonth = parseInt(req.query.month, 10);

  if (isNaN(parsedYear) || isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
    return res.status(400).json({ error: 'year and month (1-12) are required' });
  }

  const datePrefix = `${parsedYear}-${String(parsedMonth).padStart(2, '0')}`;
  const userId = req.user.id;

  const rows = db.prepare(`
    SELECT
      c.id    AS category_id,
      c.name  AS category_name,
      c.color AS category_color,
      COALESCE(b.amount, 0)                               AS budget_amount,
      COALESCE(SUM(e.amount), 0)                          AS spent_amount,
      COALESCE(b.amount, 0) - COALESCE(SUM(e.amount), 0) AS remaining_amount,
      CASE
        WHEN COALESCE(b.amount, 0) > 0
        THEN ROUND(COALESCE(SUM(e.amount), 0) / COALESCE(b.amount, 0) * 100, 1)
        ELSE 0
      END AS utilization_percent
    FROM categories c
    LEFT JOIN budgets b
      ON b.category_id = c.id AND b.year = ? AND b.month = ? AND b.user_id = ?
    LEFT JOIN expenses e
      ON e.category_id = c.id AND substr(e.date, 1, 7) = ? AND e.user_id = ?
    WHERE c.user_id = ?
    GROUP BY c.id, c.name, c.color, b.amount
    HAVING b.id IS NOT NULL OR COALESCE(SUM(e.amount), 0) > 0
    ORDER BY c.name ASC
  `).all(parsedYear, parsedMonth, userId, datePrefix, userId, userId);

  const total_budget = rows.reduce((s, r) => s + r.budget_amount, 0);
  const total_spent  = rows.reduce((s, r) => s + r.spent_amount, 0);

  res.json({ year: parsedYear, month: parsedMonth, total_budget, total_spent, categories: rows });
};
