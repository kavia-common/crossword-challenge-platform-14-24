import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import App from '../..//src/App';
import { AuthProvider } from '../../src/context/AuthContext';
import LoginPage from '../../src/pages/LoginPage';
import Header from '../../src/components/Header';

jest.mock('../../src/api', () => ({
  login: jest.fn(),
  logout: jest.fn(),
  getMe: jest.fn(),
}));

const { login, logout, getMe } = jest.requireMock('../../src/api');

function renderWithProviders(ui, { route = '/login' } = {}) {
  window.history.pushState({}, 'Test page', route);
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>
  );
}

describe('Auth flow', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.resetAllMocks();
  });

  test('successful login stores token and shows user in header', async () => {
    login.mockResolvedValue({ token: 'abc123', user: { username: 'alice', is_admin: false } });
    getMe.mockResolvedValue({ username: 'alice', is_admin: false });

    renderWithProviders(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <Header
              theme="light"
              onToggleTheme={() => {}}
              colors={{ primary: '#000', secondary: '#00f', accent: '#f90' }}
            />
          }
        />
      </Routes>,
      { route: '/login' }
    );

    fireEvent.change(screen.getByPlaceholderText(/Enter username/i), { target: { value: 'alice' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => expect(localStorage.getItem('authToken')).toBe('abc123'));

    // Now render header to verify user appears
    renderWithProviders(
      <Header theme="light" onToggleTheme={() => {}} colors={{ primary: '#000', secondary: '#00f', accent: '#f90' }} />,
      { route: '/' }
    );

    expect(screen.getByText(/Hi, alice/i)).toBeInTheDocument();
  });

  test('logout clears token and navigates to login', async () => {
    // Seed logged-in state by setting token and resolving getMe
    localStorage.setItem('authToken', 'abc123');
    getMe.mockResolvedValue({ username: 'alice', is_admin: false });
    logout.mockResolvedValue({});

    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<App />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    // Ensure user greeting appears after bootstrap
    await waitFor(() => expect(screen.getByText(/Hi, alice/i)).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /logout/i }));

    await waitFor(() => expect(localStorage.getItem('authToken')).toBeNull());
    // After logout, header shows Login link
    expect(screen.getAllByText(/login/i)[0]).toBeInTheDocument();
  });
});
