import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ExpensesPage from './pages/ExpensesPage';
import CategoriesPage from './pages/CategoriesPage';
import BudgetsPage from './pages/BudgetsPage';
import DashboardPage from './pages/DashboardPage';
import ChartsPage from './pages/ChartsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/expenses" replace />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/budgets" element={<BudgetsPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/charts" element={<ChartsPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
