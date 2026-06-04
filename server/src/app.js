const express = require('express');
const categoriesRouter = require('./routes/categories');
const expensesRouter = require('./routes/expenses');
const budgetsRouter = require('./routes/budgets');
const authRouter = require('./routes/auth');
const dashboardController = require('./controllers/dashboardController');
const authMiddleware = require('./middleware/auth');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRouter);

app.use('/api/categories', authMiddleware, categoriesRouter);
app.use('/api/expenses', authMiddleware, expensesRouter);
app.use('/api/budgets', authMiddleware, budgetsRouter);
app.get('/api/dashboard', authMiddleware, dashboardController.getDashboard);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

module.exports = app;
