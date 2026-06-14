import type { FamilyChildSummary } from './familyChildrenMetrics';

export type FamilyChildPlayReadiness = {
  participantId: string;
  displayName: string;
  baselineComplete: boolean;
  b4CheckInComplete: boolean;
  playReady: boolean;
};

export function isChildPlayReady(child: Pick<FamilyChildSummary, 'baselineStatus' | 'b4CheckInStatus'>): boolean {
  return child.baselineStatus === 'Complete' && child.b4CheckInStatus === 'Complete';
}

export function resolveFamilyChildReadiness(children: FamilyChildSummary[]): FamilyChildPlayReadiness[] {
  return children
    .filter((child) => Boolean(child.participantId))
    .map((child) => ({
      participantId: child.participantId as string,
      displayName: child.displayName,
      baselineComplete: child.baselineStatus === 'Complete',
      b4CheckInComplete: child.b4CheckInStatus === 'Complete',
      playReady: isChildPlayReady(child),
    }));
}

export function areAllChildrenPlayReady(children: FamilyChildSummary[]): boolean {
  const roster = resolveFamilyChildReadiness(children);
  if (roster.length === 0) return false;
  return roster.every((child) => child.playReady);
}

export function resolveChildrenNeedingSetup(children: FamilyChildSummary[]): FamilyChildPlayReadiness[] {
  return resolveFamilyChildReadiness(children).filter((child) => !child.playReady);
}
