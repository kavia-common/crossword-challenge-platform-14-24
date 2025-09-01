import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthContext } from '../../src/context/AuthContext';
import PlayPage from '../../src/pages/PlayPage';

jest.useFakeTimers();

jest.mock('../../src/api', () => ({
  getCurrentCrossword: jest.fn(),
  submitAnswer: jest.fn(),
}));

const { getCurrentCrossword, submitAnswer } = jest.requireMock('../../src/api');

function renderWithAuth(ui, { user = { username: 'alice', is_admin: false }, route = '/' } = {}) {
  const value = {
    user,
    isAdmin: !!user?.is_admin,
    token: 't',
    login: jest.fn(),
    logout: jest.fn(),
    loading: false,
    error: null,
  };
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthContext.Provider value={value}>
        {ui}
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

describe('PlayPage flow', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('loads crossword, ticks timer, allows input and submits', async () => {
    const grid = [
      ['', '#', ''],
      ['', '', ''],
    ];
    const crossword = {
      id: 1,
      title: 'Test Crossword',
      grid,
      clues: { across: [{ number: 1, text: 'A' }], down: [] },
      time_limit_seconds: 120,
    };
    getCurrentCrossword.mockResolvedValue(crossword);
    submitAnswer.mockResolvedValue({ correct: true, score: 100, completion_time_sec: 5, errors: [] });

    renderWithAuth(
      <Routes>
        <Route path="/" element={<PlayPage />} />
      </Routes>
    );

    // Loading state then title shows
    expect(screen.getByText(/Loading current crossword/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/Test Crossword/i)).toBeInTheDocument());

    // Timer ticks
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(screen.getByText(/⏱ 00:03/)).toBeInTheDocument();

    // Fill some cells (skip '#')
    const cell00 = screen.getByLabelText('cell-0-0');
    const cell02 = screen.getByLabelText('cell-0-2');
    const cell10 = screen.getByLabelText('cell-1-0');

    fireEvent.change(cell00, { target: { value: 'a' } });
    fireEvent.change(cell02, { target: { value: 'b' } });
    fireEvent.change(cell10, { target: { value: 'c' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /submit answers/i }));

    await waitFor(() => expect(submitAnswer).toHaveBeenCalled());

    const [id, answers, time] = submitAnswer.mock.calls[0];
    expect(id).toBe(1);
    // Answers should contain the three filled cells in uppercase
    expect(answers).toEqual(
      expect.arrayContaining([
        { row: 0, col: 0, letter: 'A' },
        { row: 0, col: 2, letter: 'B' },
        { row: 1, col: 0, letter: 'C' },
      ])
    );
    expect(time).toBeGreaterThanOrEqual(3);

    // Result shows
    expect(await screen.findByText(/Result/i)).toBeInTheDocument();
    expect(screen.getByText(/Correct: true/i)).toBeInTheDocument();
    expect(screen.getByText(/Score: 100/i)).toBeInTheDocument();
    expect(screen.getByText(/Time: 5s/i)).toBeInTheDocument();
  });

  test('requires login to submit answers', async () => {
    const crossword = { id: 2, title: 'CW', grid: [['', '']], clues: { across: [], down: [] } };
    getCurrentCrossword.mockResolvedValue(crossword);

    renderWithAuth(
      <Routes>
        <Route path="/" element={<PlayPage />} />
      </Routes>,
      { user: null }
    );

    await waitFor(() => expect(screen.getByText(/CW/)).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /submit answers/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/Please log in/i);
    expect(submitAnswer).not.toHaveBeenCalled();
  });
});
