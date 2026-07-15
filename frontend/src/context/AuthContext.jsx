import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on initial page mount/refresh
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
      } catch (err) {
        setUser(null); // No active cookie or validation failed
      } finally {
        setLoading(false);
      }
    };
    checkUserSession();
  }, []);

  // Handle User Registration request
  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    if (res.data && res.data.token) {
      localStorage.setItem('token', res.data.token);
    }
    setUser(res.data);
    return res.data;
  };

  // Handle User Login request
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data && res.data.token) {
      localStorage.setItem('token', res.data.token);
    }
    setUser(res.data);
    return res.data;
  };

  // Handle User Logout request
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout request failed', err);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook helper to consume auth states easily in any screen
export function useAuth() {
  return useContext(AuthContext);
}
