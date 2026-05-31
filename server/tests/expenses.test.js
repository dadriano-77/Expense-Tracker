jest.mock('../src/db/database', () => require('./setup'));
const db = require('./setup');
const request = require('supertest');
const app = require('../src/app');

describe('Expenses API', () => {
  let categoryId;

  beforeEach(() => {
    db.exec('DELETE FROM expenses');
    db.exec('DELETE FROM budgets');
    db.exec('DELETE FROM categories');
    db.exec("INSERT INTO categories (name, color) VALUES ('Food', '#ff0000')");
    categoryId = db.prepare("SELECT id FROM categories WHERE name = 'Food'").get().id;
  });

  // ── GET ──────────────────────────────────────────────────────────────────

  it('GET /api/expenses returns data array and total', async () => {
    const res = await request(app).get('/api/expenses');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('total');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // ── POST ─────────────────────────────────────────────────────────────────

  it('POST /api/expenses creates an expense and returns 201', async () => {
    const res = await request(app).post('/api/expenses').send({
      category_id: categoryId,
      amount: 42.5,
      description: 'Lunch',
      date: '2026-05-31',
    });
    expect(res.status).toBe(201);
    expect(res.body.category_id).toBe(categoryId);
    expect(res.body.amount).toBe(42.5);
    expect(res.body.description).toBe('Lunch');
    expect(res.body.date).toBe('2026-05-31');
  });

  it('GET /api/expenses after POST returns category_name and category_color', async () => {
    await request(app).post('/api/expenses').send({
      category_id: categoryId,
      amount: 10,
      description: 'Coffee',
      date: '2026-05-31',
    });
    const res = await request(app).get('/api/expenses');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].category_name).toBe('Food');
    expect(res.body.data[0].category_color).toBe('#ff0000');
  });

  it('POST /api/expenses returns 400 when description is missing', async () => {
    const res = await request(app).post('/api/expenses').send({
      category_id: categoryId,
      amount: 10,
      date: '2026-05-31',
    });
    expect(res.status).toBe(400);
  });

  it('POST /api/expenses returns 400 when date is missing', async () => {
    const res = await request(app).post('/api/expenses').send({
      category_id: categoryId,
      amount: 10,
      description: 'Lunch',
    });
    expect(res.status).toBe(400);
  });

  it('POST /api/expenses returns 400 when category_id is missing', async () => {
    const res = await request(app).post('/api/expenses').send({
      amount: 10,
      description: 'Lunch',
      date: '2026-05-31',
    });
    expect(res.status).toBe(400);
  });

  it('POST /api/expenses returns 400 when amount is 0', async () => {
    const res = await request(app).post('/api/expenses').send({
      category_id: categoryId,
      amount: 0,
      description: 'Lunch',
      date: '2026-05-31',
    });
    expect(res.status).toBe(400);
  });

  it('POST /api/expenses returns 400 when amount is negative', async () => {
    const res = await request(app).post('/api/expenses').send({
      category_id: categoryId,
      amount: -5,
      description: 'Lunch',
      date: '2026-05-31',
    });
    expect(res.status).toBe(400);
  });

  it('POST /api/expenses returns 400 when category_id does not exist', async () => {
    const res = await request(app).post('/api/expenses').send({
      category_id: 9999,
      amount: 10,
      description: 'Lunch',
      date: '2026-05-31',
    });
    expect(res.status).toBe(400);
  });

  // ── PUT ──────────────────────────────────────────────────────────────────

  it('PUT /api/expenses/:id updates the expense and returns 200', async () => {
    const create = await request(app).post('/api/expenses').send({
      category_id: categoryId,
      amount: 10,
      description: 'Lunch',
      date: '2026-05-31',
    });
    const res = await request(app).put(`/api/expenses/${create.body.id}`).send({
      category_id: categoryId,
      amount: 25,
      description: 'Dinner',
      date: '2026-06-01',
    });
    expect(res.status).toBe(200);
    expect(res.body.amount).toBe(25);
    expect(res.body.description).toBe('Dinner');
    expect(res.body.date).toBe('2026-06-01');
    expect(res.body.category_name).toBe('Food');
  });

  it('PUT /api/expenses/:id returns 404 for non-existent id', async () => {
    const res = await request(app).put('/api/expenses/9999').send({
      category_id: categoryId,
      amount: 10,
      description: 'Lunch',
      date: '2026-05-31',
    });
    expect(res.status).toBe(404);
  });

  it('PUT /api/expenses/:id returns 400 when description is missing', async () => {
    const create = await request(app).post('/api/expenses').send({ category_id: categoryId, amount: 10, description: 'X', date: '2026-05-31' });
    const res = await request(app).put(`/api/expenses/${create.body.id}`).send({ category_id: categoryId, amount: 10, date: '2026-05-31' });
    expect(res.status).toBe(400);
  });

  it('PUT /api/expenses/:id returns 400 when date is missing', async () => {
    const create = await request(app).post('/api/expenses').send({ category_id: categoryId, amount: 10, description: 'X', date: '2026-05-31' });
    const res = await request(app).put(`/api/expenses/${create.body.id}`).send({ category_id: categoryId, amount: 10, description: 'X' });
    expect(res.status).toBe(400);
  });

  it('PUT /api/expenses/:id returns 400 when category_id is missing', async () => {
    const create = await request(app).post('/api/expenses').send({ category_id: categoryId, amount: 10, description: 'X', date: '2026-05-31' });
    const res = await request(app).put(`/api/expenses/${create.body.id}`).send({ amount: 10, description: 'X', date: '2026-05-31' });
    expect(res.status).toBe(400);
  });

  it('PUT /api/expenses/:id returns 400 when amount is 0', async () => {
    const create = await request(app).post('/api/expenses').send({ category_id: categoryId, amount: 10, description: 'X', date: '2026-05-31' });
    const res = await request(app).put(`/api/expenses/${create.body.id}`).send({ category_id: categoryId, amount: 0, description: 'X', date: '2026-05-31' });
    expect(res.status).toBe(400);
  });

  it('PUT /api/expenses/:id returns 400 when amount is negative', async () => {
    const create = await request(app).post('/api/expenses').send({ category_id: categoryId, amount: 10, description: 'X', date: '2026-05-31' });
    const res = await request(app).put(`/api/expenses/${create.body.id}`).send({ category_id: categoryId, amount: -1, description: 'X', date: '2026-05-31' });
    expect(res.status).toBe(400);
  });

  it('PUT /api/expenses/:id returns 400 when category_id does not exist', async () => {
    const create = await request(app).post('/api/expenses').send({ category_id: categoryId, amount: 10, description: 'X', date: '2026-05-31' });
    const res = await request(app).put(`/api/expenses/${create.body.id}`).send({ category_id: 9999, amount: 10, description: 'X', date: '2026-05-31' });
    expect(res.status).toBe(400);
  });

  // ── DELETE ───────────────────────────────────────────────────────────────

  it('DELETE /api/expenses/:id removes the expense and returns 204', async () => {
    const create = await request(app).post('/api/expenses').send({
      category_id: categoryId,
      amount: 10,
      description: 'Lunch',
      date: '2026-05-31',
    });
    const res = await request(app).delete(`/api/expenses/${create.body.id}`);
    expect(res.status).toBe(204);
    const list = await request(app).get('/api/expenses');
    expect(list.body.total).toBe(0);
  });

  it('DELETE /api/expenses/:id returns 404 for non-existent id', async () => {
    const res = await request(app).delete('/api/expenses/9999');
    expect(res.status).toBe(404);
  });
});
