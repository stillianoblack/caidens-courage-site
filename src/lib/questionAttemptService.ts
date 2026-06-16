import type { GameAssessmentConfig, GameChoiceQuestion } from '../types/gameAssessment';
import type { QuestionAttemptRecord } from '../types/questionInteraction';
import type { AttemptScope } from './canonicalAttemptRules';
import { resolveAttemptScope } from './canonicalAttemptRules';
import type { MissionAttemptType } from './missionAttemptType';
import { isSupabaseConfigured, supabase } from './supabaseClient';
import { serializeGameAnswer } from './questionAttemptTracking';
import {
  appendLocalQuestionAttempts,
  type LocalQuestionAttemptRecord,
} from './questionAttemptLocalStorage';

const SUPABASE_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isPersistableParticipantId(participantId: string): boolean {
  const trimmed = participantId.trim();
  return Boolean(trimmed) && !trimmed.startsWith('local-') && SUPABASE_UUID_PATTERN.test(trimmed);
}

export type QuestionAttemptSaveContext = {
  participant_id: string;
  program_code: string;
  week_number?: number | null;
  mission_id: string;
  character?: string | null;
  grade_level?: string | null;
  grade_band?: string | null;
  content_version?: string | null;
  module_id?: string | null;
  attempt_type?: MissionAttemptType;
  attempt_scope?: AttemptScope;
};

export type { MissionAttemptType };

export type QuestionAttemptInsertRow = {
  participant_id: string;
  program_code: string;
  week_number?: number | null;
  mission_id: string;
  character?: string | null;
  question_id: string;
  grade_level?: string | null;
  grade_band?: string | null;
  content_version?: string | null;
  selected_answer?: string | null;
  correct_answer?: string | null;
  first_selected_answer?: string | null;
  is_correct_first_try: boolean;
  is_correct_final: boolean;
  attempt_count: number;
  used_hint: boolean;
  attempt_type: MissionAttemptType;
  attempt_scope?: AttemptScope | null;
  is_replay: boolean;
  completed_at: string;
  module_id?: string | null;
};

function resolveCorrectAnswer(question: GameChoiceQuestion): string | null {
  if ('correctId' in question) {
    return question.correctId ?? null;
  }
  return null;
}

export function buildQuestionAttemptRows(input: {
  config: GameAssessmentConfig;
  attempts: Record<string, QuestionAttemptRecord>;
  context: QuestionAttemptSaveContext;
}): QuestionAttemptInsertRow[] {
  const questionById = new Map(input.config.questions.map((question) => [question.id, question]));

  return Object.values(input.attempts).map((attempt) => {
    const question = questionById.get(attempt.questionId);
    const correctAnswer = question && question.type === 'multiple_choice'
      ? resolveCorrectAnswer(question as GameChoiceQuestion)
      : null;
    const attemptType = input.context.attempt_type ?? 'initial';
    const attemptScope =
      input.context.attempt_scope ??
      resolveAttemptScope(attemptType === 'initial' ? 'weekly' : attemptType);

    return {
      participant_id: input.context.participant_id,
      program_code: input.context.program_code,
      week_number: input.context.week_number ?? null,
      mission_id: input.context.mission_id,
      character: input.context.character ?? input.config.decorVariant ?? null,
      question_id: attempt.questionId,
      grade_level: input.context.grade_level ?? null,
      grade_band: input.context.grade_band ?? null,
      content_version:
        question?.diagnosticMeta?.contentVersion ??
        input.context.content_version ??
        null,
      selected_answer: serializeGameAnswer(attempt.final_selected_answer),
      correct_answer: correctAnswer,
      first_selected_answer: serializeGameAnswer(attempt.first_selected_answer),
      is_correct_first_try: attempt.is_correct_first_try,
      is_correct_final: attempt.is_correct_final,
      attempt_count: attempt.attempts_count,
      used_hint: attempt.hints_used_count > 0,
      attempt_type: attemptType,
      attempt_scope: attemptScope,
      is_replay: attemptType === 'replay' || attemptType === 'challenge',
      completed_at: attempt.completed_at,
      module_id: input.context.module_id ?? input.context.mission_id,
    };
  });
}

export async function saveQuestionAttempts(input: {
  config: GameAssessmentConfig;
  attempts: Record<string, QuestionAttemptRecord>;
  context: QuestionAttemptSaveContext;
}): Promise<{ success: boolean; source: 'supabase' | 'local'; count: number }> {
  const rows = buildQuestionAttemptRows(input);
  if (rows.length === 0) {
    return { success: true, source: 'local', count: 0 };
  }

  const localRows: LocalQuestionAttemptRecord[] = rows.map((row) => ({
    ...row,
    id: `local-${row.participant_id}-${row.question_id}-${row.completed_at}`,
  }));
  appendLocalQuestionAttempts(localRows);

  if (!isSupabaseConfigured() || !supabase || !isPersistableParticipantId(input.context.participant_id)) {
    return { success: true, source: 'local', count: rows.length };
  }

  const { error } = await supabase.from('question_attempts').insert(rows);
  if (error) {
    console.warn('[QUESTION_ATTEMPT_SAVE_FAILED]', error);
    return { success: true, source: 'local', count: rows.length };
  }

  return { success: true, source: 'supabase', count: rows.length };
}
