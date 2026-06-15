import type { QuestionAttemptInsertRow } from './questionAttemptService';

const QUESTION_ATTEMPTS_KEY = 'caidens-courage-tracking-question-attempts';

export type LocalQuestionAttemptRecord = QuestionAttemptInsertRow & {
  id: string;
};

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadLocalQuestionAttempts(): LocalQuestionAttemptRecord[] {
  return readJson<LocalQuestionAttemptRecord[]>(QUESTION_ATTEMPTS_KEY, []);
}

export function appendLocalQuestionAttempts(rows: LocalQuestionAttemptRecord[]): void {
  const existing = loadLocalQuestionAttempts();
  writeJson(QUESTION_ATTEMPTS_KEY, [...rows, ...existing].slice(0, 2000));
}

export function loadLocalQuestionAttemptsForParticipant(
  participantId: string,
): LocalQuestionAttemptRecord[] {
  return loadLocalQuestionAttempts().filter((row) => row.participant_id === participantId);
}
