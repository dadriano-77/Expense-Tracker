PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS categories (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL UNIQUE COLLATE NOCASE,
  color      TEXT    NOT NULL DEFAULT '#6366f1',
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS expenses (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  amount      REAL    NOT NULL CHECK(amount > 0),
  description TEXT    NOT NULL,
  date        TEXT    NOT NULL,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS budgets (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  year        INTEGER NOT NULL CHECK(year BETWEEN 2000 AND 2100),
  month       INTEGER NOT NULL CHECK(month BETWEEN 1 AND 12),
  amount      REAL    NOT NULL CHECK(amount >= 0),
  UNIQUE(category_id, year, month)
);
