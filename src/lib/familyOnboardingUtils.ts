import type { FamilyChildSummary } from './familyChildrenMetrics';
import { hasCanonicalGradeLevel } from './participantGradeDisplay';
import type { StudentParticipantRecord } from './pilotTrackingService';
import type { FamilyVisibleChild } from './studentFamilyLinkService';

export function resolveSelectableFamilyChildren(
  visibleChildren: FamilyVisibleChild[],
  children: FamilyChildSummary[],
): Array<{ participantId: string; displayName: string; firstName: string }> {
  const fromVisible = visibleChildren
    .map((child) => ({
      participantId: child.studentId,
      displayName: child.displayName,
      firstName: child.displayName,
    }))
    .filter((child) => Boolean(child.participantId));

  if (fromVisible.length) return fromVisible;

  return children
    .filter((child) => child.participantId)
    .map((child) => ({
      participantId: child.participantId as string,
      displayName: child.displayName,
      firstName: child.displayName,
    }));
}

export function resolveFamilyHasChild(
  visibleChildren: FamilyVisibleChild[],
  children: FamilyChildSummary[],
): boolean {
  return visibleChildren.length > 0 || children.some((child) => Boolean(child.participantId));
}

export function resolveChildHasGrade(
  participantId: string | null | undefined,
  studentParticipants: Array<Pick<StudentParticipantRecord, 'id' | 'grade_level' | 'grade_band'>>,
): boolean {
  if (!participantId) return false;
  const match = studentParticipants.find((row) => row.id === participantId);
  return Boolean(match && hasCanonicalGradeLevel(match.grade_level));
}
