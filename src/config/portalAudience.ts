import type { PortalAccessType } from './portalAccess';

/** Portal audience path — maps to ?audience= URL param. */
export type PortalAudienceTab = 'kids' | 'parents' | 'educators' | 'schools' | 'camps' | 'districts';

export type PortalPathTheme = 'blue' | 'gold' | 'orange' | 'teal';

export type PortalPathTab = {
  id: PortalAudienceTab;
  /** Primary label shown in the tab control */
  audienceLabel: string;
  /** One-line description shown below tabs in the content area */
  description: string;
  theme: PortalPathTheme;
};

export const PORTAL_PATH_TABS: PortalPathTab[] = [
  {
    id: 'kids',
    audienceLabel: 'Kids',
    description: 'Games, story adventures, and SEL practice.',
    theme: 'blue',
  },
  {
    id: 'parents',
    audienceLabel: 'Parents',
    description: 'At-home tools, printable activities, and family guides.',
    theme: 'gold',
  },
  {
    id: 'educators',
    audienceLabel: 'Educators',
    description: 'Classroom resources, lessons, and SEL implementation tools.',
    theme: 'orange',
  },
  {
    id: 'schools',
    audienceLabel: 'Schools & Districts',
    description: 'Licensing, pilots, implementation, and school-wide access.',
    theme: 'teal',
  },
];

/** @deprecated Use PORTAL_PATH_TABS */
export const PORTAL_AUDIENCE_TABS = PORTAL_PATH_TABS;

const VALID_AUDIENCES = new Set<string>(PORTAL_PATH_TABS.map((t) => t.id));

/** Legacy ?audience= values from earlier portal tab iterations. */
const LEGACY_AUDIENCE_MAP: Record<string, PortalAudienceTab> = {
  families: 'parents',
  focus: 'kids',
  confidence: 'parents',
  courage: 'educators',
  schools: 'schools',
  teachers: 'educators',
  camp: 'camps',
  district: 'districts',
};

export function parsePortalAudienceParam(value: string | null): PortalAudienceTab {
  if (value && VALID_AUDIENCES.has(value)) {
    return value as PortalAudienceTab;
  }
  if (value && value in LEGACY_AUDIENCE_MAP) {
    return LEGACY_AUDIENCE_MAP[value];
  }
  return 'kids';
}

/** Maps unlocked access tier to the audience path shown after code entry. */
export function portalAccessTypeToAudience(type: PortalAccessType): PortalAudienceTab {
  switch (type) {
    case 'kids':
      return 'kids';
    case 'parent':
      return 'parents';
    case 'teacher':
      return 'educators';
    case 'school':
    case 'pilot':
      return 'schools';
    default:
      return 'kids';
  }
}

export function getPortalPathTab(id: PortalAudienceTab): PortalPathTab | undefined {
  return PORTAL_PATH_TABS.find((tab) => tab.id === id);
}

/** Hero eyebrow + access card label for audience-specific portal views. */
export type PortalAudienceIdentity = {
  heroEyebrow: string;
  /** Shown under the icon inside the access card; omit on the main /portal view. */
  cardAudienceLabel?: string;
};

export const PORTAL_AUDIENCE_IDENTITY: Record<PortalAudienceTab, PortalAudienceIdentity> = {
  kids: {
    heroEyebrow: 'Brave Mind Club Access',
    cardAudienceLabel: 'Kids',
  },
  parents: {
    heroEyebrow: 'Family Access',
    cardAudienceLabel: 'Parents',
  },
  educators: {
    heroEyebrow: 'Focus Flame Academy',
    cardAudienceLabel: 'Educators',
  },
  schools: {
    heroEyebrow: 'School Access',
    cardAudienceLabel: 'Schools',
  },
  camps: {
    heroEyebrow: 'Camp Program Access',
    cardAudienceLabel: 'Camps',
  },
  districts: {
    heroEyebrow: 'District Access',
    cardAudienceLabel: 'Schools',
  },
};

export const PORTAL_DEFAULT_IDENTITY: PortalAudienceIdentity = {
  heroEyebrow: 'Courage Portal',
};

export function getPortalAudienceIdentity(audience: PortalAudienceTab | null): PortalAudienceIdentity {
  if (!audience) return PORTAL_DEFAULT_IDENTITY;
  return PORTAL_AUDIENCE_IDENTITY[audience];
}

export type PortalIncludedSection = {
  title: string;
  bullets: string[];
};

export const PORTAL_INCLUDED_BY_AUDIENCE: Record<PortalAudienceTab, PortalIncludedSection> = {
  kids: {
    title: "What's Included",
    bullets: ['Focus Flame Lab', 'Coloring Pages', 'Brave Missions', 'Ask B-4'],
  },
  parents: {
    title: "What's Included",
    bullets: ['Digital Graphic Novel', 'Family Activities', 'B-4 Tools', 'Conversation Guides'],
  },
  educators: {
    title: "What's Included",
    bullets: ['SEL Lessons', 'Discussion Prompts', 'Worksheets', 'Classroom Activities'],
  },
  schools: {
    title: "What's Included",
    bullets: ['Licensing', 'Implementation Resources', 'Facilitator Guides', 'Pilot Support'],
  },
  camps: {
    title: "What's Included",
    bullets: ['SEL Modules', 'Facilitator Guide', 'Group Activities', 'Focus Flame Lab Access'],
  },
  districts: {
    title: "What's Included",
    bullets: ['Multi-School Rollout', 'Outcomes Tracking', 'Implementation Support', 'Quarterly Review'],
  },
};

export const PORTAL_VALUE_ITEMS = [
  '139-page Digital Graphic Novel',
  'Focus Flame Lab + Printable Tools',
  'Guided SEL Reflection Modules',
] as const;
