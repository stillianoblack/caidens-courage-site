import { DRAGONS_NEST_CAMPAIGN } from './dragonNestCampaign';

export {
  DRAGONS_NEST_CAMPAIGN,
  getQuestionVariant,
  resolveStoryQuestGradeBand,
  type StoryChapter,
  type StoryComicPanel,
  type StoryChoice,
  type StoryDialogueLine,
  type StoryQuestionCategory,
  type StoryQuestionVariant,
  type StoryQuestCampaign,
  type StoryQuestGradeBand,
  type StoryQuestQuestion,
} from './dragonNestCampaign';

export const STORY_CHAPTERS = DRAGONS_NEST_CAMPAIGN.chapters;

export function getStoryChapterById(chapterId: string | undefined) {
  if (!chapterId) return undefined;
  return STORY_CHAPTERS.find((chapter) => chapter.id === chapterId);
}

export function getStoryChapterIndex(chapterId: string | undefined): number {
  if (!chapterId) return -1;
  return STORY_CHAPTERS.findIndex((chapter) => chapter.id === chapterId);
}

export function getNextStoryChapter(chapterId: string | undefined) {
  const index = getStoryChapterIndex(chapterId);
  return index < 0 ? undefined : STORY_CHAPTERS[index + 1];
}

export function getStoryQuestionsForChapter(chapterId: string) {
  return DRAGONS_NEST_CAMPAIGN.questions.filter((question) => question.chapterId === chapterId);
}
