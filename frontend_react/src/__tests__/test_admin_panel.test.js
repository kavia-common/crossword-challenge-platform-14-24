import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminPanel from '../../src/components/AdminPanel';
import { AuthContext } from '../../src/context/AuthContext';

jest.mock('../../src/api', () => ({
  listCrosswords: jest.fn(),
  createCrossword: jest.fn(),
  updateCrossword: jest.fn(),
  setActiveCrossword: jest.fn(),
}));

const { listCrosswords, createCrossword, updateCrossword, setActiveCrossword } = jest.requireMock('../../src/api');

function renderAsAdmin(ui) {
  const value = {
    user: { username: 'admin', is_admin: true },
    isAdmin: true,
    token: 't',
    login: jest.fn(),
    logout: jest.fn(),
    loading: false,
    error: null,
  };
  return render(<AuthContext.Provider value={value}>{ui}</AuthContext.Provider>);
}

describe('AdminPanel', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('lists existing crosswords and performs actions', async () => {
    listCrosswords.mockResolvedValue([
      { id: 1, title: 'CW1', is_active: false },
      { id: 2, title: 'CW2', is_active: true },
    ]);

    renderAsAdmin(<AdminPanel />);

    await waitFor(() => expect(screen.getByText('CW1')).toBeInTheDocument());
    expect(screen.getByText('CW2')).toBeInTheDocument();

    // Create new crossword
    createCrossword.mockResolvedValue({ id: 3, title: 'New CW', is_active: false });
    // Update fetch after actions
    listCrosswords.mockResolvedValueOnce([
      { id: 1, title: 'CW1', is_active: false },
      { id: 2, title: 'CW2', is_active: true },
      { id: 3, title: 'New CW', is_active: false },
    ]);

    fireEvent.change(screen.getByPlaceholderText('Title'), { target: { value: 'New CW' } });
    fireEvent.change(screen.getByPlaceholderText('Time limit seconds'), { target: { value: '600' } });
    fireEvent.change(
      screen.getByPlaceholderText('Grid JSON e.g. [["", "", ""], ["", "#", ""], ["", "", ""]]'),
      { target: { value: '[["",""],["",""]]' } }
    );
    fireEvent.change(
      screen.getByPlaceholderText('Clues JSON e.g. {"across":[{"number":1,"text":"..."},{"number":2,"text":"..."}],"down":[...] }'),
      { target: { value: '{"across":[],"down":[]}' } }
    );

    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => expect(createCrossword).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText('New CW')).toBeInTheDocument());

    // Set active action
    setActiveCrossword.mockResolvedValue({});
    listCrosswords.mockResolvedValueOnce([
      { id: 1, title: 'CW1', is_active: false },
      { id: 2, title: 'CW2', is_active: true },
      { id: 3, title: 'New CW', is_active: true },
    ]);

    const setActiveBtn = screen.getAllByRole('button', { name: /set active/i }).at(-1);
    fireEvent.click(setActiveBtn);
    await waitFor(() => expect(setActiveCrossword).toHaveBeenCalledWith(3));

    // Toggle active for CW2
    updateCrossword.mockResolvedValue({});
    const toggleBtn = screen.getAllByRole('button', { name: /deactivate|activate/i })[1]; // pick CW2 row
    fireEvent.click(toggleBtn);
    await waitFor(() => expect(updateCrossword).toHaveBeenCalled());
  });
});
