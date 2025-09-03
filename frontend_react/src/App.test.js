import { render, screen } from '@testing-library/react';
import App from './App';

test('renders brand header', () => {
  render(<App />);
  const heading = screen.getByText(/Crossword Challenge/i);
  expect(heading).toBeInTheDocument();
});
