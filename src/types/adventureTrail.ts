import type { FamilyCharacterId } from '../data/familyPortalContent';

export type TrailNodeState = 'complete' | 'available' | 'locked' | 'in_progress' | 'coming_soon';

export type TrailNodeKind =
  | 'caiden'
  | 'miranda'
  | 'b4'
  | 'charlie'
  | 'zeke'
  | 'family_activity'
  | 'certificate';

export type AdventureTrailNode = {
  id: string;
  kind: TrailNodeKind;
  characterId?: FamilyCharacterId;
  title: string;
  description: string;
  cta: string;
  href: string;
  moduleId?: string;
  external?: boolean;
  comingSoon?: boolean;
};

export type AdventureTrailNodeView = AdventureTrailNode & {
  state: TrailNodeState;
  stepNumber: number;
  side: 'left' | 'right';
};

export type AdventureTrailWeekView = {
  week: number;
  title: string;
  selFocus: string;
  weekStatus: 'available' | 'locked';
  unlockStatus: string;
  previewActivities: string[];
  nodes: AdventureTrailNodeView[];
};
