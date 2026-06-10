import type { FamilyChildSummary } from './familyChildrenMetrics';
import type { FamilyProgressSnapshot } from './familyProgressMetrics';

export type FamilyNeedsAttentionItem = {
  id: string;
  label: string;
  detail: string;
  href?: string;
  highlight?: boolean;
};

export function buildFamilyNeedsAttention({
  children,
  metrics,
  galleryPendingCount = 0,
  certificateReady = false,
  baselinePath,
  galleryPath,
  certificatesPath,
  continueLearningPath,
}: {
  children: FamilyChildSummary[];
  metrics: FamilyProgressSnapshot;
  galleryPendingCount?: number;
  certificateReady?: boolean;
  baselinePath: string;
  galleryPath: string;
  certificatesPath: string;
  continueLearningPath: string;
}): FamilyNeedsAttentionItem[] {
  const items: FamilyNeedsAttentionItem[] = [];

  const missingBaseline = children.filter((child) => child.baselineStatus === 'Not Started');
  if (missingBaseline.length > 0) {
    items.push({
      id: 'missing-baseline',
      label: 'Baseline not completed',
      detail:
        missingBaseline.length === 1
          ? `${missingBaseline[0].displayName} hasn't started the B-4 Baseline yet.`
          : `${missingBaseline.length} children haven't started the B-4 Baseline yet.`,
      href: baselinePath,
    });
  }

  if (!metrics.hasChildActivity && children.length > 0) {
    items.push({
      id: 'no-activity',
      label: 'No recent activity',
      detail: 'Try a short activity together to build momentum.',
      href: continueLearningPath,
    });
  }

  if (galleryPendingCount > 0) {
    items.push({
      id: 'gallery-pending',
      label: 'Artwork awaiting review',
      detail: `${galleryPendingCount} submission${galleryPendingCount === 1 ? '' : 's'} waiting for facilitator review.`,
      href: galleryPath,
    });
  }

  if (certificateReady) {
    items.push({
      id: 'certificate-ready',
      label: 'Certificate ready',
      detail: 'A certificate is ready to download and celebrate.',
      href: certificatesPath,
      highlight: true,
    });
  }

  if (items.length === 0 && !metrics.hasActivity) {
    items.push({
      id: 'get-started',
      label: 'New here?',
      detail: 'Start with a B-4 Baseline or a coloring activity together.',
      href: continueLearningPath,
    });
  }

  return items;
}
