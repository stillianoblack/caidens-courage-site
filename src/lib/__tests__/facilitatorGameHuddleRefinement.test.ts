import fs from 'fs';
import path from 'path';
import {
  friendlyPortalWarning,
  PORTAL_FRIENDLY_ERROR_COPY,
} from '../portalFriendlyError';
import { FACILITATOR_GAME_HUDDLE_PATH } from '../../config/courageRoutes';

const read = (relativePath: string): string =>
  fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('facilitator game huddle refinement', () => {
  beforeEach(() => jest.spyOn(console, 'warn').mockImplementation(() => undefined));
  afterEach(() => jest.restoreAllMocks());

  test('uses one canonical roster launcher destination for both overview actions', () => {
    const overview = read('src/components/pilot-dashboard/panels/PilotOverviewPanel.tsx');
    const guide = read('src/components/pilot-dashboard/coach/FacilitatorProgramCoachPanel.tsx');

    expect(FACILITATOR_GAME_HUDDLE_PATH).toBe(
      '/program-dashboard/roster#student-session-launcher',
    );
    expect(overview).toContain('Launch Game Huddle');
    expect(overview).toContain('to={FACILITATOR_GAME_HUDDLE_PATH}');
    expect(guide).toContain("label={action.id === 'week-1-modules' ? 'Launch Game Huddle'");
    expect(guide).toContain('FACILITATOR_GAME_HUDDLE_PATH');
    expect(overview).not.toContain('Launch Weekly Adventure');
  });

  test('uses the full-body facilitator guide and truthful zero-state copy', () => {
    const overview = read('src/components/pilot-dashboard/panels/PilotOverviewPanel.tsx');
    const mobile = read('src/components/pilot-dashboard/FacilitatorMobileOverviewHero.tsx');

    expect(overview).toContain('/images/Choose-Your-Guide/B-4orange-hover.webp');
    expect(overview).toContain('Let’s get your explorers ready for their first adventure.');
    expect(mobile).toContain('Let’s get your explorers ready for their first adventure.');
    expect(overview).toContain("activeProgram?.programName || activeProgram?.groupName");
  });

  test('anchors and focuses the launcher without launching or changing a student', () => {
    const roster = read('src/components/pilot-dashboard/panels/PilotRosterPanel.tsx');

    expect(roster).toContain('id="student-session-launcher"');
    expect(roster).toContain("location.hash !== '#student-session-launcher'");
    expect(roster).toContain("launcher.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth'");
    expect(roster).toContain('launcher.focus({ preventScroll: true })');
    expect(roster).toContain("window.matchMedia('(prefers-reduced-motion: reduce)')");
    expect(roster).not.toContain('location.hash === \'#student-session-launcher\' && handleLaunchStudentSession');
  });

  test('maps technical errors to narrow friendly copy and never returns raw details', () => {
    expect(friendlyPortalWarning('permission denied for table student_family_links')).toBe(
      PORTAL_FRIENDLY_ERROR_COPY.familyConnection,
    );
    expect(friendlyPortalWarning('Portal connection issue. Please try again.')).toBe(
      PORTAL_FRIENDLY_ERROR_COPY.general,
    );
    expect(friendlyPortalWarning('')).toBeNull();
    expect(friendlyPortalWarning(null)).toBeNull();
  });
});
