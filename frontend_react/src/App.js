import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './modules/auth/AuthContext';
import LoginPage from './pages/LoginPage';
import CrosswordPage from './pages/CrosswordPage';
import LeaderboardPage from './pages/LeaderboardPage';
import AdminPage from './pages/admin/AdminPage';

/**
 * Basic header with navigation and auth actions.
 */
function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="header">
      <div className="brand">
        <span className="brand-dot" />
        Crossword Challenge
      </div>
      <nav className="nav">
        <Link to="/crosswords" aria-current={location.pathname.startsWith('/crosswords') ? 'page' : undefined}>Crosswords</Link>
        <Link to="/leaderboard" aria-current={location.pathname.startsWith('/leaderboard') ? 'page' : undefined}>Leaderboard</Link>
        {user?.is_admin && (
          <Link to="/admin" aria-current={location.pathname.startsWith('/admin') ? 'page' : undefined}>Admin</Link>
        )}
        {!user ? (
          <Link to="/login" aria-current={location.pathname === '/login' ? 'page' : undefined}>Login</Link>
        ) : (
          <button onClick={logout} aria-label="Logout">Logout</button>
        )}
      </nav>
    </header>
  );
}

/**
 * ProtectedRoute ensures authenticated access to private pages
 */
// PUBLIC_INTERFACE
function ProtectedRoute({ children, adminOnly = false }) {
  /** Ensures route access based on authentication and optional admin role. */
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !user.is_admin) return <Navigate to="/crosswords" replace />;
  return children;
}

/**
 * App routes and providers
 */
// PUBLIC_INTERFACE
function App() {
  /** App root with routing and AuthProvider. */
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-shell">
          <Header />
          <main className="main">
            <Routes>
              <Route path="/" element={<Navigate to="/crosswords" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/crosswords" element={
                <ProtectedRoute>
                  <CrosswordPage />
                </ProtectedRoute>
              } />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/admin/*" element={
                <ProtectedRoute adminOnly>
                  <AdminPage />
                </ProtectedRoute>
              } />
              <Route path="*" element={<div className="card"><div className="card-body"><h3>Not Found</h3></div></div>} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
