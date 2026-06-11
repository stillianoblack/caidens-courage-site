import { useEffect, useMemo, useState } from 'react';
import { resolveTrackingProgramCode } from '../lib/activeProgramContext';
import { countFamilyCertificatesEarned } from '../lib/familyProgressMetrics';
import { familyPortalPath } from '../lib/familyPortalPaths';
import {
  fetchFamilyChildGoals,
  FAMILY_CHILD_GOALS_SAVED_EVENT,
  hasFamilyChildGoals,
} from '../lib/familyChildGoalsService';
import { fetchFamilyGallerySubmissions } from '../lib/studentGalleryService';
import { normalizeGalleryStatus } from '../lib/studentGalleryService';
import { getFamilyGallerySubmitterKey } from '../lib/familyGallerySession';
import { openProgramGoals } from '../lib/openProgramGoals';
import type { FamilyDashboardMetrics } from './useFamilyDashboardMetrics';

export type FamilyPortalNotification = {
  id: string;
  label: string;
  detail?: string;
  href?: string;
  onClick?: () => void;
};

export function useFamilyPortalNotifications(
  metrics: Pick<
    FamilyDashboardMetrics,
    | 'claimRequired'
    | 'children'
    | 'metrics'
    | 'moduleResults'
    | 'programCode'
    | 'loading'
  >,
  pathname: string,
): FamilyPortalNotification[] {
  const [familyGoalsComplete, setFamilyGoalsComplete] = useState(false);
  const [approvedGalleryCount, setApprovedGalleryCount] = useState(0);

  const programCode = metrics.programCode || resolveTrackingProgramCode() || '';
  const primaryChildId = metrics.children[0]?.participantId ?? null;

  useEffect(() => {
    if (!programCode) return;
    const refreshGoals = () => {
      void fetchFamilyChildGoals(programCode, primaryChildId).then((record) => {
        setFamilyGoalsComplete(hasFamilyChildGoals(record));
      });
    };
    refreshGoals();
    window.addEventListener(FAMILY_CHILD_GOALS_SAVED_EVENT, refreshGoals);
    return () => window.removeEventListener(FAMILY_CHILD_GOALS_SAVED_EVENT, refreshGoals);
  }, [programCode, primaryChildId]);

  useEffect(() => {
    if (!programCode) return;
    const submitterKey = getFamilyGallerySubmitterKey();
    void fetchFamilyGallerySubmissions(submitterKey, programCode).then((items) => {
      setApprovedGalleryCount(
        items.filter((item) => normalizeGalleryStatus(item.status) === 'approved').length,
      );
    });
  }, [programCode]);

  return useMemo(() => {
    if (metrics.loading || metrics.claimRequired) return [];

    const items: FamilyPortalNotification[] = [];
    const childIds = metrics.children
      .map((child) => child.participantId)
      .filter((id): id is string => Boolean(id));

    const certificates = countFamilyCertificatesEarned({
      moduleResults: metrics.moduleResults,
      allowedStudentIds: childIds,
    });

    if (!metrics.metrics.hasChildActivity && metrics.children.length > 0) {
      items.push({
        id: 'new-activity',
        label: 'New activity available',
        detail: 'Try a short activity with your child to get started.',
        href: familyPortalPath('continue-learning', pathname),
      });
    }

    if (certificates > 0) {
      items.push({
        id: 'certificate-ready',
        label: 'Certificate ready',
        detail: `${certificates} certificate${certificates === 1 ? '' : 's'} ready to view.`,
        href: familyPortalPath('certificates', pathname),
      });
    }

    if (approvedGalleryCount > 0) {
      items.push({
        id: 'gallery-approved',
        label: 'Gallery item approved',
        detail: `${approvedGalleryCount} approved submission${approvedGalleryCount === 1 ? '' : 's'} in your gallery.`,
        href: familyPortalPath('gallery', pathname),
      });
    }

    if (metrics.children.length > 0 && !familyGoalsComplete) {
      items.push({
        id: 'goals-not-set',
        label: 'Goals not set',
        detail: 'Choose family goals so B-4 can recommend better activities.',
        onClick: () => openProgramGoals(),
      });
    }

    return items;
  }, [
    approvedGalleryCount,
    familyGoalsComplete,
    metrics.children,
    metrics.claimRequired,
    metrics.loading,
    metrics.metrics.hasChildActivity,
    metrics.moduleResults,
    pathname,
  ]);
}
