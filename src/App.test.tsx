import { BrowserRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

const smokeRoutes = [
  '/',
  '/portal',
  '/family-hub',
  '/family-hub/results',
  '/program-dashboard',
  '/braveminds',
];

test.each(smokeRoutes)('renders route without crashing: %s', async (path) => {
  window.history.pushState({}, '', path);

  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  );

  await waitFor(() => {
    expect(document.body.textContent?.trim().length).toBeGreaterThan(0);
  });
  expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
});
