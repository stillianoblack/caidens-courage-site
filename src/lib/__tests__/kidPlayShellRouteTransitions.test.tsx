import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { KidPlayShellRouteContent } from '../../routes/kidPlayShellChildRoutes';
import { kidPlayShellNavigate } from '../kidShellNav';

jest.mock('../../components/family-portal/panels/FamilyContinueLearningPanel', () => ({
  __esModule: true,
  default: () => <div>Weekly Adventures route</div>,
}));

jest.mock('../../components/family-portal/panels/FamilyInventoryPanel', () => ({
  __esModule: true,
  default: () => <div>Collections route</div>,
}));

jest.mock('../../components/family-portal/panels/FamilyCharacterProfilePage', () => ({
  __esModule: true,
  default: () => <div>Character profile route</div>,
}));

jest.mock('../../components/kid-play-shell/KidPlayShellPage', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('../../components/kid-play-shell/KidPlayCharacterCollectionPanel', () => ({
  __esModule: true,
  default: () => <div>Characters route</div>,
}));

jest.mock('../../components/kid-play-shell/KidArcadePanel', () => ({
  __esModule: true,
  default: () => <div>Arcade route</div>,
}));

jest.mock('../../components/kid-play-shell/KidPlayShellComingSoonPanel', () => ({
  __esModule: true,
  default: () => <div>Rewards route</div>,
}));

jest.mock('../../routes/lazyPages', () => ({
  B4FocusFlightPage: () => <div>Flight route</div>,
  B4PortalCheckInPage: () => <div>B-4 check-in route</div>,
  B4PortalFeelingFinderPage: () => <div>B-4 feeling route</div>,
  B4PortalMissionPage: () => <div>B-4 mission route</div>,
  B4PortalPage: () => <div>B-4 route</div>,
  B4PortalWeek1Page: () => <div>B-4 week route</div>,
  CaidenQuestHubPage: () => <div>Caiden route</div>,
  CaidenQuestPage: () => <div>Caiden quest route</div>,
  CharliePortalHubPage: () => <div>Charlie route</div>,
  CharliePortalMissionPage: () => <div>Charlie mission route</div>,
  MirandaPortalHubPage: () => <div>Miranda route</div>,
  MirandaPortalMissionPage: () => <div>Miranda mission route</div>,
  ZekePortalHubPage: () => <div>Zeke route</div>,
  ZekePortalMissionPage: () => <div>Zeke mission route</div>,
}));

function TestSessionShell() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <button
        type="button"
        onClick={() =>
          kidPlayShellNavigate(navigate, '/play/session/session-123/weekly-adventures')
        }
      >
        Weekly Adventures
      </button>
      <button
        type="button"
        onClick={() => kidPlayShellNavigate(navigate, '/play/session/session-123/collections')}
      >
        Collections
      </button>
      <button
        type="button"
        onClick={() => kidPlayShellNavigate(navigate, '/play/session/session-123/characters')}
      >
        Characters
      </button>
      <button
        type="button"
        onClick={() => kidPlayShellNavigate(navigate, '/play/session/session-123/arcade')}
      >
        Arcade
      </button>
      <output aria-label="current path">{location.pathname}</output>
      <KidPlayShellRouteContent />
    </>
  );
}

describe('Kid Play shell route transitions', () => {
  test('changes visible module content on the first click without a reload', () => {
    window.history.replaceState(
      {},
      '',
      '/play/session/session-123/weekly-adventures',
    );

    render(
      <BrowserRouter>
        <Routes>
          <Route path="/play/session/:kidPlaySessionId/*" element={<TestSessionShell />} />
        </Routes>
      </BrowserRouter>,
    );

    expect(screen.getByText('Weekly Adventures route')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Collections' }));
    expect(screen.getByLabelText('current path')).toHaveTextContent(
      '/play/session/session-123/collections',
    );
    expect(screen.getByText('Collections route')).toBeInTheDocument();
    expect(screen.queryByText('Weekly Adventures route')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Characters' }));
    expect(screen.getByText('Characters route')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Arcade' }));
    expect(screen.getByText('Arcade route')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Weekly Adventures' }));
    expect(screen.getByText('Weekly Adventures route')).toBeInTheDocument();
  });
});
