jest.mock('../src/db/database', () => require('./setup'));
const db = require('./setup');
const request = require('supertest');
const app = require('../src/app');

describe('Dashboard API', () => {
  beforeEach(() => {
    db.exec('DELETE FROM expenses');
    db.exec('DELETE FROM budgets');
    db.exec('DELETE FROM categories');
  });

  it('GET /api/dashboard returns summary shape', async () => {
    const res = await request(app).get('/api/dashboard?year=2026&month=5');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('total_spent');
    expect(res.body).toHaveProperty('total_budget');
    expect(res.body).toHaveProperty('categories');
  });

  // TODO: add aggregation correctness tests after controllers are implemented
});
