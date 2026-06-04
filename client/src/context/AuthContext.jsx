import { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('auth_token');
    const username = localStorage.getItem('auth_username');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return { token, username };
    }
    return null;
  });

  const login = useCallback((token, username) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_username', username);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser({ token, username });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_username');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
