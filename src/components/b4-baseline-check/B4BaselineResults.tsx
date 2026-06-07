import React, { useEffect, useState } from 'react';
import { B4Avatar } from './B4BaselineTopBar';
import { B4_BASELINE_FINAL } from '../../data/b4BaselineCheckContent';
import type { B4BaselineCheckRecord } from '../../lib/b4BaselineCheckStorage';

type B4BaselineResultsProps = {
  record: B4BaselineCheckRecord;
  syncMessage?: string | null;
  onBackToHub: () => void;
  onRetake: () => void;
  onRevealScore?: (index: 0 | 1 | 2) => void;
};

function formatCompletedDate(iso: string): string {
  if (!iso) return 'Not yet completed';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

const SCORE_BLOCKS = [
  { key: 'feelings' as const, label: 'Feelings Check', max: 50, field: 'feelingsScore' as const },
  { key: 'reading' as const, label: 'Reading Check', max: 5, field: 'readingScore' as const },
  { key: 'focus' as const, label: 'Focus Moves', max: 5, field: 'focusMovesScore' as const },
];

export default function B4BaselineResults({
  record,
  syncMessage,
  onBackToHub,
  onRetake,
  onRevealScore,
}: B4BaselineResultsProps) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    setVisibleCount(0);
    const timers: ReturnType<typeof setTimeout>[] = [];

    SCORE_BLOCKS.forEach((_, index) => {
      timers.push(
        setTimeout(() => {
          setVisibleCount(index + 1);
          onRevealScore?.(index as 0 | 1 | 2);
        }, (index + 1) * 2000),
      );
    });

    return () => timers.forEach(clearTimeout);
  }, [record.completedAt, onRevealScore]);

  return (
    <div className="bbc-resultPanel bbc-resultPanel--detailed">
      <B4Avatar size="hero" />
      <h2 className="bbc-title">{B4_BASELINE_FINAL.title}</h2>
      <p className="bbc-body">{B4_BASELINE_FINAL.copy}</p>

      <div className="bbc-scoreGrid" role="list">
        {SCORE_BLOCKS.map((block, index) => {
          const visible = index < visibleCount;
          return (
            <div
              key={block.key}
              role="listitem"
              className={`bbc-scoreCard${visible ? ' bbc-scoreCard--visible' : ''}`}
              aria-hidden={!visible}
            >
              <p className="bbc-scoreLabel">{block.label}</p>
              <p className="bbc-scoreValue">
                {record[block.field]}
                <span className="bbc-scoreMax"> / {block.max}</span>
              </p>
            </div>
          );
        })}
      </div>

      <p className="bbc-resultMeta">
        <strong>Completed:</strong> {formatCompletedDate(record.completedAt)}
      </p>
      {record.nickname ? (
        <p className="bbc-resultMeta">
          <strong>Saved for:</strong> {record.nickname}
        </p>
      ) : null}
      <p className="bbc-deviceNote" role="status">
        {syncMessage ?? 'Saved on this device. Online pilot sync is unavailable right now.'}
      </p>

      <div className="bbc-finalBadge" role="status">
        ✦ Focus Flame Baseline Saved
      </div>

      <div className="bbc-resultActions">
        <button type="button" className="bbc-primaryBtn" onClick={onBackToHub}>
          Back to Hub
        </button>
        <button type="button" className="bbc-secondaryBtn" onClick={onRetake}>
          Retake Baseline
        </button>
      </div>
    </div>
  );
}
