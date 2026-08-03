import fs from 'fs';
import path from 'path';
import {
  friendlyPortalWarning,
  PORTAL_FRIENDLY_ERROR_COPY,
} from '../portalFriendlyError';
import { FACILITATOR_GAME_HUDDLE_PATH } from '../../config/courageRoutes';
import { FACILITATOR_B4_ASSETS } from '../../config/facilitatorB4Assets';

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

    expect(FACILITATOR_B4_ASSETS.fullBody).toBe('/images/Choose-Your-Guide/B-4orange-hover.webp');
    expect(FACILITATOR_B4_ASSETS.head).toBe('/images/Choose-Your-Guide/B-4orange.webp');
    expect(overview).toContain('FACILITATOR_B4_ASSETS.fullBody');
    expect(overview).toContain('Let’s get your explorers ready for their first adventure.');
    expect(mobile).toContain('Let’s get your explorers ready for their first adventure.');
    expect(overview).toContain("activeProgram?.programName || activeProgram?.groupName");
  });

  test('keeps full-body and head-only facilitator art on one shared mapping', () => {
    const overview = read('src/components/pilot-dashboard/panels/PilotOverviewPanel.tsx');
    const guide = read('src/components/pilot-dashboard/coach/FacilitatorProgramCoachPanel.tsx');

    expect(overview.indexOf('pilot-commandHeroB4')).toBeLessThan(
      overview.indexOf('pilot-commandHeroCopy'),
    );
    expect(guide).toContain('openSrc={FACILITATOR_B4_ASSETS.head}');
    expect(guide).not.toContain('src={FACILITATOR_B4_ASSETS.fullBody}');
  });

  test('uses one branded portal loader without generic bootstrap skeletons', () => {
    const loader = read('src/components/portal/PortalRouteLoader.tsx');
    const app = read('src/App.tsx');

    expect(loader).toContain('FOCUS_FLAME_ACADEMY_MARK_SRC');
    expect(loader).not.toContain('portal-routeLoaderSkeleton');
    expect(loader).not.toContain('portal-routeLoaderBlock');
    expect(app).toContain('fullScreen');
  });

  test('localizes family aggregation warnings and ignores stale tracking responses', () => {
    const tracking = read('src/hooks/usePilotTrackingResults.ts');
    const guide = read('src/components/pilot-dashboard/coach/FacilitatorProgramCoachPanel.tsx');

    expect(tracking).toContain('requestId !== requestIdRef.current');
    expect(tracking).toContain('setFamilyWarning');
    expect(tracking).toContain('legacyPayload.warning || trackingPayload.warning || familyLinksPayload.error');
    expect(tracking).toContain('directoryPayload.errors[0] ?? undefined');
    expect(guide).toContain('pilot-programCoachWarning');
  });

  test('student session loader has bounded retry and safe roster recovery', () => {
    const session = read('src/pages/KidPlaySessionLayout.tsx');

    expect(session).toContain('SESSION_BOOT_TIMEOUT_MS = 15000');
    expect(session).toContain('Try again');
    expect(session).toContain('Return to roster');
    expect(session).toContain("navigate('/program-dashboard/roster')");
    expect(session).not.toContain('Supabase');
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
