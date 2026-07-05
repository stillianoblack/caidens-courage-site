import chaptersJson from './chapters.json';

export type StoryComicPanel = {
  id: string;
  image: string;
  alt: string;
  narration: string;
};

export type StoryDialogueLine = {
  id: string;
  characterName: string;
  portrait: string;
  text: string;
};

export type StoryChoice = {
  id: string;
  prompt: string;
  options: string[];
};

export type StoryChapter = {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  comicPanels: StoryComicPanel[];
  dialogue: StoryDialogueLine[];
  choice: StoryChoice;
  missionId: string;
  reflectionId: string;
  challengeId: string;
  rewardId: string;
};

export const STORY_CHAPTERS = chaptersJson as StoryChapter[];

export function getStoryChapterById(chapterId: string | undefined): StoryChapter | undefined {
  if (!chapterId) return undefined;
  return STORY_CHAPTERS.find((chapter) => chapter.id === chapterId);
}

export function getStoryChapterIndex(chapterId: string | undefined): number {
  if (!chapterId) return -1;
  return STORY_CHAPTERS.findIndex((chapter) => chapter.id === chapterId);
}

export function getNextStoryChapter(chapterId: string | undefined): StoryChapter | undefined {
  const index = getStoryChapterIndex(chapterId);
  if (index < 0) return undefined;
  return STORY_CHAPTERS[index + 1];
}
