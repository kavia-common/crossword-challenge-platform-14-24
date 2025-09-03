import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";

// PUBLIC_INTERFACE
export const AuthContext = createContext(null);

// PUBLIC_INTERFACE
export function useAuth() {
  /** Hook to access authentication state and actions. */
  return useContext(AuthContext);
}

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /**
   * Provides authentication state based on JWT in localStorage and backend /auth/me.
   * Exposes: user, token, login, logout, loading.
   */
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!token);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const me = await api.me(token);
        if (!cancelled) {
          setUser(me);
        }
      } catch (e) {
        console.warn("Auth me failed:", e.message);
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [token]);

  const login = async (username, password) => {
    const data = await api.login(username, password);
    const t = data?.token || data?.access || null;
    if (!t) throw new Error("No token returned from API");
    localStorage.setItem("token", t);
    setToken(t);
    // Fetch user profile
    const me = await api.me(t);
    setUser(me);
    return me;
  };

  const logout = async () => {
    try { if (token) await api.logout(token); } catch (_) { /* ignore */ }
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ user, token, login, logout, loading }), [user, token, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
