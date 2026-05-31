jest.mock('../src/db/database', () => require('./setup'));
const db = require('./setup');
const request = require('supertest');
const app = require('../src/app');

describe('Dashboard API', () => {
  let categoryId;

  beforeEach(() => {
    db.exec('DELETE FROM expenses');
    db.exec('DELETE FROM budgets');
    db.exec('DELETE FROM categories');
    db.exec("INSERT INTO categories (name, color) VALUES ('Food', '#ff0000')");
    categoryId = db.prepare("SELECT id FROM categories WHERE name = 'Food'").get().id;
  });

  it('GET /api/dashboard returns summary shape', async () => {
    const res = await request(app).get('/api/dashboard?year=2026&month=5');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('total_spent');
    expect(res.body).toHaveProperty('total_budget');
    expect(res.body).toHaveProperty('categories');
  });

  it('GET /api/dashboard returns 400 when year is missing', async () => {
    const res = await request(app).get('/api/dashboard?month=5');
    expect(res.status).toBe(400);
  });

  it('GET /api/dashboard returns 400 when month is missing', async () => {
    const res = await request(app).get('/api/dashboard?year=2026');
    expect(res.status).toBe(400);
  });

  it('GET /api/dashboard returns 400 for invalid month (13)', async () => {
    const res = await request(app).get('/api/dashboard?year=2026&month=13');
    expect(res.status).toBe(400);
  });

  it('GET /api/dashboard returns empty categories and zero totals when no data', async () => {
    const res = await request(app).get('/api/dashboard?year=2026&month=5');
    expect(res.status).toBe(200);
    expect(res.body.categories).toHaveLength(0);
    expect(res.body.total_budget).toBe(0);
    expect(res.body.total_spent).toBe(0);
  });

  it('GET /api/dashboard includes category with budget but no expenses', async () => {
    db.prepare('INSERT INTO budgets (category_id, year, month, amount) VALUES (?, 2026, 5, 500)').run(categoryId);
    const res = await request(app).get('/api/dashboard?year=2026&month=5');
    expect(res.status).toBe(200);
    expect(res.body.categories).toHaveLength(1);
    const cat = res.body.categories[0];
    expect(cat.budget_amount).toBe(500);
    expect(cat.spent_amount).toBe(0);
    expect(cat.remaining_amount).toBe(500);
    expect(cat.utilization_percent).toBe(0);
  });

  it('GET /api/dashboard includes category with expenses but no budget', async () => {
    db.prepare("INSERT INTO expenses (category_id, amount, description, date) VALUES (?, 150, 'Lunch', '2026-05-10')").run(categoryId);
    const res = await request(app).get('/api/dashboard?year=2026&month=5');
    expect(res.status).toBe(200);
    expect(res.body.categories).toHaveLength(1);
    const cat = res.body.categories[0];
    expect(cat.budget_amount).toBe(0);
    expect(cat.spent_amount).toBe(150);
    expect(cat.remaining_amount).toBe(-150);
    expect(cat.utilization_percent).toBe(0);
  });

  it('GET /api/dashboard computes correct values with both budget and expenses', async () => {
    db.prepare('INSERT INTO budgets (category_id, year, month, amount) VALUES (?, 2026, 5, 400)').run(categoryId);
    db.prepare("INSERT INTO expenses (category_id, amount, description, date) VALUES (?, 100, 'A', '2026-05-01')").run(categoryId);
    db.prepare("INSERT INTO expenses (category_id, amount, description, date) VALUES (?, 50, 'B', '2026-05-15')").run(categoryId);
    const res = await request(app).get('/api/dashboard?year=2026&month=5');
    expect(res.status).toBe(200);
    const cat = res.body.categories[0];
    expect(cat.budget_amount).toBe(400);
    expect(cat.spent_amount).toBe(150);
    expect(cat.remaining_amount).toBe(250);
    expect(cat.utilization_percent).toBe(37.5);
  });

  it('GET /api/dashboard reflects over-budget correctly', async () => {
    db.prepare('INSERT INTO budgets (category_id, year, month, amount) VALUES (?, 2026, 5, 100)').run(categoryId);
    db.prepare("INSERT INTO expenses (category_id, amount, description, date) VALUES (?, 180, 'Big spend', '2026-05-20')").run(categoryId);
    const res = await request(app).get('/api/dashboard?year=2026&month=5');
    const cat = res.body.categories[0];
    expect(cat.remaining_amount).toBe(-80);
    expect(cat.utilization_percent).toBe(180);
  });

  it('GET /api/dashboard excludes category with no budget or expense in the queried month', async () => {
    // Expense in a different month — should not appear in May
    db.prepare("INSERT INTO expenses (category_id, amount, description, date) VALUES (?, 50, 'Old', '2026-04-10')").run(categoryId);
    const res = await request(app).get('/api/dashboard?year=2026&month=5');
    expect(res.body.categories).toHaveLength(0);
  });

  it('GET /api/dashboard totals match sum of category rows', async () => {
    db.exec("INSERT INTO categories (name, color) VALUES ('Transport', '#0000ff')");
    const transportId = db.prepare("SELECT id FROM categories WHERE name = 'Transport'").get().id;
    db.prepare('INSERT INTO budgets (category_id, year, month, amount) VALUES (?, 2026, 5, 300)').run(categoryId);
    db.prepare('INSERT INTO budgets (category_id, year, month, amount) VALUES (?, 2026, 5, 200)').run(transportId);
    db.prepare("INSERT INTO expenses (category_id, amount, description, date) VALUES (?, 100, 'A', '2026-05-01')").run(categoryId);
    db.prepare("INSERT INTO expenses (category_id, amount, description, date) VALUES (?, 50, 'B', '2026-05-01')").run(transportId);
    const res = await request(app).get('/api/dashboard?year=2026&month=5');
    const { categories, total_budget, total_spent } = res.body;
    expect(total_budget).toBe(categories.reduce((s, c) => s + c.budget_amount, 0));
    expect(total_spent).toBe(categories.reduce((s, c) => s + c.spent_amount, 0));
  });
});
