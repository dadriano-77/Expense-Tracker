import { useState, useEffect } from 'react';
import axios from 'axios';
import BudgetProgressBar from '../components/BudgetProgressBar';

const now = new Date();

export default function DashboardPage() {
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get('/api/dashboard', { params: { year, month } })
      .then(r => setData(r.data));
  }, [year, month]);

  return (
    <div>
      <h1>Dashboard</h1>
      <p style={{ color: '#6b7280' }}>Monthly budget summary — implementation coming soon.</p>
    </div>
  );
}
