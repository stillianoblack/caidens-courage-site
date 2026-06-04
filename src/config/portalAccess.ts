/**
 * Caiden's Courage Portal — MVP access-code configuration.
 *
 * FUTURE-PROOFING (do not rely on this alone in production):
 * - Access codes should eventually move server-side (Netlify Functions, Supabase, etc.).
 * - Paid or restricted materials must not rely only on front-end code checks.
 * - Replace sessionStorage unlock with real authentication and role-based access.
 */

export type PortalAccessType = 'parent' | 'teacher' | 'school' | 'pilot' | 'kids';

export type PortalResourceItem = {
  title: string;
  description: string;
  href?: string;
  comingSoon?: boolean;
};

export type PortalAccessTier = {
  /** Placeholder MVP code — not secure; for pilot testing only. */
  code: string;
  type: PortalAccessType;
  /** Shown after unlock, e.g. "Family Resources" */
  unlockLabel: string;
  dashboardTitle: string;
  resources: PortalResourceItem[];
};

export const PORTAL_SESSION_KEY = 'cc-portal-unlock';

export const PORTAL_DASHBOARD_PATH = '/portal/dashboard';

/** MVP placeholder codes mapped to portal tiers. Keys are normalized uppercase. */
export const PORTAL_ACCESS_TIERS: PortalAccessTier[] = [
  {
    code: 'PARENT2026',
    type: 'parent',
    unlockLabel: 'Family Resources',
    dashboardTitle: 'Family Resources',
    resources: [
      {
        title: 'At-Home Focus Activities',
        description: 'Simple story-powered activities to practice focus and calm at home.',
        href: '/kids',
      },
      {
        title: 'Printable Coloring Pages',
        description: 'Brave Mind Club coloring pages for creative calm and courage.',
        href: '/braveminds?type=coloring',
      },
      {
        title: 'B-4 Reset Tools',
        description: 'Quick reset tools to help kids name feelings and refocus.',
        href: '/b4-tools',
      },
      {
        title: 'Parent Conversation Guides',
        description: 'Prompts and guides for talking about focus, feelings, and brave choices.',
        href: '/braveminds#parents',
      },
      {
        title: 'Join the Courage Club',
        description: 'Free activities, printables, and updates from Brave Mind Club.',
        href: '/braveminds',
      },
    ],
  },
  {
    code: 'TEACHER2026',
    type: 'teacher',
    unlockLabel: 'Teacher Portal',
    dashboardTitle: 'Teacher Portal',
    resources: [
      {
        title: 'SEL Discussion Prompts',
        description: 'Story-based questions to spark classroom conversations.',
        href: '/focus-flame-academy#teacher-resources',
      },
      {
        title: 'Printable Worksheets',
        description: 'Classroom-ready SEL printables and activity sheets.',
        href: '/braveminds?type=teacher-pack',
      },
      {
        title: 'Focus Reset Tools',
        description: 'B-4 tools for quick classroom focus resets.',
        href: '/b4-tools',
      },
      {
        title: 'Classroom Reflection Activities',
        description: 'Guided reflection prompts for groups and circles.',
        href: '/braveminds#teachers',
      },
      {
        title: 'Facilitator Guide',
        description: 'Training guides and facilitator resources for leading sessions.',
        href: '/training-guides',
      },
    ],
  },
  {
    code: 'SCHOOL2026',
    type: 'school',
    unlockLabel: 'School Hub',
    dashboardTitle: 'School Hub',
    resources: [
      {
        title: 'Pilot Overview',
        description: 'Learn how Focus Flame Academy works for schools and programs.',
        href: '/focus-flame-academy',
      },
      {
        title: 'Implementation Guide',
        description: "Step-by-step guidance for rolling out Caiden's Courage.",
        href: '/training-guides',
      },
      {
        title: 'Group Activities',
        description: 'Camp Courage group activities for classrooms and camps.',
        href: '/camp-courage',
      },
      {
        title: 'Student Reflection Tools',
        description: 'Printables and prompts for student reflection.',
        href: '/braveminds#kids',
      },
      {
        title: 'Request Support',
        description: 'Connect with the team for school implementation help.',
        href: '/focus-flame-academy#request-information',
      },
    ],
  },
  {
    code: 'PILOT2026',
    type: 'pilot',
    unlockLabel: 'Pilot Partner Hub',
    dashboardTitle: 'Pilot Partner Hub',
    resources: [
      {
        title: 'Pilot Materials',
        description: 'Core materials for pilot partners and facilitators.',
        href: '/camp-courage',
      },
      {
        title: 'Facilitator Guide',
        description: 'Guides for leading story-powered SEL sessions.',
        href: '/training-guides',
      },
      {
        title: 'Student Activities',
        description: 'Activities and printables for student groups.',
        href: '/braveminds#kids',
      },
      {
        title: 'Feedback Form',
        description: 'Share pilot feedback with the Caiden\'s Courage team.',
        comingSoon: true,
      },
      {
        title: 'Program Outcomes',
        description: 'Outcomes framework and reporting for pilot partners.',
        comingSoon: true,
      },
    ],
  },
  {
    code: 'KIDS2026',
    type: 'kids',
    unlockLabel: 'Kids Activities',
    dashboardTitle: 'Kids Activities',
    resources: [
      {
        title: 'Focus Flame Lab',
        description: 'Interactive story moments to practice focus and courage.',
        href: '/focus-flame-lab',
      },
      {
        title: 'Coloring Pages',
        description: 'Print and color brave characters and story scenes.',
        href: '/braveminds?type=coloring',
      },
      {
        title: 'Brave Missions',
        description: 'Short missions to practice brave choices in everyday moments.',
        comingSoon: true,
      },
      {
        title: 'Ask B-4',
        description: 'Chat with B-4 for a friendly focus and feelings reset.',
        href: '/chat',
      },
      {
        title: 'Badges Coming Soon',
        description: 'Earn courage badges as you complete activities.',
        comingSoon: true,
      },
    ],
  },
];

