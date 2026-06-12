export type B4InsightsPortalType = 'family' | 'facilitator' | 'student' | 'admin';

export type B4InsightTone = 'strength' | 'attention' | 'progress' | 'setup' | 'neutral';

export type B4InsightItem = {
  id: string;
  label: string;
  detail?: string;
  tone?: B4InsightTone;
};

export type B4InsightAction = {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
};

export type B4InsightMetric = {
  label: string;
  value: string;
  hint?: string;
};

export type B4InsightsPayload = {
  portalType: B4InsightsPortalType;
  title: string;
  eyebrow?: string;
  childName?: string;
  programName?: string;
  avatarImage: string;
  heroImage?: string;
  summary: string;
  insights: B4InsightItem[];
  recommendations: string[];
  nextActions: B4InsightAction[];
  metrics: B4InsightMetric[];
  footerNote?: string;
};

export type B4InsightsDrawerProps = B4InsightsPayload & {
  isOpen: boolean;
  onClose: () => void;
};

export type FamilyB4InsightTopic =
  | 'overall'
  | 'baseline'
  | 'modules'
  | 'family-goals'
  | 'child-progress'
  | 'needs-attention';

export type FacilitatorB4InsightTopic =
  | 'participation'
  | 'baseline'
  | 'modules'
  | 'program-health'
  | 'student-progress';
