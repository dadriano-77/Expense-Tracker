import { useState, useEffect } from 'react';
import { getBudgets } from '../api/budgetsApi';

const now = new Date();

export default function BudgetsPage() {
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [budgets, setBudgets] = useState([]);

  useEffect(() => {
    getBudgets(year, month).then(setBudgets);
  }, [year, month]);

  return (
    <div>
      <h1>Budgets</h1>
      <p style={{ color: '#6b7280' }}>Set monthly category budgets — implementation coming soon.</p>
    </div>
  );
}
