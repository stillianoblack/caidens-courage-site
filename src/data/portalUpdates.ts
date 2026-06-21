import { programDashboardTabPath } from '../lib/programDashboardNav';
import { familyPortalPath, familySettingsChildrenStudentAccessPath } from '../lib/familyPortalPaths';

export type PortalUpdateType = 'feature' | 'fix' | 'reminder' | 'program';
export type PortalUpdateAudience = 'family' | 'facilitator' | 'both';
export type PortalUpdateSection = 'new' | 'this_week' | 'previous';

export type PortalUpdate = {
  id: string;
  title: string;
  description: string;
  /** ISO date string (YYYY-MM-DD) */
  publishedAt: string;
  type: PortalUpdateType;
  audience: PortalUpdateAudience;
  ctaLabel?: string;
  ctaRoute?: string;
};

/** Static portal announcements — future: Supabase / Admin Portal. */
export const PORTAL_UPDATES: PortalUpdate[] = [
  {
    id: 'student-pin-login',
    title: 'Student PIN login is now available',
    description:
      'Children can sign in with a student PIN from the portal access screen or Return To Session — no parent email required for play.',
    publishedAt: '2026-06-15',
    type: 'feature',
    audience: 'both',
    ctaLabel: 'Manage PINs',
    ctaRoute: familySettingsChildrenStudentAccessPath(),
  },
  {
    id: 'weekly-adventures-shell-launch',
    title: 'Weekly Adventures opens in the game shell',
    description:
      'Starting a Weekly Adventure now launches directly into the Kid Shell so kids land in gameplay faster.',
    publishedAt: '2026-06-14',
    type: 'feature',
    audience: 'family',
    ctaLabel: 'Open Weekly Adventures',
    ctaRoute: familyPortalPath('weekly-adventures'),
  },
  {
    id: 'family-progress-growth',
    title: 'Family progress shows baseline, growth, and current scores',
    description:
      'The Family Portal now highlights baseline results, current progress, and growth so you can celebrate momentum at a glance.',
    publishedAt: '2026-06-12',
    type: 'feature',
    audience: 'family',
    ctaLabel: 'View Results',
    ctaRoute: familyPortalPath('results'),
  },
  {
    id: 'facilitator-readiness-pin',
    title: 'View student readiness and PIN access',
    description:
      'Facilitators can review student readiness signals and PIN access from the roster and student detail drawer.',
    publishedAt: '2026-06-11',
    type: 'program',
    audience: 'facilitator',
    ctaLabel: 'View roster',
    ctaRoute: programDashboardTabPath('roster'),
  },
  {
    id: 'month1-certificate-weeks',
    title: 'Week 1–4 progress unlocks Month 1 certificates',
    description:
      'Completing Weekly Adventures across Weeks 1–4 now controls when Month 1 graduate certificates become available.',
    publishedAt: '2026-06-05',
    type: 'program',
    audience: 'both',
    ctaLabel: 'View certificates',
    ctaRoute: programDashboardTabPath('certificates'),
  },
];

export const PORTAL_UPDATE_SECTION_LABELS: Record<PortalUpdateSection, string> = {
  new: 'New',
  this_week: 'This Week',
  previous: 'Previous',
};

export const PORTAL_UPDATE_TYPE_LABELS: Record<PortalUpdateType, string> = {
  feature: 'Feature',
  fix: 'Fix',
  reminder: 'Reminder',
  program: 'Program',
};

export function filterPortalUpdatesForAudience(
  updates: PortalUpdate[],
  portal: 'family' | 'facilitator',
): PortalUpdate[] {
  return updates.filter((update) => update.audience === portal || update.audience === 'both');
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function bucketPortalUpdateSection(
  publishedAt: string,
  nowMs: number = Date.now(),
): PortalUpdateSection {
  const publishedMs = new Date(`${publishedAt}T12:00:00`).getTime();
  const ageDays = (nowMs - publishedMs) / MS_PER_DAY;
  if (ageDays <= 3) return 'new';
  if (ageDays <= 7) return 'this_week';
  return 'previous';
}

export function groupPortalUpdatesBySection(
  updates: PortalUpdate[],
  nowMs: number = Date.now(),
): Record<PortalUpdateSection, PortalUpdate[]> {
  const grouped: Record<PortalUpdateSection, PortalUpdate[]> = {
    new: [],
    this_week: [],
    previous: [],
  };

  const sorted = [...updates].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  for (const update of sorted) {
    grouped[bucketPortalUpdateSection(update.publishedAt, nowMs)].push(update);
  }

  return grouped;
}

export function resolvePortalUpdateCtaRoute(
  update: PortalUpdate,
  portal: 'family' | 'facilitator',
): string | null {
  if (!update.ctaRoute) return null;

  if (portal === 'facilitator' && update.ctaRoute.includes('/family-hub')) {
    if (update.id === 'student-pin-login') {
      return programDashboardTabPath('roster');
    }
    if (update.id === 'month1-certificate-weeks') {
      return programDashboardTabPath('certificates');
    }
    return programDashboardTabPath('overview');
  }

  if (portal === 'family' && update.ctaRoute.startsWith('/program-dashboard')) {
    if (update.id === 'month1-certificate-weeks') {
      return familyPortalPath('certificates');
    }
    return familyPortalPath('');
  }

  return update.ctaRoute;
}
