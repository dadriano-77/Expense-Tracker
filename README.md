# Expenses Tracker

A full-stack personal finance tool for tracking expenses and monthly category budgets.

## Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React 18 + Vite 5                               |
| Backend    | Node.js + Express 4                             |
| Database   | SQLite via built-in `node:sqlite` (Node.js 22+) |
| Testing    | Jest + Supertest (backend) · Vitest + RTL (frontend) |
| Monorepo   | npm workspaces + concurrently                   |

## Architecture

```
┌──────────────────────────────────────┐
│  Browser  http://localhost:5173      │
│  React + Vite  (client/)             │
│  Pages → API modules → axios         │
└──────────────┬───────────────────────┘
               │ /api/*
               │ (Vite proxy in dev;
               │  Express serves build in prod)
               ▼
┌──────────────────────────────────────┐
│  Express  http://localhost:3001      │
│  Routes → Controllers                │
│  (server/src/)                       │
└──────────────┬───────────────────────┘
               │ better-sqlite3 (synchronous)
               ▼
┌──────────────────────────────────────┐
│  SQLite                              │
│  server/data/expenses.db             │
└──────────────────────────────────────┘
```

## Project Structure

```
expenses-tracker/
├── client/        React + Vite frontend
│   └── src/
│       ├── api/       Axios wrappers for each resource
│       ├── components/ Navbar, BudgetProgressBar
│       └── pages/     One file per route (inline forms)
└── server/        Node.js + Express backend
    └── src/
        ├── db/        SQLite singleton + schema DDL
        ├── routes/    Express routers
        └── controllers/ Request handlers (no DB calls yet)
```

## Setup

```bash
# 1. Install all workspace dependencies from the repo root
npm install

# 2. Start both servers in development mode
npm run dev
```

- Frontend: http://localhost:5173  
- Backend API: http://localhost:3001/api

> The Vite dev server proxies all `/api/*` requests to the Express server automatically.

## Available Scripts

Run these from the **repo root**:

| Script            | Description                                    |
|-------------------|------------------------------------------------|
| `npm run dev`     | Start Express + Vite concurrently              |
| `npm test`        | Run backend tests then frontend tests          |
| `npm run test:server` | Jest + Supertest (backend only)            |
| `npm run test:client` | Vitest + RTL (frontend only)               |

Run from **`server/`**:

| Script            | Description                                    |
|-------------------|------------------------------------------------|
| `npm run dev`     | Start Express with nodemon (auto-reload)       |
| `npm start`       | Start Express (production)                     |
| `npm test`        | Run Jest tests in-band                         |

Run from **`client/`**:

| Script            | Description                                    |
|-------------------|------------------------------------------------|
| `npm run dev`     | Start Vite dev server                          |
| `npm run build`   | Build for production into `dist/`              |
| `npm test`        | Run Vitest once                                |
| `npm run test:watch` | Vitest in watch mode                        |

## API Endpoints

| Resource   | Method | Path                  | Description              |
|------------|--------|-----------------------|--------------------------|
| Categories | GET    | /api/categories       | List all categories      |
|            | POST   | /api/categories       | Create category          |
|            | PUT    | /api/categories/:id   | Update category          |
|            | DELETE | /api/categories/:id   | Delete category          |
| Expenses   | GET    | /api/expenses         | List (filter by month)   |
|            | POST   | /api/expenses         | Create expense           |
|            | PUT    | /api/expenses/:id     | Update expense           |
|            | DELETE | /api/expenses/:id     | Delete expense           |
| Budgets    | GET    | /api/budgets          | List budgets for month   |
|            | PUT    | /api/budgets          | Upsert budget            |
|            | DELETE | /api/budgets/:id      | Delete budget            |
| Dashboard  | GET    | /api/dashboard        | Aggregated monthly summary |

## Database Schema

Three tables: `categories`, `expenses`, `budgets`.  
See `server/src/db/schema.sql` for full DDL.
