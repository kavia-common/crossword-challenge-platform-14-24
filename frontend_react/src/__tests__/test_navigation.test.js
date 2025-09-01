import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../../src/App';
import { AuthContext } from '../../src/context/AuthContext';

function renderAppWithUser(user = null, route = '/') {
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
        <App />
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

test('shows navigation links and admin only when admin', () => {
  renderAppWithUser({ username: 'u', is_admin: true });

  // Brand + links
  expect(screen.getByText(/Crossword Challenge/i)).toBeInTheDocument();
  expect(screen.getByText(/Play/i)).toBeInTheDocument();
  expect(screen.getByText(/Leaderboard/i)).toBeInTheDocument();
  expect(screen.getByText(/Admin/i)).toBeInTheDocument();
});

test('non-admin does not see admin link', () => {
  renderAppWithUser({ username: 'u', is_admin: false });
  expect(screen.queryByText(/Admin/i)).not.toBeInTheDocument();
});
