import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// PUBLIC_INTERFACE
export default function Header({ theme, onToggleTheme, colors }) {
  /**
   * Application header with branding, nav links, theme toggle, and auth controls.
   */
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 20px',
      background: '#fff',
      borderBottom: '1px solid #e9ecef',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 10, height: 10, background: colors.accent, borderRadius: 2
        }} />
        <Link to="/" style={{ color: colors.primary, textDecoration: 'none', fontWeight: 700 }}>
          Crossword Challenge
        </Link>
        <nav style={{ display: 'flex', gap: 12 }}>
          <Link to="/" style={{ color: colors.primary, textDecoration: 'none' }}>Play</Link>
          <Link to="/leaderboard" style={{ color: colors.primary, textDecoration: 'none' }}>Leaderboard</Link>
          {isAdmin && <Link to="/admin" style={{ color: colors.primary, textDecoration: 'none' }}>Admin</Link>}
        </nav>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onToggleTheme}
                className="theme-toggle"
                style={{ position: 'static', background: colors.secondary }}>
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        {user ? (
          <>
            <span style={{ color: colors.primary, fontSize: 14 }}>Hi, {user.username}</span>
            <button onClick={handleLogout} className="theme-toggle" style={{ position: 'static', background: colors.accent }}>
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="theme-toggle" style={{ textDecoration: 'none', background: colors.accent }}>
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
