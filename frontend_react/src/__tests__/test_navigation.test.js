import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../../src/context/AuthContext';
import Header from '../../src/components/Header';
import PlayPage from '../../src/pages/PlayPage';

function renderWithAuth(user = null, route = '/') {
  const value = {
    user,
    isAdmin: !!user?.is_admin,
    token: user ? 't' : null,
    login: jest.fn(),
    logout: jest.fn(),
    loading: false,
    error: null,
  };
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthContext.Provider value={value}>
        <Header theme="light" onToggleTheme={() => {}} colors={{ primary: '#000', secondary: '#00f', accent: '#f90' }} />
        <Routes>
          <Route path="/" element={<PlayPage />} />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

test('shows navigation links and admin only when admin', () => {
  renderWithAuth({ username: 'u', is_admin: true });

  // Brand + links
  expect(screen.getByText(/Crossword Challenge/i)).toBeInTheDocument();
  expect(screen.getByText(/Play/i)).toBeInTheDocument();
  expect(screen.getByText(/Leaderboard/i)).toBeInTheDocument();
  expect(screen.getByText(/Admin/i)).toBeInTheDocument();
});

test('non-admin does not see admin link', () => {
  renderWithAuth({ username: 'u', is_admin: false });
  expect(screen.queryByText(/Admin/i)).not.toBeInTheDocument();
});
