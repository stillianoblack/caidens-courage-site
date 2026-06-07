import type {
  Week0AssessmentPhase,
  Week0AssessmentResult,
  Week0HubPersistedState,
  Week0ModuleId,
} from '../data/week0AssessmentContent';

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

/**
 * TODO: Persist Week 0 / Week Final results to Focus Flame Academy database when
 * student portal sync is available. Wire this from markWeek0ModuleComplete on full completion.
 */
export async function persistWeek0ResultToDatabase(_result: Week0AssessmentResult): Promise<void> {
  // Placeholder — no-op until backend reporting is ready.
  return Promise.resolve();
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
