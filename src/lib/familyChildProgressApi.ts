import { familyCompatibilityHeaders } from './familyPortalChildrenApi';

export type FamilyChildProgressRow = {
  week_id: string | null;
  mission_id: string | null;
  completed_at: string | null;
};

export type FamilyChildProgressSnapshot = {
  rows: FamilyChildProgressRow[];
  totalCoins: number;
  badges: string[];
};

export type FamilyChildModuleCompletion = {
  participantId: string;
  module: {
    moduleId: string;
    moduleTitle: string;
    character: string;
    skillArea?: string;
    score: number;
    maxScore: number;
    timeSpentSeconds?: number;
    answersJson?: Record<string, unknown>;
    completedAt: string;
  };
  attempts: Array<{
    weekNumber?: number | null;
    missionId: string;
    character?: string | null;
    questionId: string;
    gradeLevel?: string | null;
    gradeBand?: string | null;
    contentVersion?: string | null;
    selectedAnswer?: string | null;
    correctAnswer?: string | null;
    firstSelectedAnswer?: string | null;
    isCorrectFirstTry: boolean;
    isCorrectFinal: boolean;
    attemptCount: number;
    usedHint: boolean;
    attemptType: 'initial' | 'replay' | 'challenge';
    attemptScope?: string | null;
    isReplay: boolean;
    completedAt: string;
    moduleId?: string | null;
  }>;
};

export async function fetchFamilyCompatibilityChildProgress(
  participantId: string,
): Promise<FamilyChildProgressRow[]> {
  const response = await fetch(
    `/.netlify/functions/family-child-progress?participantId=${encodeURIComponent(participantId)}`,
    { method: 'GET', headers: familyCompatibilityHeaders() },
  );
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.success || !Array.isArray(body.rows)) {
    throw new Error(body?.code || 'family_child_progress_failed');
  }
  return body.rows;
}

export async function fetchFamilyCompatibilityChildProgressSnapshot(
  participantId: string,
  weekId: string,
): Promise<FamilyChildProgressSnapshot> {
  const params = new URLSearchParams({ participantId, weekId, view: 'summary' });
  const response = await fetch(
    `/.netlify/functions/family-child-progress?${params.toString()}`,
    { method: 'GET', headers: familyCompatibilityHeaders() },
  );
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.success || !Array.isArray(body.rows) || !Array.isArray(body.badges)) {
    throw new Error(body?.code || 'family_child_progress_failed');
  }
  return {
    rows: body.rows,
    totalCoins: Number.isFinite(body.totalCoins) ? body.totalCoins : 0,
    badges: body.badges.filter((value: unknown): value is string => typeof value === 'string'),
  };
}

export async function saveFamilyCompatibilityModuleCompletion(
  input: FamilyChildModuleCompletion,
): Promise<{ recordId: string; attemptCount: number }> {
  const response = await fetch('/.netlify/functions/family-child-progress', {
    method: 'POST',
    headers: familyCompatibilityHeaders(),
    body: JSON.stringify(input),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.success || typeof body.recordId !== 'string') {
    throw new Error(body?.code || 'family_child_completion_failed');
  }
  return {
    recordId: body.recordId,
    attemptCount: Number.isInteger(body.attemptCount) ? body.attemptCount : 0,
  };
}
