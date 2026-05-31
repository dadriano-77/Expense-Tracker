jest.mock('../src/db/database', () => require('./setup'));
const db = require('./setup');
const request = require('supertest');
const app = require('../src/app');

describe('Budgets API', () => {
  beforeEach(() => {
    db.exec('DELETE FROM expenses');
    db.exec('DELETE FROM budgets');
    db.exec('DELETE FROM categories');
  });

  it('GET /api/budgets returns an array', async () => {
    const res = await request(app).get('/api/budgets?year=2026&month=5');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // TODO: add tests for upsert and DELETE after controllers are implemented
});
