import { NavLink } from 'react-router-dom';

const linkStyle = ({ isActive }) => ({
  textDecoration: 'none',
  fontWeight: isActive ? 'bold' : 'normal',
  color: isActive ? '#4f46e5' : '#374151',
  padding: '0.25rem 0',
  borderBottom: isActive ? '2px solid #4f46e5' : '2px solid transparent',
});

export default function Navbar() {
  return (
    <nav style={{
      display: 'flex',
      gap: '1.5rem',
      padding: '1rem 1.5rem',
      borderBottom: '1px solid #e5e7eb',
      background: '#fff',
    }}>
      <NavLink to="/expenses" style={linkStyle}>Expenses</NavLink>
      <NavLink to="/categories" style={linkStyle}>Categories</NavLink>
      <NavLink to="/budgets" style={linkStyle}>Budgets</NavLink>
      <NavLink to="/dashboard" style={linkStyle}>Dashboard</NavLink>
    </nav>
  );
}
