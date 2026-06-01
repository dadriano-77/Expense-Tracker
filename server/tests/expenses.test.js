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

  // ── GET pagination & totals ───────────────────────────────────────────────

  it('GET /api/expenses returns total_amount', async () => {
    await request(app).post('/api/expenses').send({ category_id: categoryId, amount: 10.5, description: 'A', date: '2026-05-01' });
    await request(app).post('/api/expenses').send({ category_id: categoryId, amount: 5.5, description: 'B', date: '2026-05-01' });
    const res = await request(app).get('/api/expenses');
    expect(res.status).toBe(200);
    expect(res.body.total_amount).toBe(16);
  });

  it('GET /api/expenses?limit=2 respects limit and returns total', async () => {
    for (let i = 0; i < 3; i++) {
      await request(app).post('/api/expenses').send({ category_id: categoryId, amount: 10, description: `Item ${i}`, date: '2026-05-01' });
    }
    const res = await request(app).get('/api/expenses?limit=2');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.total).toBe(3);
    expect(res.body.limit).toBe(2);
    expect(res.body.page).toBe(1);
  });

  it('GET /api/expenses?page=2&limit=2 returns second page', async () => {
    for (let i = 0; i < 3; i++) {
      await request(app).post('/api/expenses').send({ category_id: categoryId, amount: 10, description: `Item ${i}`, date: '2026-05-01' });
    }
    const res = await request(app).get('/api/expenses?page=2&limit=2');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.total).toBe(3);
    expect(res.body.page).toBe(2);
  });

  // ── GET export ────────────────────────────────────────────────────────────

  it('GET /api/expenses/export returns CSV with correct headers', async () => {
    await request(app).post('/api/expenses').send({ category_id: categoryId, amount: 10, description: 'Lunch', date: '2026-05-01' });
    const res = await request(app).get('/api/expenses/export');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
    expect(res.text).toContain('Date,Category,Amount,Description');
    expect(res.text).toContain('Lunch');
    expect(res.text).toContain('Food');
  });

  it('GET /api/expenses/export filters by description query', async () => {
    await request(app).post('/api/expenses').send({ category_id: categoryId, amount: 10, description: 'Lunch', date: '2026-05-01' });
    await request(app).post('/api/expenses').send({ category_id: categoryId, amount: 5, description: 'Coffee', date: '2026-05-01' });
    const res = await request(app).get('/api/expenses/export?q=coffee');
    expect(res.text).toContain('Coffee');
    expect(res.text).not.toContain('Lunch');
  });

  // ── GET filters ──────────────────────────────────────────────────────────

  it('GET /api/expenses?year&month returns only expenses in that month', async () => {
    await request(app).post('/api/expenses').send({ category_id: categoryId, amount: 10, description: 'May expense', date: '2026-05-15' });
    await request(app).post('/api/expenses').send({ category_id: categoryId, amount: 20, description: 'June expense', date: '2026-06-01' });
    const res = await request(app).get('/api/expenses?year=2026&month=5');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].description).toBe('May expense');
  });

  it('GET /api/expenses?category_id returns only that category', async () => {
    db.exec("INSERT INTO categories (name, color) VALUES ('Transport', '#0000ff')");
    const transportId = db.prepare("SELECT id FROM categories WHERE name = 'Transport'").get().id;
    await request(app).post('/api/expenses').send({ category_id: categoryId, amount: 10, description: 'Food item', date: '2026-05-01' });
    await request(app).post('/api/expenses').send({ category_id: transportId, amount: 5, description: 'Bus fare', date: '2026-05-01' });
    const res = await request(app).get(`/api/expenses?category_id=${transportId}`);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].description).toBe('Bus fare');
  });

  it('GET /api/expenses?q returns only matching descriptions', async () => {
    await request(app).post('/api/expenses').send({ category_id: categoryId, amount: 10, description: 'Lunch at cafe', date: '2026-05-01' });
    await request(app).post('/api/expenses').send({ category_id: categoryId, amount: 5, description: 'Coffee', date: '2026-05-01' });
    const res = await request(app).get('/api/expenses?q=lunch');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].description).toBe('Lunch at cafe');
  });

  it('GET /api/expenses with combined filters returns intersection', async () => {
    db.exec("INSERT INTO categories (name, color) VALUES ('Transport', '#0000ff')");
    const transportId = db.prepare("SELECT id FROM categories WHERE name = 'Transport'").get().id;
    await request(app).post('/api/expenses').send({ category_id: categoryId, amount: 10, description: 'Lunch', date: '2026-05-01' });
    await request(app).post('/api/expenses').send({ category_id: transportId, amount: 5, description: 'Lunch bus', date: '2026-05-01' });
    await request(app).post('/api/expenses').send({ category_id: categoryId, amount: 8, description: 'Lunch', date: '2026-06-01' });
    const res = await request(app).get(`/api/expenses?year=2026&month=5&category_id=${categoryId}&q=Lunch`);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].description).toBe('Lunch');
    expect(res.body.data[0].category_id).toBe(categoryId);
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
