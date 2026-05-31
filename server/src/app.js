const express = require('express');
const categoriesRouter = require('./routes/categories');
const expensesRouter = require('./routes/expenses');
const budgetsRouter = require('./routes/budgets');
const dashboardController = require('./controllers/dashboardController');

const app = express();
app.use(express.json());

app.use('/api/categories', categoriesRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/budgets', budgetsRouter);
app.get('/api/dashboard', dashboardController.getDashboard);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

module.exports = app;
