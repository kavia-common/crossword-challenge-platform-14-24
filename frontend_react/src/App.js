import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import ScrollToTop from './components/ScrollToTop';
import PlayPage from './pages/PlayPage';
import LeaderboardPage from './pages/LeaderboardPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';

// PUBLIC_INTERFACE
function App() {
  /**
   * App root: handles theming and top-level routing.
   */
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const colors = useMemo(() => ({
    primary: '#1a237e',
    secondary: '#64b5f6',
    accent: '#ffb300'
  }), []);

  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <Header theme={theme} onToggleTheme={toggleTheme} colors={colors} />
          <main style={{ maxWidth: 1200, margin: '0 auto', padding: 16 }}>
            <Routes>
              <Route path="/" element={<PlayPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/login" element={<LoginPage />} />
            </Routes>
          </main>
          <footer style={{ padding: 16, color: '#666', borderTop: '1px solid #e9ecef' }}>
            <small>Crossword Challenge • Powered by React</small>
          </footer>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
