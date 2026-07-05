import React from 'react';
import { Link } from 'react-router-dom';
import type { StoryChapter } from '../../data/storyMode';

type ChapterCardProps = {
  chapter: StoryChapter;
  chapterNumber: number;
  href: string;
  locked?: boolean;
  completed?: boolean;
};

export default function ChapterCard({
  chapter,
  chapterNumber,
  href,
  locked = false,
  completed = false,
}: ChapterCardProps) {
  const status = completed ? 'Complete' : locked ? 'Locked' : 'Unlocked';

  return (
    <article className={`storyChapterCard ${locked ? 'storyChapterCard--locked' : ''}`}>
      <img className="storyChapterCard__image" src={chapter.coverImage} alt="" loading="lazy" />
      <div className="storyChapterCard__body">
        <span className="storyChapterCard__eyebrow">Chapter {chapterNumber}</span>
        <h3>{chapter.title}</h3>
        <p>{chapter.description}</p>
        <div className="storyChapterCard__footer">
          <span>{status}</span>
          {locked ? (
            <button type="button" disabled>
              Locked
            </button>
          ) : (
            <Link to={href}>{completed ? 'Replay Chapter' : 'Start Chapter'}</Link>
          )}
        </div>
      </div>
    </article>
  );
}