const TIER_BY_CODE = new Map(
  PORTAL_ACCESS_TIERS.map((tier) => [tier.code.toUpperCase(), tier])
);

/** MVP client-side lookup — replace with server validation before production launch. */
export function resolvePortalAccessCode(rawCode: string): PortalAccessTier | null {
  const normalized = rawCode.trim().toUpperCase();
  if (!normalized) return null;
  return TIER_BY_CODE.get(normalized) ?? null;
}

export function readPortalSessionUnlock(): PortalAccessType | null {
  try {
    const value = sessionStorage.getItem(PORTAL_SESSION_KEY);
    if (!value) return null;
    const tier = PORTAL_ACCESS_TIERS.find((t) => t.type === value);
    return tier?.type ?? null;
  } catch {
    return null;
  }
}

export function writePortalSessionUnlock(type: PortalAccessType): void {
  try {
    sessionStorage.setItem(PORTAL_SESSION_KEY, type);
  } catch {
    /* sessionStorage unavailable — unlock still works for current page load */
  }
}

export function clearPortalSessionUnlock(): void {
  try {
    sessionStorage.removeItem(PORTAL_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function getPortalTierByType(type: PortalAccessType): PortalAccessTier | undefined {
  return PORTAL_ACCESS_TIERS.find((t) => t.type === type);
}

/** Dashboard hero title by unlocked access type. */
export function getDashboardHeroTitle(type: PortalAccessType): string {
  switch (type) {
    case 'kids':
      return 'Kids Activities';
    case 'parent':
      return 'Family Resources';
    case 'teacher':
      return 'Educator Resources';
    case 'school':
    case 'pilot':
      return 'School & Pilot Resources';
    default:
      return 'Your Resources';
  }
}

/**
 * Resources shown on the unlocked dashboard (no pricing).
 * School and pilot codes share the school resource set for MVP.
 */
export function getDashboardResources(type: PortalAccessType): PortalResourceItem[] {
  if (type === 'kids') return getPortalTierByType('kids')?.resources ?? [];
  if (type === 'parent') return getPortalTierByType('parent')?.resources ?? [];
  if (type === 'teacher') return getPortalTierByType('teacher')?.resources ?? [];
  return getPortalTierByType('school')?.resources ?? [];
}

/** Build post-unlock dashboard URL with audience query params. */
export function getDashboardPathForTier(tier: PortalAccessTier): string {
  // Lazy import avoided — duplicate mapping inline to prevent circular deps
  const audience =
    tier.type === 'kids'
      ? 'kids'
      : tier.type === 'parent'
        ? 'parents'
        : tier.type === 'teacher'
          ? 'educators'
          : 'schools';
  const params = new URLSearchParams({ audience });
  if (tier.type === 'pilot') {
    params.set('access', 'pilot');
  }
  return `${PORTAL_DASHBOARD_PATH}?${params.toString()}`;
}

export function hasValidPortalSession(): boolean {
  return readPortalSessionUnlock() !== null;
}
