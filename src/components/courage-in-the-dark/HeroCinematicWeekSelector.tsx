import React, { useMemo } from 'react';
import { formatSelFocusLine } from '../../lib/adventureSelFocus';
import { resolveWeeklyAdventureWeekAccent } from '../../lib/weeklyAdventureWeekAccent';
import type { WeeklyAdventureJourneyCardItem } from '../../lib/weeklyAdventureWeekCards';
import { useCourageHubAudio } from './CourageHubAudioContext';
import './hero-cinematic-week-selector.css';

export type HeroCinematicWeekSelectorLayout = 'lowerThird' | 'stacked';

type HeroCinematicWeekSelectorProps = {
  cards: WeeklyAdventureJourneyCardItem[];
  selectedWeekNumber: number;
  onSelectWeek: (weekNumber: number) => void;
  onReviewWeek: (weekNumber: number) => void;
  layout: HeroCinematicWeekSelectorLayout;
  className?: string;
};

function resolveMonthSlot(weekNumber: number): number {
  return ((Math.max(1, weekNumber) - 1) % 4) + 1;
}

function resolveChipStatus(
  card: WeeklyAdventureJourneyCardItem,
  isSelected: boolean,
): 'complete' | 'selected' | 'inProgress' | 'available' | 'locked' {
  if (card.variant === 'complete') return 'complete';
  if (card.variant === 'locked') return 'locked';
  if (isSelected) return 'selected';
  if (card.variant === 'inProgress') return 'inProgress';
  return 'available';
}

function resolveCinematicCtaLabel(card: WeeklyAdventureJourneyCardItem): string {
  if (card.variant === 'complete') return 'Review';
  if (card.variant === 'locked') {
    const label = card.statusLabel.toLowerCase();
    if (label.includes('soon') || label.includes('coming')) return 'Soon';
    return 'Locked';
  }
  if (card.variant === 'inProgress') return 'Continue';
  if (card.variant === 'adminPreview') return 'Preview';
  return 'Start';
}

export default function HeroCinematicWeekSelector({
  cards,
  selectedWeekNumber,
  onSelectWeek,
  onReviewWeek,
  layout,
  className = '',
}: HeroCinematicWeekSelectorProps) {
  const { playClick } = useCourageHubAudio();
  const selectedCard = useMemo(
    () => cards.find((card) => card.weekNumber === selectedWeekNumber) ?? cards[0] ?? null,
    [cards, selectedWeekNumber],
  );

  const handleWeekChipClick = (card: WeeklyAdventureJourneyCardItem) => {
    if (card.variant === 'locked' || card.disabled) return;
    playClick();
    onSelectWeek(card.weekNumber);
  };

  const handleCta = () => {
    if (!selectedCard) return;
    playClick();
    if (selectedCard.variant === 'complete') {
      onReviewWeek(selectedCard.weekNumber);
      return;
    }
    if (selectedCard.variant === 'locked' || selectedCard.disabled) return;
    onSelectWeek(selectedCard.weekNumber);
  };

  if (!selectedCard) return null;

  const monthSlot = resolveMonthSlot(selectedCard.weekNumber);
  const weekAccent = resolveWeeklyAdventureWeekAccent(selectedCard.weekNumber);
  const selFocusLine = formatSelFocusLine(selectedCard.selFocus) ?? selectedCard.selFocus;
  const ctaLabel = resolveCinematicCtaLabel(selectedCard);
  const ctaDisabled = selectedCard.variant === 'locked' || selectedCard.disabled;

  return (
    <div
      className={[
        'heroCinematicWeekSelector',
        layout === 'lowerThird' ? 'heroCinematicWeekSelector--lowerThird' : 'heroCinematicWeekSelector--stacked',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="region"
      aria-label="Weekly adventure episode selector"
    >
      <div className="heroCinematicWeekSelectorCard" data-week-accent={weekAccent}>
        <div className="heroCinematicWeekSelectorRow">
          <p className="heroCinematicWeekSelectorEyebrow">Week {monthSlot}</p>
          <h3 className="heroCinematicWeekSelectorTitle">{selectedCard.title}</h3>
          {selFocusLine ? (
            <p className="heroCinematicWeekSelectorSel">SEL · {selFocusLine}</p>
          ) : null}
          <p className="heroCinematicWeekSelectorReward">{selectedCard.rewardPreview}</p>

          <button
            type="button"
            className={[
              'heroCinematicWeekSelectorCta',
              selectedCard.variant === 'complete' ? 'heroCinematicWeekSelectorCta--complete' : '',
              ctaDisabled ? 'heroCinematicWeekSelectorCta--locked' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={handleCta}
            disabled={ctaDisabled}
          >
            {ctaLabel}
          </button>

          <div className="heroCinematicWeekSelectorChips" role="group" aria-label="Select week">
            {cards.map((card) => {
              const isActive = card.weekNumber === selectedWeekNumber;
              const chipSlot = resolveMonthSlot(card.weekNumber);
              const chipStatus = resolveChipStatus(card, isActive);
              const chipAccent = resolveWeeklyAdventureWeekAccent(card.weekNumber);

              return (
                <button
                  key={card.weekNumber}
                  type="button"
                  className={[
                    'heroCinematicWeekChip',
                    `heroCinematicWeekChip--${chipStatus}`,
                    isActive ? 'heroCinematicWeekChip--active' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  data-week-accent={chipAccent}
                  onClick={() => handleWeekChipClick(card)}
                  disabled={card.variant === 'locked' || card.disabled}
                  aria-current={isActive ? 'true' : undefined}
                  aria-label={`Week ${chipSlot}, ${card.title}, ${card.statusLabel}`}
                >
                  <span className="heroCinematicWeekChipLabel">W{chipSlot}</span>
                  <span className="heroCinematicWeekChipIcon" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
