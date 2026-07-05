import { STORY_CHAPTERS } from '../../data/storyMode';

const STORAGE_KEY = 'caidens-courage.story-mode.progress.v1';

export type StoryProgress = {
  lastUnlockedChapterId: string;
  completedChapterIds: string[];
  choices: Record<string, string>;
};

const firstChapterId = STORY_CHAPTERS[0]?.id ?? 'chapter-1';

const defaultProgress: StoryProgress = {
  lastUnlockedChapterId: firstChapterId,
  completedChapterIds: [],
  choices: {},
};

function normalizeProgress(progress: Partial<StoryProgress> | null): StoryProgress {
  const validChapterIds = new Set(STORY_CHAPTERS.map((chapter) => chapter.id));
  const completedChapterIds = progress?.completedChapterIds;
  const lastUnlockedChapterId =
    progress?.lastUnlockedChapterId && validChapterIds.has(progress.lastUnlockedChapterId)
      ? progress.lastUnlockedChapterId
      : firstChapterId;

  return {
    lastUnlockedChapterId,
    completedChapterIds: Array.isArray(completedChapterIds)
      ? completedChapterIds.filter((id) => validChapterIds.has(id))
      : [],
    choices: progress?.choices && typeof progress.choices === 'object' ? progress.choices : {},
  };
}

export function readStoryProgress(): StoryProgress {
  if (typeof window === 'undefined') return defaultProgress;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return normalizeProgress(stored ? (JSON.parse(stored) as Partial<StoryProgress>) : null);
  } catch {
    return defaultProgress;
  }
}

export function writeStoryProgress(progress: StoryProgress): StoryProgress {
  const normalized = normalizeProgress(progress);

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    } catch {
      return normalized;
    }
  }

  return normalized;
}

export function unlockStoryChapter(current: StoryProgress, chapterId: string): StoryProgress {
  const chapterIndex = STORY_CHAPTERS.findIndex((chapter) => chapter.id === chapterId);
  const unlockedIndex = STORY_CHAPTERS.findIndex(
    (chapter) => chapter.id === current.lastUnlockedChapterId,
  );

  if (chapterIndex <= unlockedIndex) return current;
  return writeStoryProgress({ ...current, lastUnlockedChapterId: chapterId });
}

export function completeStoryChapter(
  current: StoryProgress,
  chapterId: string,
  nextChapterId?: string,
): StoryProgress {
  const completedChapterIds = current.completedChapterIds.includes(chapterId)
    ? current.completedChapterIds
    : [...current.completedChapterIds, chapterId];

  return writeStoryProgress({
    ...current,
    completedChapterIds,
    lastUnlockedChapterId: nextChapterId ?? current.lastUnlockedChapterId,
  });
}

export function saveStoryChoice(
  current: StoryProgress,
  choiceId: string,
  option: string,
): StoryProgress {
  return writeStoryProgress({
    ...current,
    choices: {
      ...current.choices,
      [choiceId]: option,
    },
  });
}
