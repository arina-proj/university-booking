import { createContext, useContext, useEffect, useState } from 'react';
import { api, setToken, getToken } from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem('booking_user');
    if (raw && getToken()) setUser(JSON.parse(raw));
    setLoading(false);
  }, []);

  const persist = (token, user) => {
    setToken(token);
    localStorage.setItem('booking_user', JSON.stringify(user));
    setUser(user);
  };

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    persist(data.token, data.user);
  };
  const register = async (email, name, password) => {
    const data = await api.register({ email, name, password });
    persist(data.token, data.user);
  };
  const logout = () => {
    setToken(null);
    localStorage.removeItem('booking_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);