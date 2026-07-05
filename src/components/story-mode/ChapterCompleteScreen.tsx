import React from 'react';
import { Link } from 'react-router-dom';
import type { StoryChapter } from '../../data/storyMode';

type ChapterCompleteScreenProps = {
  chapter: StoryChapter;
  nextChapterHref?: string;
  timelineHref: string;
};

export default function ChapterCompleteScreen({
  chapter,
  nextChapterHref,
  timelineHref,
}: ChapterCompleteScreenProps) {
  return (
    <section className="storyCompleteScreen">
      <span>Chapter Complete</span>
      <h1>{chapter.title}</h1>
      <p>
        Reflection, challenge, and reward stay connected to this mission path:
        {' '}
        {chapter.reflectionId}, {chapter.challengeId}, {chapter.rewardId}.
      </p>
      <div className="storyCompleteScreen__actions">
        {nextChapterHref ? <Link to={nextChapterHref}>Next Chapter</Link> : null}
        <Link to={timelineHref}>Chapter Timeline</Link>
      </div>
    </section>
  );
}
