import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
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
  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>
  );
}

describe('Auth flow', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.resetAllMocks();
  });

  test('successful login stores token', async () => {
    login.mockResolvedValue({ token: 'abc123', user: { username: 'alice', is_admin: false } });
    getMe.mockResolvedValue({ username: 'alice', is_admin: false });

    renderWithProviders(
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </AuthProvider>,
      { route: '/login' }
    );

    fireEvent.change(screen.getByPlaceholderText(/Enter username/i), { target: { value: 'alice' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter password/i), { target: { value: 'pass' } });
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
    });

    await waitFor(() => expect(localStorage.getItem('authToken')).toBe('abc123'));
  });

  test('header shows logged in user', async () => {
    localStorage.setItem('authToken', 'abc123');
    getMe.mockResolvedValue({ username: 'alice', is_admin: false });

    renderWithProviders(
      <AuthProvider>
        <Header 
          theme="light" 
          onToggleTheme={() => {}} 
          colors={{ primary: '#000', secondary: '#00f', accent: '#f90' }} 
        />
      </AuthProvider>,
      { route: '/' }
    );

    await waitFor(() => expect(screen.getByText(/Hi, alice/i)).toBeInTheDocument());
  });
});
