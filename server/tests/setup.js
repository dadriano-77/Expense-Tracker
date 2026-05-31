const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

// Shared in-memory SQLite database for backend tests.
// Each test file injects this via:
//   jest.mock('../src/db/database', () => require('./setup'));
const db = new DatabaseSync(':memory:');
const schema = fs.readFileSync(
  path.join(__dirname, '../src/db/schema.sql'),
  'utf8'
);
db.exec(schema);

module.exports = db;
