import { createContext, useContext, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { apiRequest } from './services/propertyService';

const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);
const getSavedUser = () => {
  try { return localStorage.getItem('ce_token') ? JSON.parse(localStorage.getItem('ce_user')) : null; }
  catch { return null; }
};

export function StoreProvider({ children }) {
  const [user, setUser] = useState(getSavedUser);
  const [ads] = useState([]); // Existing UI compatibility; property management now uses MongoDB.

  const saveSession = ({ token, user: account }) => {
    localStorage.setItem('ce_token', token);
    localStorage.setItem('ce_user', JSON.stringify(account));
    setUser(account);
    return account;
  };
  const login = async (email, password) => saveSession(await apiRequest('/api/auth/login', {
    method: 'POST', body: JSON.stringify({ email, password })
  }));
  const register = async details => saveSession(await apiRequest('/api/auth/register', {
    method: 'POST', body: JSON.stringify(details)
  }));
  const logout = () => {
    localStorage.removeItem('ce_user');
    localStorage.removeItem('ce_token');
    setUser(null);
  };
  return <Ctx.Provider value={{ user, ads, login, register, logout }}>{children}</Ctx.Provider>;
}

export function Guard({ roles, children }) {
  const { user } = useStore();
  const loc = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  if (roles && !roles.includes(user.role?.toUpperCase())) {
    return <div className="wrap"><p className="empty">Access denied: this section is not available for your account.</p></div>;
  }
  return children;
}
