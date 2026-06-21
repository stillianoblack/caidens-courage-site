import {
  PORTAL_UPDATES,
  bucketPortalUpdateSection,
  filterPortalUpdatesForAudience,
  groupPortalUpdatesBySection,
  resolvePortalUpdateCtaRoute,
} from '../../data/portalUpdates';
import {
  buildPortalUpdatesReadKey,
  countUnreadPortalUpdates,
  markPortalUpdatesRead,
  readPortalUpdatesReadState,
} from '../portalUpdatesReadState';
import { programDashboardTabPath } from '../programDashboardNav';
import { familyPortalPath, familySettingsChildrenStudentAccessPath } from '../familyPortalPaths';

describe('portalUpdates', () => {
  test('family portal shows family and both updates only', () => {
    const family = filterPortalUpdatesForAudience(PORTAL_UPDATES, 'family');
    expect(family.every((update) => update.audience === 'family' || update.audience === 'both')).toBe(true);
    expect(family.some((update) => update.audience === 'facilitator')).toBe(false);
    expect(family.some((update) => update.id === 'weekly-adventures-shell-launch')).toBe(true);
    expect(family.some((update) => update.id === 'facilitator-readiness-pin')).toBe(false);
  });

  test('facilitator portal shows facilitator and both updates only', () => {
    const facilitator = filterPortalUpdatesForAudience(PORTAL_UPDATES, 'facilitator');
    expect(
      facilitator.every((update) => update.audience === 'facilitator' || update.audience === 'both'),
    ).toBe(true);
    expect(facilitator.some((update) => update.audience === 'family')).toBe(false);
    expect(facilitator.some((update) => update.id === 'facilitator-readiness-pin')).toBe(true);
    expect(facilitator.some((update) => update.id === 'weekly-adventures-shell-launch')).toBe(false);
  });

  test('groups updates into New, This Week, and Previous sections', () => {
    const now = new Date('2026-06-16T12:00:00').getTime();
    expect(bucketPortalUpdateSection('2026-06-15', now)).toBe('new');
    expect(bucketPortalUpdateSection('2026-06-12', now)).toBe('this_week');
    expect(bucketPortalUpdateSection('2026-06-05', now)).toBe('previous');

    const grouped = groupPortalUpdatesBySection(PORTAL_UPDATES, now);
    expect(grouped.new.length).toBeGreaterThan(0);
    expect(grouped.this_week.length).toBeGreaterThan(0);
    expect(grouped.previous.length).toBeGreaterThan(0);
  });

  test('resolves portal-specific CTA routes', () => {
    const pinUpdate = PORTAL_UPDATES.find((update) => update.id === 'student-pin-login');
    expect(pinUpdate).toBeTruthy();
    expect(resolvePortalUpdateCtaRoute(pinUpdate!, 'family')).toBe(
      familySettingsChildrenStudentAccessPath(),
    );
    expect(resolvePortalUpdateCtaRoute(pinUpdate!, 'facilitator')).toBe(programDashboardTabPath('roster'));

    const certUpdate = PORTAL_UPDATES.find((update) => update.id === 'month1-certificate-weeks');
    expect(resolvePortalUpdateCtaRoute(certUpdate!, 'family')).toBe(familyPortalPath('certificates'));
    expect(resolvePortalUpdateCtaRoute(certUpdate!, 'facilitator')).toBe(
      programDashboardTabPath('certificates'),
    );
  });
});

describe('portalUpdatesReadState', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test('tracks unread count and marks updates read when panel opens', () => {
    const portal = 'family';
    const scopeId = 'camp-2026';
    const ids = ['a', 'b', 'c'];

    expect(countUnreadPortalUpdates(portal, scopeId, ids)).toBe(3);

    markPortalUpdatesRead(portal, scopeId, ids);

    expect(countUnreadPortalUpdates(portal, scopeId, ids)).toBe(0);
    expect(readPortalUpdatesReadState(portal, scopeId).readIds).toEqual(ids);
    expect(window.localStorage.getItem(buildPortalUpdatesReadKey(portal, scopeId))).toContain('lastOpenedAt');
  });

  test('read key includes portal type and program scope', () => {
    expect(buildPortalUpdatesReadKey('facilitator', 'Blue Ribbon 2026')).toBe(
      'cc-portal-updates-read:facilitator:blue-ribbon-2026',
    );
  });
});
