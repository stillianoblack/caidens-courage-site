import type { FamilyChildSummary } from './familyChildrenMetrics';
import type { LocalModuleResultRecord } from './pilotTrackingLocalStorage';
import type { FamilyVisibleChild } from './studentFamilyLinkService';

function normalizeChildName(value?: string | null): string {
  return (
    value
      ?.trim()
      .toLowerCase()
      .replace(/\b(player|grade|grader|student|child)\b/g, '')
      .replace(/\b(pre[-\s]?k|kindergarten|k|[1-8](st|nd|rd|th)?)\b/g, '')
      .replace(/[^a-z0-9]+/g, '') ?? ''
  );
}

function hasModuleActivity(
  participantId: string | null | undefined,
  moduleResults: LocalModuleResultRecord[],
): boolean {
  const id = participantId?.trim();
  if (!id) return false;
  return moduleResults.some((row) => row.role === 'student' && row.participant_id === id);
}

function childHasActivity(child: FamilyChildSummary, moduleResults: LocalModuleResultRecord[]): boolean {
  return (
    child.baselineStatus === 'Complete' ||
    child.b4CheckInStatus === 'Complete' ||
    child.completedCount > 0 ||
    hasModuleActivity(child.participantId, moduleResults)
  );
}

function childRank(input: {
  child: FamilyChildSummary;
  activeParticipantId?: string | null;
  moduleResults: LocalModuleResultRecord[];
  visibleById: Map<string, FamilyVisibleChild>;
}): number {
  const participantId = input.child.participantId?.trim() ?? '';
  let score = 0;
  if (participantId && participantId === input.activeParticipantId?.trim()) score += 1000;
  if (childHasActivity(input.child, input.moduleResults)) score += 100;
  if (participantId && input.visibleById.has(participantId)) score += 10;
  return score;
}

export function dedupeFamilyPortalDisplayChildren(input: {
  children: FamilyChildSummary[];
  visibleChildren: FamilyVisibleChild[];
  moduleResults?: LocalModuleResultRecord[];
  activeParticipantId?: string | null;
}): { children: FamilyChildSummary[]; visibleChildren: FamilyVisibleChild[]; hiddenParticipantIds: string[] } {
  const moduleResults = input.moduleResults ?? [];
  const visibleById = new Map(
    input.visibleChildren
      .map((child) => [child.studentId?.trim(), child] as const)
      .filter(([id]) => Boolean(id)),
  );

  const groups = new Map<string, FamilyChildSummary[]>();
  for (const child of input.children) {
    const participantId = child.participantId?.trim() ?? '';
    const normalizedName = normalizeChildName(child.displayName || child.nickname || participantId);
    const key = normalizedName || `id:${participantId}`;
    const group = groups.get(key) ?? [];
    group.push(child);
    groups.set(key, group);
  }

  const keptChildren: FamilyChildSummary[] = [];
  const hiddenParticipantIds = new Set<string>();

  for (const group of Array.from(groups.values())) {
    if (group.length === 1) {
      keptChildren.push(group[0]);
      continue;
    }

    const ranked = [...group].sort((left, right) => {
      const rightRank = childRank({
        child: right,
        activeParticipantId: input.activeParticipantId,
        moduleResults,
        visibleById,
      });
      const leftRank = childRank({
        child: left,
        activeParticipantId: input.activeParticipantId,
        moduleResults,
        visibleById,
      });
      if (rightRank !== leftRank) return rightRank - leftRank;
      return left.displayName.localeCompare(right.displayName);
    });

    const keep = ranked[0];
    keptChildren.push(keep);
    for (const child of ranked.slice(1)) {
      const id = child.participantId?.trim();
      if (id) hiddenParticipantIds.add(id);
    }
  }

  const keptIds = new Set(
    keptChildren.map((child) => child.participantId?.trim()).filter((id): id is string => Boolean(id)),
  );

  return {
    children: keptChildren.sort((left, right) => left.displayName.localeCompare(right.displayName)),
    visibleChildren: input.visibleChildren.filter((child) => keptIds.has(child.studentId?.trim())),
    hiddenParticipantIds: Array.from(hiddenParticipantIds),
  };
}
