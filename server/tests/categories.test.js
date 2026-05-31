jest.mock('../src/db/database', () => require('./setup'));
const db = require('./setup');
const request = require('supertest');
const app = require('../src/app');

describe('Categories API', () => {
  beforeEach(() => {
    db.exec('DELETE FROM expenses');
    db.exec('DELETE FROM budgets');
    db.exec('DELETE FROM categories');
  });

  it('GET /api/categories returns an array', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/categories returns seeded categories', async () => {
    db.exec("INSERT INTO categories (name, color) VALUES ('Food', '#ff0000')");
    db.exec("INSERT INTO categories (name, color) VALUES ('Transport', '#00ff00')");
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body.map(c => c.name)).toContain('Food');
  });

  it('POST /api/categories creates a category and returns 201', async () => {
    const res = await request(app).post('/api/categories').send({ name: 'Food', color: '#ff0000' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Food');
    expect(res.body.color).toBe('#ff0000');
    expect(res.body.id).toBeDefined();
  });

  it('POST /api/categories uses default color when omitted', async () => {
    const res = await request(app).post('/api/categories').send({ name: 'Food' });
    expect(res.status).toBe(201);
    expect(res.body.color).toBe('#6366f1');
  });

  it('POST /api/categories returns 400 when name is missing', async () => {
    const res = await request(app).post('/api/categories').send({ color: '#ff0000' });
    expect(res.status).toBe(400);
  });

  it('POST /api/categories returns 409 for duplicate name (same case)', async () => {
    await request(app).post('/api/categories').send({ name: 'Food' });
    const res = await request(app).post('/api/categories').send({ name: 'Food' });
    expect(res.status).toBe(409);
  });

  it('POST /api/categories returns 409 for duplicate name (different case)', async () => {
    await request(app).post('/api/categories').send({ name: 'Food' });
    const res = await request(app).post('/api/categories').send({ name: 'food' });
    expect(res.status).toBe(409);
  });

  it('PUT /api/categories/:id updates name and color', async () => {
    const create = await request(app).post('/api/categories').send({ name: 'Food', color: '#ff0000' });
    const id = create.body.id;
    const res = await request(app).put(`/api/categories/${id}`).send({ name: 'Groceries', color: '#00ff00' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Groceries');
    expect(res.body.color).toBe('#00ff00');
  });

  it('PUT /api/categories/:id returns 400 when name is missing', async () => {
    const create = await request(app).post('/api/categories').send({ name: 'Food' });
    const res = await request(app).put(`/api/categories/${create.body.id}`).send({ color: '#ff0000' });
    expect(res.status).toBe(400);
  });

  it('PUT /api/categories/:id returns 404 for non-existent id', async () => {
    const res = await request(app).put('/api/categories/9999').send({ name: 'Ghost' });
    expect(res.status).toBe(404);
  });

  it('PUT /api/categories/:id returns 409 for duplicate name', async () => {
    await request(app).post('/api/categories').send({ name: 'Food' });
    const second = await request(app).post('/api/categories').send({ name: 'Transport' });
    const res = await request(app).put(`/api/categories/${second.body.id}`).send({ name: 'Food' });
    expect(res.status).toBe(409);
  });

  it('DELETE /api/categories/:id removes the category and returns 204', async () => {
    const create = await request(app).post('/api/categories').send({ name: 'Food' });
    const res = await request(app).delete(`/api/categories/${create.body.id}`);
    expect(res.status).toBe(204);
    const list = await request(app).get('/api/categories');
    expect(list.body).toHaveLength(0);
  });

  it('DELETE /api/categories/:id returns 409 when category has linked expenses', async () => {
    const cat = await request(app).post('/api/categories').send({ name: 'Food' });
    db.prepare(
      "INSERT INTO expenses (category_id, amount, description, date) VALUES (?, ?, ?, ?)"
    ).run(cat.body.id, 10, 'Lunch', '2026-05-31');
    const res = await request(app).delete(`/api/categories/${cat.body.id}`);
    expect(res.status).toBe(409);
  });

  it('DELETE /api/categories/:id returns 404 for non-existent id', async () => {
    const res = await request(app).delete('/api/categories/9999');
    expect(res.status).toBe(404);
  });
});
