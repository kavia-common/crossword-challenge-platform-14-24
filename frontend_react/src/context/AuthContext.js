import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { getMe, login as apiLogin, logout as apiLogout } from '../api';

// PUBLIC_INTERFACE
export const AuthContext = createContext({
  user: null,
  isAdmin: false,
  token: null,
  login: async () => {},
  logout: async () => {},
  loading: false,
  error: null,
});

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /**
   * Provides authentication state and actions to the app.
   */
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(!!token);
  const [error, setError] = useState(null);

  const bootstrap = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const me = await getMe();
      setUser(me);
    } catch (e) {
      console.warn('Auth bootstrap failed', e);
      localStorage.removeItem('authToken');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = useCallback(async (username, password) => {
    setError(null);
    try {
      const data = await apiLogin(username, password);
      const receivedToken = data.token;
      if (receivedToken) {
        localStorage.setItem('authToken', receivedToken);
        setToken(receivedToken);
      }
      if (data.user) {
        setUser(data.user);
      } else {
        const me = await getMe();
        setUser(me);
      }
      return true;
    } catch (e) {
      setError(e.normalizedMessage || 'Login failed');
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch (e) {
      // ignore server error, clear client state anyway
    }
    localStorage.removeItem('authToken');
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo(() => ({
    user,
    isAdmin: !!user?.is_admin || !!user?.isAdmin,
    token,
    login,
    logout,
    loading,
    error,
  }), [user, token, login, logout, loading, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
