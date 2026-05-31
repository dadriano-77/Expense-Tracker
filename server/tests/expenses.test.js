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

  it('GET /api/expenses returns data array and total', async () => {
    const res = await request(app).get('/api/expenses');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('total');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

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
});
