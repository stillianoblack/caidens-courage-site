import React, { useCallback } from 'react';
import { formatSelFocusLine } from '../../lib/adventureSelFocus';
import {
  isKidShellDisplayImageUrl,
  resolveHudThumbBackgroundStyle,
} from '../../lib/kidShellDisplayImages';
import { resolveWeeklyAdventureWeekAccent } from '../../lib/weeklyAdventureWeekAccent';
import type { WeeklyAdventureJourneyCardItem } from '../../lib/weeklyAdventureWeekCards';
import { useCourageHubAudio } from './CourageHubAudioContext';

type CourageHubHudExploreWeekStripProps = {
  cards: WeeklyAdventureJourneyCardItem[];
  selectedWeekNumber: number;
  baselineLocked?: boolean;
  onSelectWeek: (weekNumber: number) => void;
  onPillSelectWeek?: (weekNumber: number) => void;
  onReviewWeek: (weekNumber: number) => void;
  onLaunchWeek?: (weekNumber: number, source: 'week-card' | 'week-card-cta') => boolean;
};

function resolveMonthSlot(weekNumber: number): number {
  return ((Math.max(1, weekNumber) - 1) % 4) + 1;
}

function resolveStatusLabel(card: WeeklyAdventureJourneyCardItem, isSelected: boolean): string {
  if (card.variant === 'complete') return 'Complete';
  if (card.variant === 'locked') return 'Locked';
  if (isSelected) return 'Selected';
  if (card.variant === 'inProgress') return 'In Progress';
  return card.statusLabel === 'Selected' ? 'Available' : card.statusLabel || 'Available';
}

export default function CourageHubHudExploreWeekStrip({
  cards,
  selectedWeekNumber,
  baselineLocked = false,
  onSelectWeek,
  onPillSelectWeek,
  onReviewWeek,
  onLaunchWeek,
}: CourageHubHudExploreWeekStripProps) {
  const { playClick } = useCourageHubAudio();

  const isLaunchableCard = useCallback(
    (card: WeeklyAdventureJourneyCardItem) => {
      if (card.variant === 'locked' || card.disabled) return false;
      if (card.variant === 'complete') return false;
      if (baselineLocked && card.weekNumber !== 1) return false;
      return true;
    },
    [baselineLocked],
  );

  const tryLaunchWeek = useCallback(
    (card: WeeklyAdventureJourneyCardItem, source: 'week-card' | 'week-card-cta') => {
      if (!onLaunchWeek || !isLaunchableCard(card)) return false;
      return onLaunchWeek(card.weekNumber, source);
    },
    [isLaunchableCard, onLaunchWeek],
  );

  const handlePillSelect = useCallback(
    (card: WeeklyAdventureJourneyCardItem) => {
      if (card.variant === 'locked' || card.disabled) return;
      playClick();
      if (card.variant === 'complete') {
        onReviewWeek(card.weekNumber);
        return;
      }
      if (baselineLocked && card.weekNumber !== 1) return;

      const isSelected = card.weekNumber === selectedWeekNumber;
      if (!isSelected) {
        if (onPillSelectWeek) {
          onPillSelectWeek(card.weekNumber);
        } else {
          onSelectWeek(card.weekNumber);
        }
      }

      tryLaunchWeek(card, 'week-card');
    },
    [
      baselineLocked,
      onPillSelectWeek,
      onReviewWeek,
      onSelectWeek,
      playClick,
      selectedWeekNumber,
      tryLaunchWeek,
    ],
  );

  const handleCta = useCallback(
    (card: WeeklyAdventureJourneyCardItem, event: React.MouseEvent) => {
      event.stopPropagation();
      if (card.variant === 'locked' || card.disabled) return;
      playClick();
      if (card.variant === 'complete') {
        onReviewWeek(card.weekNumber);
        return;
      }
      if (baselineLocked && card.weekNumber !== 1) return;
      if (tryLaunchWeek(card, 'week-card-cta')) return;
      onSelectWeek(card.weekNumber);
    },
    [baselineLocked, onReviewWeek, onSelectWeek, playClick, tryLaunchWeek],
  );

  return (
    <ul className="courageHubHudStripRow courageHubHudStripRow--explore">
      {cards.map((card) => {
        const isSelected = card.weekNumber === selectedWeekNumber;
        const monthSlot = resolveMonthSlot(card.weekNumber);
        const weekAccent = resolveWeeklyAdventureWeekAccent(card.weekNumber);
        const selFocusLine = formatSelFocusLine(card.selFocus) ?? card.selFocus;
        const locked = card.variant === 'locked' || card.disabled;
        const complete = card.variant === 'complete';
        const statusLabel = resolveStatusLabel(card, isSelected);
        const ctaDisabled = locked || (baselineLocked && card.weekNumber !== 1);
        const hasThumbnail = isKidShellDisplayImageUrl(card.thumbnailUrl);

        return (
          <li key={card.weekNumber}>
            <article
              className={[
                'courageHubHudCard',
                'courageHubHudCard--explore',
                isSelected ? 'courageHubHudCard--selected' : '',
                complete ? 'courageHubHudCard--complete' : '',
                locked || (baselineLocked && card.weekNumber !== 1)
                  ? 'courageHubHudCard--locked'
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
              data-week-accent={weekAccent}
              role="button"
              tabIndex={locked ? -1 : 0}
              aria-pressed={isSelected}
              aria-disabled={locked}
              onClick={() => handlePillSelect(card)}
              onKeyDown={(event) => {
                if (locked) return;
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handlePillSelect(card);
                }
              }}
            >
              {hasThumbnail ? (
                <div
                  className="courageHubHudCardThumb courageHubHudCardThumb--explore courageHubHudCardThumb--hasImage"
                  style={resolveHudThumbBackgroundStyle(card.thumbnailUrl)}
                  aria-hidden="true"
                />
              ) : null}
              <div className="courageHubHudCardCopy">
                <p className="courageHubHudCardTitle">
                  Week {monthSlot} · {card.title}
                </p>
                {selFocusLine ? (
                  <p className="courageHubHudCardSub">SEL · {selFocusLine}</p>
                ) : null}
                <p className="courageHubHudCardStatus">{statusLabel}</p>
              </div>
              {complete ? (
                <span className="courageHubHudCardCheck" aria-hidden="true" />
              ) : null}
              <button
                type="button"
                className={[
                  'courageHubHudCardCta',
                  ctaDisabled ? 'courageHubHudCardCta--disabled' : '',
                  complete ? 'courageHubHudCardCta--review' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                disabled={ctaDisabled}
                onClick={(event) => handleCta(card, event)}
              >
                {card.ctaLabel}
              </button>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
