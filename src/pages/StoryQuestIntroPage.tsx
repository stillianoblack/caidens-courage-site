import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { readStoryProgress } from '../components/story-mode/storyProgress';
import { STORY_MODE_PATH } from '../config/courageRoutes';
import { useKidPlaySession } from '../context/KidPlaySessionContext';
import { STORY_CHAPTERS } from '../data/storyMode';
import { useActiveParticipant } from '../hooks/useActiveParticipant';
import { getKidPlayShellRoute, parseKidPlayShellPath } from '../lib/kidPlayShellRoutes';
import './story-quest-intro.css';

type StoryQuestIntroPageProps = {
  storyBasePathOverride?: string;
};

export default function StoryQuestIntroPage({ storyBasePathOverride }: StoryQuestIntroPageProps = {}) {
  const location = useLocation();
  const kidSession = useKidPlaySession();
  const activeParticipant = useActiveParticipant();
  const shellContext = parseKidPlayShellPath(location.pathname);
  const storyBasePath = storyBasePathOverride ?? (shellContext
    ? `${getKidPlayShellRoute(shellContext.sessionId, 'arcade')}/story`
    : STORY_MODE_PATH);
  const arcadePath = storyBasePath.endsWith('/story') ? storyBasePath.slice(0, -6) : '/kids/games';
  const participantId = activeParticipant.participantId || kidSession?.session.child_id || '';
  const progressScope = participantId || kidSession?.sessionId || 'guest';
  const progress = useMemo(() => readStoryProgress(progressScope), [progressScope]);
  const responseCount = Object.keys(progress.responses).length;
  const hasProgress = responseCount > 0 || progress.completedChapterIds.length > 0;
  const chapterIndex = Math.max(0, STORY_CHAPTERS.findIndex(({ id }) => id === progress.lastUnlockedChapterId));
  const targetChapterId = progress.lastUnlockedChapterId || STORY_CHAPTERS[0]?.id || 'chapter-1';

  return (
    <main className="storyQuestIntro">
      <div className="storyQuestIntro__overlay" />
      <section className="storyQuestIntro__card" aria-labelledby="story-quest-intro-title">
        <p className="storyQuestIntro__eyebrow">Story Quest</p>
        <h1 id="story-quest-intro-title">Think you know Caiden’s story?</h1>
        <p className="storyQuestIntro__body">
          Follow the clues, test your memory, and see how many Story Sparks you can earn.
        </p>
        <p className="storyQuestIntro__progress">
          {hasProgress
            ? `Chapter ${chapterIndex + 1} of ${STORY_CHAPTERS.length} · ${responseCount} questions answered`
            : '5 questions per chapter'}
        </p>
        <div className="storyQuestIntro__actions">
          <Link className="storyQuestIntro__primary" to={`${storyBasePath}/${targetChapterId}`}>
            {hasProgress ? 'Continue Story Quest' : 'Start Story Quest'}
          </Link>
          <Link className="storyQuestIntro__secondary" to={arcadePath}>Back to Arcade</Link>
        </div>
      </section>
    </main>
  );
}
