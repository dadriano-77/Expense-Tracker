import { useState, useEffect } from 'react';
import { getCategories } from '../api/categoriesApi';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  return (
    <div>
      <h1>Categories</h1>
      <p style={{ color: '#6b7280' }}>Manage expense categories — implementation coming soon.</p>
    </div>
  );
}
