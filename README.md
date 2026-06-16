# Expense Ledger

A full-stack personal finance tool for tracking expenses, setting monthly category budgets, and visualizing spending.

## Features

- **Expenses** — add, edit, delete, filter by month/category/keyword, paginate, export to CSV
- **Categories** — create and manage color-coded spending categories
- **Budgets** — set monthly budgets per category with inline editing
- **Dashboard** — monthly summary with per-category budget utilization progress bars
- **Charts** — spending-by-category pie chart and budget-vs-actual bar chart
- **Dark mode** — persists via `localStorage`, respects system preference on first load
- **Responsive** — mobile-friendly layout with collapsible hamburger nav()

## Tech Stack

| Layer    | Technology                                           |
| -------- | ---------------------------------------------------- |
| Frontend | React 18 + Vite 5 + Recharts                         |
| Backend  | Node.js + Express 4                                  |
| Database | SQLite via built-in `node:sqlite` (Node.js 22+)      |
| Testing  | Jest + Supertest (backend) · Vitest + RTL (frontend) |
| Monorepo | npm workspaces + concurrently                        |

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
               │ node:sqlite (synchronous)
               ▼
┌──────────────────────────────────────┐
│  SQLite                              │
│  server/data/expenses.db             │
└──────────────────────────────────────┘
```

## Project Structure

```
expense-ledger/
├── client/        React + Vite frontend
│   └── src/
│       ├── api/        Axios wrappers for each resource
│       ├── components/ Navbar, BudgetProgressBar
│       ├── pages/      One file per route
│       └── index.css   Design system (CSS variables, dark mode)
└── server/        Node.js + Express backend
    └── src/
        ├── db/          SQLite singleton + schema DDL
        ├── routes/      Express routers
        └── controllers/ Request handlers
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

| Script                | Description                           |
| --------------------- | ------------------------------------- |
| `npm run dev`         | Start Express + Vite concurrently     |
| `npm test`            | Run backend tests then frontend tests |
| `npm run test:server` | Jest + Supertest (backend only)       |
| `npm run test:client` | Vitest + RTL (frontend only)          |

Run from **`server/`**:

| Script        | Description                              |
| ------------- | ---------------------------------------- |
| `npm run dev` | Start Express with nodemon (auto-reload) |
| `npm start`   | Start Express (production)               |
| `npm test`    | Run Jest tests in-band                   |

Run from **`client/`**:

| Script               | Description                     |
| -------------------- | ------------------------------- |
| `npm run dev`        | Start Vite dev server           |
| `npm run build`      | Build for production into dist/ |
| `npm test`           | Run Vitest once                 |
| `npm run test:watch` | Vitest in watch mode            |

## API Endpoints

| Resource   | Method | Path                 | Description                           |
| ---------- | ------ | -------------------- | ------------------------------------- |
| Categories | GET    | /api/categories      | List all categories                   |
|            | POST   | /api/categories      | Create category                       |
|            | PUT    | /api/categories/:id  | Update category                       |
|            | DELETE | /api/categories/:id  | Delete category                       |
| Expenses   | GET    | /api/expenses        | List with filters, pagination, totals |
|            | POST   | /api/expenses        | Create expense                        |
|            | PUT    | /api/expenses/:id    | Update expense                        |
|            | DELETE | /api/expenses/:id    | Delete expense                        |
|            | GET    | /api/expenses/export | Export filtered expenses as CSV       |
| Budgets    | GET    | /api/budgets         | List budgets for a month              |
|            | PUT    | /api/budgets         | Upsert budget (create or update)      |
|            | DELETE | /api/budgets/:id     | Delete budget                         |
| Dashboard  | GET    | /api/dashboard       | Aggregated monthly summary            |

## Database Schema

Three tables: `categories`, `expenses`, `budgets`.  
See `server/src/db/schema.sql` for full DDL.
