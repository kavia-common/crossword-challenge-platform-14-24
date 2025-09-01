import { render, screen } from '@testing-library/react';
import App from './App';
import { MemoryRouter } from 'react-router-dom';

test('renders header brand name', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>
  );
  const brand = screen.getByText(/Crossword Challenge/i);
  expect(brand).toBeInTheDocument();
});
