import fs from 'fs';
import path from 'path';
import { fireEvent, render, screen } from '@testing-library/react';
import FacilitatorPortalBootScreen from '../FacilitatorPortalBootScreen';

const read = (relativePath: string): string =>
  fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('FacilitatorPortalBootScreen', () => {
  test('renders one stable full-screen status surface', () => {
    const { container } = render(
      <FacilitatorPortalBootScreen state="booting" onRetry={jest.fn()} />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Preparing your facilitator portal');
    expect(container.querySelectorAll('[data-testid="facilitator-portal-boot"]')).toHaveLength(1);
    expect(screen.getByTestId('facilitator-portal-boot')).toHaveAttribute('aria-busy', 'true');
  });

  test('announces ready before the controlled fade completes', () => {
    render(<FacilitatorPortalBootScreen state="ready" exiting onRetry={jest.fn()} />);
    expect(screen.getByText('Your facilitator portal is ready.')).toBeInTheDocument();
    expect(screen.getByTestId('facilitator-portal-boot')).toHaveClass('facilitatorBoot--exiting');
  });

  test('shows bounded recovery actions only for a recoverable error', () => {
    const retry = jest.fn();
    render(<FacilitatorPortalBootScreen state="recoverable_error" onRetry={retry} />);
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(retry).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('link', { name: 'Return to Enter the World' })).toHaveAttribute('href', '/portal');
  });

  test('does not expose recovery actions while booting', () => {
    render(<FacilitatorPortalBootScreen state="booting" onRetry={jest.fn()} />);
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument();
  });

  test('keeps the facilitator route eager so no outer loader can flash first', () => {
    const app = read('src/App.tsx');
    expect(app).toContain("import ProgramDashboardPage from './pages/ProgramDashboardPage'");
    expect(app).not.toContain("React.lazy(() => import('./pages/ProgramDashboardPage'))");
  });

  test('uses a local dashboard skeleton after the shell is ready', () => {
    const page = read('src/pages/ProgramDashboardPage.tsx');
    expect(page).toContain('<Suspense fallback={<DashboardWidgetSkeleton showActivity />}>');
    expect(page).not.toContain('Loading dashboard...');
    expect(page).not.toContain('Restoring your facilitator session...');
  });

  test('defines the complete readiness contract', () => {
    const hook = read('src/hooks/useFacilitatorPortalBoot.ts');
    for (const state of ['booting', 'ready', 'recoverable_error', 'unauthenticated', 'fatal_error']) {
      expect(hook).toContain(`'${state}'`);
    }
  });
});
