export type QuestionGradeBand = 'k_2' | '3_5' | '6_8' | 'general';
export type QuestionSetStatus = 'draft' | 'internal_review' | 'educator_review' | 'published' | 'archived';

export type QuestionSetCandidate = {
  id: string; programKey: string; moduleKey: string; gradeBand: QuestionGradeBand;
  status: QuestionSetStatus; version: number; isProgramDefault?: boolean;
};

export function normalizeQuestionGradeBand(value?: string | null): QuestionGradeBand {
  if (/kindergarten/i.test(String(value || ''))) return 'k_2';
  const normalized = String(value || '').trim().toLowerCase().replace(/grades?|kindergarten|\s/g, '');
  if (['k','k-2','k_2','0','1','2'].includes(normalized)) return 'k_2';
  if (['3-5','3_5','3','4','5'].includes(normalized)) return '3_5';
  if (['6-8','6_8','6','7','8'].includes(normalized)) return '6_8';
  return normalized === 'general' ? 'general' : 'general';
}

export function resolveQuestionSet<T extends QuestionSetCandidate>(
  candidates: T[], input: { programKey: string; moduleKey: string; gradeBand?: string; programDefaultGradeBand?: string },
): T | null {
  const eligible = candidates.filter((item) => item.programKey === input.programKey && item.moduleKey === input.moduleKey && item.status === 'published');
  const order = [normalizeQuestionGradeBand(input.gradeBand), input.programDefaultGradeBand ? normalizeQuestionGradeBand(input.programDefaultGradeBand) : null, 'general' as const].filter((value, index, all): value is QuestionGradeBand => Boolean(value) && all.indexOf(value) === index);
  for (const band of order) {
    const match = eligible.filter((item) => item.gradeBand === band).sort((a,b) => b.version-a.version)[0];
    if (match) return match;
  }
  return null;
}
