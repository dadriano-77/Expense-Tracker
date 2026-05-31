jest.mock('../src/db/database', () => require('./setup'));
const db = require('./setup');
const request = require('supertest');
const app = require('../src/app');

describe('Budgets API', () => {
  let categoryId;

  beforeEach(() => {
    db.exec('DELETE FROM expenses');
    db.exec('DELETE FROM budgets');
    db.exec('DELETE FROM categories');
    db.exec("INSERT INTO categories (name, color) VALUES ('Food', '#ff0000')");
    categoryId = db.prepare("SELECT id FROM categories WHERE name = 'Food'").get().id;
  });

  it('GET /api/budgets returns an array', async () => {
    const res = await request(app).get('/api/budgets?year=2026&month=5');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/budgets returns 400 when year is missing', async () => {
    const res = await request(app).get('/api/budgets?month=5');
    expect(res.status).toBe(400);
  });

  it('GET /api/budgets returns 400 when month is missing', async () => {
    const res = await request(app).get('/api/budgets?year=2026');
    expect(res.status).toBe(400);
  });

  it('GET /api/budgets returns 400 for invalid month (0)', async () => {
    const res = await request(app).get('/api/budgets?year=2026&month=0');
    expect(res.status).toBe(400);
  });

  it('GET /api/budgets returns 400 for invalid month (13)', async () => {
    const res = await request(app).get('/api/budgets?year=2026&month=13');
    expect(res.status).toBe(400);
  });

  it('PUT /api/budgets creates a budget and returns 200 with category info', async () => {
    const res = await request(app).put('/api/budgets').send({
      category_id: categoryId,
      amount: 500,
      year: 2026,
      month: 5,
    });
    expect(res.status).toBe(200);
    expect(res.body.amount).toBe(500);
    expect(res.body.category_name).toBe('Food');
    expect(res.body.category_color).toBe('#ff0000');
  });

  it('PUT /api/budgets upserts (updates amount for existing budget)', async () => {
    await request(app).put('/api/budgets').send({ category_id: categoryId, amount: 300, year: 2026, month: 5 });
    const res = await request(app).put('/api/budgets').send({ category_id: categoryId, amount: 600, year: 2026, month: 5 });
    expect(res.status).toBe(200);
    expect(res.body.amount).toBe(600);
  });

  it('PUT /api/budgets allows amount of 0', async () => {
    const res = await request(app).put('/api/budgets').send({ category_id: categoryId, amount: 0, year: 2026, month: 5 });
    expect(res.status).toBe(200);
    expect(res.body.amount).toBe(0);
  });

  it('PUT /api/budgets returns 400 when required fields are missing', async () => {
    const res = await request(app).put('/api/budgets').send({ category_id: categoryId, year: 2026 });
    expect(res.status).toBe(400);
  });

  it('PUT /api/budgets returns 400 for negative amount', async () => {
    const res = await request(app).put('/api/budgets').send({ category_id: categoryId, amount: -1, year: 2026, month: 5 });
    expect(res.status).toBe(400);
  });

  it('PUT /api/budgets returns 400 for invalid month', async () => {
    const res = await request(app).put('/api/budgets').send({ category_id: categoryId, amount: 100, year: 2026, month: 13 });
    expect(res.status).toBe(400);
  });

  it('PUT /api/budgets returns 400 for non-existent category_id', async () => {
    const res = await request(app).put('/api/budgets').send({ category_id: 9999, amount: 100, year: 2026, month: 5 });
    expect(res.status).toBe(400);
  });

  it('DELETE /api/budgets/:id removes the budget and returns 204', async () => {
    const create = await request(app).put('/api/budgets').send({ category_id: categoryId, amount: 200, year: 2026, month: 5 });
    const res = await request(app).delete(`/api/budgets/${create.body.id}`);
    expect(res.status).toBe(204);
    const list = await request(app).get('/api/budgets?year=2026&month=5');
    expect(list.body).toHaveLength(0);
  });

  it('DELETE /api/budgets/:id returns 404 for non-existent id', async () => {
    const res = await request(app).delete('/api/budgets/9999');
    expect(res.status).toBe(404);
  });
});
