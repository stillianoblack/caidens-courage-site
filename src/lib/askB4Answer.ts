import { getAskB4KnowledgeIndex, type AskB4Action, type AskB4KnowledgeEntry } from '../data/askB4Knowledge';
import { resolveAskB4PromptDeepLink } from './askB4DeepLinks';
import type { AskB4Mode } from './askB4Mode';

export type AskB4Response = {
  answer: string;
  actions: AskB4Action[];
  matchedIds: string[];
};

const FALLBACK_ANSWER =
  "I'm still learning that part of Caiden's world. Try asking about Caiden, Miranda, B-4 missions, downloads, coloring pages, focus moves, or the Family Portal.";

const MEDICAL_PATTERN =
  /\b(diagnos|medical|medication|prescri|clinical|disorder|adhd|autism|therapy|crisis|suicide|self[- ]?harm|hospital|doctor says)\b/i;

const PRIVATE_DATA_PATTERN =
  /\b(student score|individual score|my (kid|child)'s score|private record|student record|exact score|nickname.*score|who scored|tell me about .+ student)\b/i;

const BOUNDARY_ANSWER =
  'B-4 gives learning support and activity guidance — not medical advice, diagnoses, or private student records. For health or crisis concerns, contact a qualified professional. I can help you find activities, portal pages, and focus supports instead.';

function entryHaystack(entry: AskB4KnowledgeEntry): string {
  return [
    entry.title,
    entry.summary,
    entry.category,
    ...entry.tags,
    entry.kidAnswer,
    entry.familyAnswer,
    entry.facilitatorAnswer,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function modeAnswer(entry: AskB4KnowledgeEntry, mode: AskB4Mode): string {
  if (mode === 'kid' && entry.kidAnswer) return entry.kidAnswer;
  if (mode === 'family' && entry.familyAnswer) return entry.familyAnswer;
  if (mode === 'facilitator' && entry.facilitatorAnswer) return entry.facilitatorAnswer;
  return entry.summary;
}

function scoreEntry(entry: AskB4KnowledgeEntry, tokens: string[], mode: AskB4Mode): number {
  const haystack = entryHaystack(entry);
  let score = 0;
  for (const token of tokens) {
    if (haystack.includes(token)) score += 2;
    if (entry.title.toLowerCase().includes(token)) score += 3;
    if (entry.tags.some((t) => t.includes(token))) score += 2;
  }
  if (entry.modes.includes(mode)) score += 1;
  return score;
}

function dedupeActions(actions: AskB4Action[]): AskB4Action[] {
  const seen = new Set<string>();
  return actions.filter((a) => {
    const key = `${a.label}|${a.href}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function answerAskB4Question(
  query: string,
  mode: AskB4Mode,
  pathname?: string,
): AskB4Response {
  const trimmed = query.trim();
  if (!trimmed) {
    return { answer: FALLBACK_ANSWER, actions: [], matchedIds: [] };
  }

  if (MEDICAL_PATTERN.test(trimmed) || PRIVATE_DATA_PATTERN.test(trimmed)) {
    return {
      answer: BOUNDARY_ANSWER,
      actions: [
        { label: 'Open Parent Corner', href: '/family-hub/guide' },
        { label: 'Character Hub', href: '/family-hub/characters' },
      ],
      matchedIds: ['boundary'],
    };
  }

  const tokens = trimmed.toLowerCase().split(/\s+/).filter(Boolean);
  const index = getAskB4KnowledgeIndex();

  const ranked = index
    .map((entry) => ({ entry, score: scoreEntry(entry, tokens, mode) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  if (ranked.length === 0 || ranked[0].score < 2) {
    return { answer: FALLBACK_ANSWER, actions: [], matchedIds: [] };
  }

  const top = ranked.slice(0, 2);
  const primary = top[0].entry;
  const secondary = top[1]?.entry;

  let answer = modeAnswer(primary, mode);

  if (mode === 'kid') {
    const sentences = answer.split(/(?<=[.!?])\s+/);
    answer = sentences.slice(0, 3).join(' ');
  } else if (secondary && top[1].score >= top[0].score * 0.7) {
    answer = `${answer}\n\nYou might also explore: ${secondary.title} — ${modeAnswer(secondary, mode)}`;
  }

  const actions = dedupeActions(
    top.flatMap(({ entry }) => entry.recommendedResources ?? []).slice(0, 3),
  );

  const promptDeepLink = resolveAskB4PromptDeepLink(trimmed, mode, pathname);
  if (promptDeepLink) {
    actions.unshift({
      label: 'Open in portal',
      href: promptDeepLink,
    });
  }

  return {
    answer,
    actions: dedupeActions(actions).slice(0, 4),
    matchedIds: top.map(({ entry }) => entry.id),
  };
}
