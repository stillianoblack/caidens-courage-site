import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { writeActivePilotProgram } from '../../config/activePilotProgram';
import { writePortalSessionUnlock } from '../../config/portalAccess';
import { writeActivePortalRole } from '../../config/portalContext';
import PilotDashboardSidebar from '../../components/pilot-dashboard/PilotDashboardSidebar';
import { useProgramDashboardNav } from '../../hooks/useProgramDashboardNav';
import { hasFacilitatorPortalSession } from '../portalSessionGuard';

jest.mock('../../hooks/useGalleryNavCounts', () => ({
  useFacilitatorGalleryPendingCount: () => 0,
}));

const activeProgram = {
  id: 'program-1',
  programCode: 'BLUE-RIBBON',
  programName: 'Blue Ribbon Results Academy',
  groupName: 'Blue Ribbon',
  familyAccessCode: 'FAMILY',
  facilitatorAccessCode: 'FACILITATOR',
  adminEmail: 'facilitator@example.com',
} as const;

function NavigationHarness() {
  const select = useProgramDashboardNav();
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <>
      <span data-testid="location">{location.pathname}</span>
      <button type="button" onClick={() => select('roster')}>Explorers</button>
      <button type="button" onClick={() => navigate(-1)}>Back</button>
      <button type="button" onClick={() => navigate(1)}>Forward</button>
    </>
  );
}

describe('facilitator Explorers route repair', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  test('desktop Explorers prevents the native navigation and selects roster once', () => {
    const onSelect = jest.fn();
    render(
      <MemoryRouter>
        <PilotDashboardSidebar
          activeId="overview"
          onSelect={onSelect}
          navItems={[{ id: 'roster', label: 'Explorers', icon: 'roster' }]}
          showProgramSettings={false}
        />
      </MemoryRouter>,
    );

    const link = screen.getByRole('tab', { name: 'Explorers' });
    expect(link).toHaveAttribute('href', '/program-dashboard/roster');
    fireEvent.click(link);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('roster');
  });

  test('Headquarters, Explorers, Back, and Forward stay in the client router', () => {
    writeActivePilotProgram(activeProgram as never);
    writeActivePortalRole('facilitator');
    writePortalSessionUnlock('pilot');

    render(
      <MemoryRouter initialEntries={['/program-dashboard']}>
        <NavigationHarness />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Explorers' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/program-dashboard/roster');
    expect(hasFacilitatorPortalSession()).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/program-dashboard');
    fireEvent.click(screen.getByRole('button', { name: 'Forward' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/program-dashboard/roster');
  });

  test('a partial facilitator session does not trigger the portal resume redirect', () => {
    writeActivePilotProgram(activeProgram as never);
    writeActivePortalRole('facilitator');
    expect(hasFacilitatorPortalSession()).toBe(false);

    writePortalSessionUnlock('pilot');
    expect(hasFacilitatorPortalSession()).toBe(true);
  });
});
