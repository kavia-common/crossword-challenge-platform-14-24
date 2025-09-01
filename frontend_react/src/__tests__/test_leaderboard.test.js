import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import LeaderboardPage from '../../src/pages/LeaderboardPage';

jest.mock('../../src/api', () => ({
  getLeaderboard: jest.fn(),
}));

const { getLeaderboard } = jest.requireMock('../../src/api');

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/leaderboard']}>
      <Routes>
        <Route path="/leaderboard" element={<LeaderboardPage />} />
      </Routes>
    </MemoryRouter>
  );
}

test('renders leaderboard rows', async () => {
  getLeaderboard.mockResolvedValue([
    { username: 'alice', score: 120, accuracy: 0.95, completion_time_sec: 55, submitted_at: new Date().toISOString() },
    { username: 'bob', score: 100, accuracy: 0.9, completion_time_sec: 65, submitted_at: new Date().toISOString() },
  ]);

  renderPage();

  expect(screen.getByText(/Loading leaderboard/i)).toBeInTheDocument();
  await waitFor(() => expect(screen.getByText(/Leaderboard/i)).toBeInTheDocument());
  expect(screen.getByText(/alice/i)).toBeInTheDocument();
  expect(screen.getByText(/bob/i)).toBeInTheDocument();
});

test('shows error on leaderboard fetch failure', async () => {
  getLeaderboard.mockRejectedValue({ normalizedMessage: 'Network error' });

  renderPage();

  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/Network error/i));
});
