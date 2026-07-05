import React from 'react';
import ChapterCard from './ChapterCard';
import type { StoryChapter } from '../../data/storyMode';
import type { StoryProgress } from './storyProgress';

type StoryTimelineProps = {
  chapters: StoryChapter[];
  progress: StoryProgress;
  buildChapterHref: (chapterId: string) => string;
};

export default function StoryTimeline({
  chapters,
  progress,
  buildChapterHref,
}: StoryTimelineProps) {
  const unlockedIndex = chapters.findIndex(
    (chapter) => chapter.id === progress.lastUnlockedChapterId,
  );

  return (
    <section className="storyTimeline" aria-label="Story chapters">
      {chapters.map((chapter, index) => (
        <ChapterCard
          key={chapter.id}
          chapter={chapter}
          chapterNumber={index + 1}
          href={buildChapterHref(chapter.id)}
          locked={index > unlockedIndex}
          completed={progress.completedChapterIds.includes(chapter.id)}
        />
      ))}
    </section>
  );
}
