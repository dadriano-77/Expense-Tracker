const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../../data/expenses.db');
const dataDir = path.dirname(dbPath);

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new DatabaseSync(dbPath);
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

// Add user_id to existing tables if not already present
const migrations = [
  'ALTER TABLE categories ADD COLUMN user_id INTEGER NOT NULL DEFAULT 0',
  'ALTER TABLE expenses ADD COLUMN user_id INTEGER NOT NULL DEFAULT 0',
  'ALTER TABLE budgets ADD COLUMN user_id INTEGER NOT NULL DEFAULT 0',
];
for (const sql of migrations) {
  try { db.exec(sql); } catch { /* column already exists */ }
}

module.exports = db;
