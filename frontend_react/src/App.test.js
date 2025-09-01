import { render, screen } from '@testing-library/react';
import App from './App';

test('renders header brand name', () => {
  render(<App />);
  const brand = screen.getByText(/Crossword Challenge/i);
  expect(brand).toBeInTheDocument();
});
