import { useState, useEffect } from 'react';
import { getExpenses } from '../api/expensesApi';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    getExpenses().then(res => setExpenses(res.data));
  }, []);

  return (
    <div>
      <h1>Expenses</h1>
      <p style={{ color: '#6b7280' }}>Add, edit, and delete expenses — implementation coming soon.</p>
    </div>
  );
}
