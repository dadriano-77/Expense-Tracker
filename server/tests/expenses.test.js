jest.mock('../src/db/database', () => require('./setup'));
const db = require('./setup');
const request = require('supertest');
const app = require('../src/app');

describe('Expenses API', () => {
  beforeEach(() => {
    db.exec('DELETE FROM expenses');
    db.exec('DELETE FROM budgets');
    db.exec('DELETE FROM categories');
  });

  it('GET /api/expenses returns data array and total', async () => {
    const res = await request(app).get('/api/expenses');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('total');
  });

  // TODO: add tests for POST, PUT, DELETE after controllers are implemented
});
