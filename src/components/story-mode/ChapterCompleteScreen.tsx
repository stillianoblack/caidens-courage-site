import React from 'react';
import { Link } from 'react-router-dom';
import type { StoryChapter } from '../../data/storyMode';

type ChapterCompleteScreenProps = {
  chapter: StoryChapter;
  nextChapterHref?: string;
  arcadeHref: string;
  chapterNumber: number;
  correctCount: number;
  totalQuestions: number;
  message?: string;
};

export default function ChapterCompleteScreen({
  chapter,
  nextChapterHref,
  arcadeHref,
  chapterNumber,
  correctCount,
  totalQuestions,
  message = 'Nice work. You remembered what Caiden faced when his adventure began.',
}: ChapterCompleteScreenProps) {
  return (
    <section className="storyCompleteScreen">
      <span>Chapter {chapterNumber} Complete</span>
      <h1>{chapter.title}</h1>
      <p>{correctCount} / {totalQuestions} Story Questions</p>
      <div className="storyCompleteScreen__message">
        <img src="/images/Choose-Your-Guide/B-4student.webp" alt="B-4" />
        <p>{message}</p>
      </div>
      <div className="storyCompleteScreen__actions">
        {nextChapterHref ? <Link to={nextChapterHref}>Next Chapter</Link> : null}
        <Link to={arcadeHref}>Back to Arcade</Link>
      </div>
    </section>
  );
}
