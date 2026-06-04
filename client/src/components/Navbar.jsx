import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

const NAV_LINKS = [
  { to: '/expenses', label: 'Expenses' },
  { to: '/categories', label: 'Categories' },
  { to: '/budgets', label: 'Budgets' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/charts', label: 'Charts' },
];

export default function Navbar() {
  const [dark, setDark] = useState(
    () => document.documentElement.getAttribute('data-theme') === 'dark'
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <Link to="/expenses" className="navbar-brand">Expense Ledger</Link>

      <div className={`navbar-links${menuOpen ? ' open' : ''}`}>
        {NAV_LINKS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            {label}
          </NavLink>
        ))}
      </div>

      <div className="navbar-user">
        <span className="navbar-username">{user?.username}</span>
        <button type="button" className="btn btn-ghost navbar-logout" onClick={handleLogout}>
          Log out
        </button>
      </div>

      <button
        type="button"
        className="theme-toggle"
        onClick={() => setDark(d => !d)}
        aria-label="Toggle dark mode"
      >
        {dark ? <SunIcon /> : <MoonIcon />}
      </button>

      <button
        type="button"
        className="hamburger"
        onClick={() => setMenuOpen(o => !o)}
        aria-label="Toggle menu"
      >
        <span />
        <span />
        <span />
      </button>
    </nav>
  );
}
