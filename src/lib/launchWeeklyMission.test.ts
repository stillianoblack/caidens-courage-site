import type { NavigateFunction } from 'react-router-dom';
import type { CourageInTheDarkMission } from '../data/courageInTheDarkMap';
import { launchWeeklyMission } from './launchWeeklyMission';
import { kidPlayShellNavigate } from './kidShellNav';
import { assignPortalRoute } from './portalHardNavigation';

jest.mock('./kidShellNav', () => ({
  kidPlayShellNavigate: jest.fn(),
}));

jest.mock('./portalHardNavigation', () => ({
  assignPortalRoute: jest.fn(),
}));

const mission: CourageInTheDarkMission = {
  id: 'caiden',
  characterName: 'Caiden',
  label: 'Courage by the Bridge',
  token: '/caiden.webp',
  thumbnail: '/caiden.webp',
  color: 'gold',
  accentClass: 'from-yellow-300 to-blue-500',
  position: { x: 50, y: 50 },
  size: { width: 10, height: 10 },
  description: 'Test mission',
  rewardText: '+25 Focus Coins',
  targetGameSlug: 'caiden-courage-in-the-dark',
  directHref: '/family-hub/kids/caiden/test-mission',
};

describe('launchWeeklyMission', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('loads weekly mission routes directly from family or facilitator portal pages', () => {
    const navigate = jest.fn() as unknown as NavigateFunction;

    expect(
      launchWeeklyMission({
        mission,
        weekId: 1,
        weekTitle: 'Courage in the Dark',
        kidsBasePath: '/family-hub/kids',
        pathname: '/family-hub/weekly-adventures',
        source: 'week-card-cta',
        navigate,
      }),
    ).toBe(true);

    expect(assignPortalRoute).toHaveBeenCalledWith('/family-hub/kids/caiden/test-mission');
    expect(navigate).not.toHaveBeenCalled();
    expect(kidPlayShellNavigate).not.toHaveBeenCalled();
  });

  it('keeps weekly mission routes inside the active kid play shell', () => {
    const navigate = jest.fn() as unknown as NavigateFunction;

    expect(
      launchWeeklyMission({
        mission,
        weekId: 1,
        weekTitle: 'Courage in the Dark',
        kidsBasePath: '/play/session/session-123/kids',
        pathname: '/play/session/session-123/weekly-adventures',
        source: 'character-hotspot',
        navigate,
      }),
    ).toBe(true);

    expect(kidPlayShellNavigate).toHaveBeenCalledWith(
      navigate,
      '/play/session/session-123/kids/caiden/test-mission',
    );
    expect(assignPortalRoute).not.toHaveBeenCalled();
  });
});
