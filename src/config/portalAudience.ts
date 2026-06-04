import type { PortalAccessType } from './portalAccess';

/** Portal audience path — maps to ?audience= URL param. */
export type PortalAudienceTab = 'kids' | 'parents' | 'educators' | 'schools';

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
};

export const PORTAL_VALUE_ITEMS = [
  '139-page Digital Graphic Novel',
  'Focus Flame Lab + Printable Tools',
  'Guided SEL Reflection Modules',
] as const;
