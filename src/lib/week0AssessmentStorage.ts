import type {
  Week0AssessmentPhase,
  Week0AssessmentResult,
  Week0HubPersistedState,
  Week0ModuleId,
} from '../data/week0AssessmentContent';
import { readActiveChildNickname } from '../config/activeChildNickname';
import { recordFormalAssessmentCompletion } from './recordInteractiveCompletion';
import { resolveTrackingProgramCode } from './activeProgramContext';

const STORAGE_KEY = 'caidens-courage-week0-assessment';

const EMPTY_STATE: Week0HubPersistedState = {
  completedModules: [],
  result: null,
};

export function loadWeek0HubState(): Week0HubPersistedState {
  if (typeof window === 'undefined') return { ...EMPTY_STATE };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_STATE };
    const parsed = JSON.parse(raw) as Week0HubPersistedState;
    return {
      studentName: parsed.studentName,
      completedModules: Array.isArray(parsed.completedModules) ? parsed.completedModules : [],
      result: parsed.result ?? null,
    };
  } catch {
    return { ...EMPTY_STATE };
  }
}

export function saveWeek0HubState(state: Week0HubPersistedState): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function markWeek0ModuleComplete(
  moduleId: Week0ModuleId,
  partial: Pick<Week0AssessmentResult, 'selScore' | 'readingScore' | 'focusStrategyScore'>,
  phase: Week0AssessmentPhase = 'baseline',
): Week0HubPersistedState {
  const current = loadWeek0HubState();
  const completedModules = current.completedModules.includes(moduleId)
    ? current.completedModules
    : [...current.completedModules, moduleId];

  const allDone = completedModules.length >= 3;
  const existing = current.result;

  const result: Week0AssessmentResult = {
    studentName: current.studentName,
    week: 0,
    phase,
    selScore: partial.selScore ?? existing?.selScore ?? 0,
    readingScore: partial.readingScore ?? existing?.readingScore ?? 0,
    focusStrategyScore: partial.focusStrategyScore ?? existing?.focusStrategyScore ?? 0,
    completedAt: allDone ? new Date().toISOString() : existing?.completedAt ?? '',
    baselineSnapshot: phase === 'growth' ? existing?.baselineSnapshot ?? existing ?? undefined : undefined,
  };

  const next: Week0HubPersistedState = {
    ...current,
    completedModules,
    result,
  };

  saveWeek0HubState(next);
  return next;
}

export async function persistWeek0ResultToDatabase(result: Week0AssessmentResult): Promise<void> {
  const nickname = result.studentName?.trim() || readActiveChildNickname()?.trim() || 'Student';
  const assessmentType = result.phase === 'growth' ? 'final' : 'baseline';
  const totalScore = result.selScore + result.readingScore + result.focusStrategyScore;

  const programCode = resolveTrackingProgramCode();
  if (!programCode) {
    console.warn('[TRACKING_SAVE_BLOCKED]', 'week0 assessment missing active program context');
    return;
  }

  const saveResult = await recordFormalAssessmentCompletion({
    assessmentType,
    role: 'student',
    participant: {
      nickname,
      program_code: programCode,
    },
    reading_score: result.readingScore,
    focus_score: result.focusStrategyScore,
    confidence_score: result.selScore,
    total_score: totalScore,
    max_score: 20,
    answers_json: {
      week: result.week,
      phase: result.phase,
      selScore: result.selScore,
      readingScore: result.readingScore,
      focusStrategyScore: result.focusStrategyScore,
    },
    completed_at: result.completedAt,
  });

  if (saveResult.warning) {
    console.warn('[TRACKING_SAVE_FAILED]', 'week0 assessment', saveResult.warning);
  }
}

export function isWeek0ModuleComplete(moduleId: Week0ModuleId, state = loadWeek0HubState()): boolean {
  return state.completedModules.includes(moduleId);
}

export function isWeek0FullyComplete(state = loadWeek0HubState()): boolean {
  return state.completedModules.length >= 3;
}

export function resetWeek0HubState(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}
