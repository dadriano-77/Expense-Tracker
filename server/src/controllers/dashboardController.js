// TODO: implement aggregation query with db = require('../db/database')
exports.getDashboard = (req, res) =>
  res.json({ year: req.query.year, month: req.query.month, total_spent: 0, total_budget: 0, categories: [] });
