import { STORY_CHAPTERS, type StoryQuestionCategory, type StoryQuestGradeBand } from '../../data/storyMode';

const STORAGE_PREFIX = 'caidens-courage.story-quest.dragons-nest.v2';

export type StoryQuestionResponse = {
  questionId: string;
  chapterId: string;
  category: StoryQuestionCategory;
  gradeBand: StoryQuestGradeBand;
  selectedAnswer: string;
  correct: boolean;
  attempts: number;
  answeredAt: string;
};

export type StoryProgress = {
  lastUnlockedChapterId: string;
  completedChapterIds: string[];
  choices: Record<string, string>;
  storySparksByChapter: Record<string, number>;
  responses: Record<string, StoryQuestionResponse>;
};

const firstChapterId = STORY_CHAPTERS[0]?.id ?? 'chapter-1';

const defaultProgress: StoryProgress = {
  lastUnlockedChapterId: firstChapterId,
  completedChapterIds: [],
  choices: {},
  storySparksByChapter: {},
  responses: {},
};

function storageKey(scope?: string | null): string {
  const normalized = scope?.trim().replace(/[^a-zA-Z0-9_-]/g, '-') || 'guest';
  return `${STORAGE_PREFIX}.${normalized}`;
}

function normalizeProgress(progress: Partial<StoryProgress> | null): StoryProgress {
  const validChapterIds = new Set(STORY_CHAPTERS.map((chapter) => chapter.id));
  return {
    lastUnlockedChapterId:
      progress?.lastUnlockedChapterId && validChapterIds.has(progress.lastUnlockedChapterId)
        ? progress.lastUnlockedChapterId
        : firstChapterId,
    completedChapterIds: Array.isArray(progress?.completedChapterIds)
      ? (progress?.completedChapterIds ?? []).filter((id) => validChapterIds.has(id))
      : [],
    choices: progress?.choices && typeof progress.choices === 'object' ? progress.choices : {},
    storySparksByChapter:
      progress?.storySparksByChapter && typeof progress.storySparksByChapter === 'object'
        ? progress.storySparksByChapter
        : {},
    responses: progress?.responses && typeof progress.responses === 'object' ? progress.responses : {},
  };
}

export function readStoryProgress(scope?: string | null): StoryProgress {
  if (typeof window === 'undefined') return defaultProgress;
  try {
    const stored = window.localStorage.getItem(storageKey(scope));
    return normalizeProgress(stored ? JSON.parse(stored) as Partial<StoryProgress> : null);
  } catch {
    return defaultProgress;
  }
}

export function writeStoryProgress(progress: StoryProgress, scope?: string | null): StoryProgress {
  const normalized = normalizeProgress(progress);
  try {
    window.localStorage.setItem(storageKey(scope), JSON.stringify(normalized));
  } catch {
    // Continue with in-memory progress when storage is unavailable.
  }
  return normalized;
}

export function unlockStoryChapter(current: StoryProgress, chapterId: string, scope?: string | null): StoryProgress {
  const chapterIndex = STORY_CHAPTERS.findIndex((chapter) => chapter.id === chapterId);
  const unlockedIndex = STORY_CHAPTERS.findIndex((chapter) => chapter.id === current.lastUnlockedChapterId);
  if (chapterIndex <= unlockedIndex) return current;
  return writeStoryProgress({ ...current, lastUnlockedChapterId: chapterId }, scope);
}

export function completeStoryChapter(current: StoryProgress, chapterId: string, nextChapterId?: string, scope?: string | null): StoryProgress {
  const completedChapterIds = current.completedChapterIds.includes(chapterId)
    ? current.completedChapterIds
    : [...current.completedChapterIds, chapterId];
  return writeStoryProgress({
    ...current,
    completedChapterIds,
    lastUnlockedChapterId: nextChapterId ?? current.lastUnlockedChapterId,
  }, scope);
}

export function saveStoryQuestionResponse(
  current: StoryProgress,
  response: StoryQuestionResponse,
  awardSpark: boolean,
  scope?: string | null,
): StoryProgress {
  const previous = current.responses[response.questionId];
  const alreadyAwarded = Boolean(previous?.correct);
  const currentSparks = current.storySparksByChapter[response.chapterId] ?? 0;
  return writeStoryProgress({
    ...current,
    responses: { ...current.responses, [response.questionId]: response },
    storySparksByChapter: {
      ...current.storySparksByChapter,
      [response.chapterId]: currentSparks + (awardSpark && !alreadyAwarded ? 1 : 0),
    },
  }, scope);
}

export function saveStoryChoice(current: StoryProgress, choiceId: string, option: string, scope?: string | null): StoryProgress {
  return writeStoryProgress({ ...current, choices: { ...current.choices, [choiceId]: option } }, scope);
}
