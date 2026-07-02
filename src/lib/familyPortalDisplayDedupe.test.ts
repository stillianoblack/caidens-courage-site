import { dedupeFamilyPortalDisplayChildren } from './familyPortalDisplayDedupe';
import type { FamilyChildSummary } from './familyChildrenMetrics';
import type { LocalModuleResultRecord } from './pilotTrackingLocalStorage';
import type { FamilyVisibleChild } from './studentFamilyLinkService';

function child(overrides: Partial<FamilyChildSummary>): FamilyChildSummary {
  return {
    key: overrides.participantId ?? 'child',
    participantId: overrides.participantId ?? 'child',
    displayName: overrides.displayName ?? 'London',
    nickname: overrides.nickname ?? null,
    baselineStatus: overrides.baselineStatus ?? 'Not Started',
    b4CheckInStatus: overrides.b4CheckInStatus ?? 'Not Started',
    latestActivity: overrides.latestActivity ?? null,
    lastActivityAt: overrides.lastActivityAt ?? null,
    progressPct: overrides.progressPct ?? 0,
    completedCount: overrides.completedCount ?? 0,
    totalCount: overrides.totalCount ?? 10,
    progressLabel: overrides.progressLabel ?? '0 of 10 completed',
    createdAt: overrides.createdAt ?? null,
  };
}

function visible(studentId: string): FamilyVisibleChild {
  return {
    studentId,
    displayName: 'London',
    source: 'camp_link',
    campProgramCode: 'CAMP-GDI-2026',
  };
}

function moduleResult(participantId: string): LocalModuleResultRecord {
  return {
    id: 'module-1',
    participant_id: participantId,
    role: 'student',
    program_code: 'FAMILY-STILLS-2026',
    module_id: 'miranda-week-1',
    module_title: 'The Missing Schedule',
    character: 'miranda',
    skill_area: 'reading',
    score: 1,
    max_score: 1,
    percent_score: 100,
    attempt_number: 1,
    completed_at: '2026-06-28T12:00:00.000Z',
  };
}

describe('dedupeFamilyPortalDisplayChildren', () => {
  it('prefers the current active child id for same-name duplicate display records', () => {
    const result = dedupeFamilyPortalDisplayChildren({
      children: [
        child({ participantId: 'active-london', displayName: 'London 5th Grade' }),
        child({ participantId: 'duplicate-london', displayName: 'London Player', completedCount: 2 }),
      ],
      visibleChildren: [visible('active-london'), visible('duplicate-london')],
      activeParticipantId: 'active-london',
    });

    expect(result.children.map((row) => row.participantId)).toEqual(['active-london']);
    expect(result.visibleChildren.map((row) => row.studentId)).toEqual(['active-london']);
    expect(result.hiddenParticipantIds).toEqual(['duplicate-london']);
  });

  it('prefers the child with baseline or module activity when no active child is set', () => {
    const result = dedupeFamilyPortalDisplayChildren({
      children: [
        child({ participantId: 'empty-london', displayName: 'London Player' }),
        child({ participantId: 'progress-london', displayName: 'London 5th Grade', baselineStatus: 'Complete' }),
      ],
      visibleChildren: [visible('empty-london'), visible('progress-london')],
      moduleResults: [moduleResult('progress-london')],
    });

    expect(result.children.map((row) => row.participantId)).toEqual(['progress-london']);
    expect(result.hiddenParticipantIds).toEqual(['empty-london']);
  });

  it('prefers the parent-visible linked child when duplicate records have no activity', () => {
    const result = dedupeFamilyPortalDisplayChildren({
      children: [
        child({ participantId: 'family-fallback-london', displayName: 'London Player' }),
        child({ participantId: 'linked-london', displayName: 'London 5th Grade' }),
      ],
      visibleChildren: [visible('linked-london')],
    });

    expect(result.children.map((row) => row.participantId)).toEqual(['linked-london']);
    expect(result.visibleChildren.map((row) => row.studentId)).toEqual(['linked-london']);
    expect(result.hiddenParticipantIds).toEqual(['family-fallback-london']);
  });
});
