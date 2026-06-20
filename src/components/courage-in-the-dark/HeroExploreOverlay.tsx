import React, { useMemo, useState } from 'react';
import { formatSelFocusLine } from '../../lib/adventureSelFocus';
import { isKidShellDisplayImageUrl } from '../../lib/kidShellDisplayImages';
import { resolveWeeklyAdventureWeekAccent } from '../../lib/weeklyAdventureWeekAccent';
import type { WeeklyAdventureJourneyCardItem } from '../../lib/weeklyAdventureWeekCards';
import './hero-explore-overlay.css';

export type HeroExploreOverlayLayout = 'overlay' | 'stacked';

type HeroExploreOverlayProps = {
  cards: WeeklyAdventureJourneyCardItem[];
  selectedWeekNumber: number;
  onSelectWeek: (weekNumber: number) => void;
  onReviewWeek: (weekNumber: number) => void;
  layout: HeroExploreOverlayLayout;
  className?: string;
};

function WeekRowThumb({ src }: { src?: string | null }) {
  const [failed, setFailed] = useState(false);
  if (!isKidShellDisplayImageUrl(src) || failed) return null;
  return (
    <span className="heroExploreOverlayWeekThumbWrap">
      <img
        src={src}
        alt=""
        className="heroExploreOverlayWeekThumb"
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    </span>
  );
}

export default function HeroExploreOverlay({
  cards,
  selectedWeekNumber,
  onSelectWeek,
  onReviewWeek,
  layout,
  className = '',
}: HeroExploreOverlayProps) {
  const selectedCard = useMemo(
    () => cards.find((card) => card.weekNumber === selectedWeekNumber) ?? cards[0] ?? null,
    [cards, selectedWeekNumber],
  );

  const handleWeekRowClick = (card: WeeklyAdventureJourneyCardItem) => {
    if (card.variant === 'locked' || card.disabled) return;
    onSelectWeek(card.weekNumber);
  };

  const handleCta = () => {
    if (!selectedCard) return;
    if (selectedCard.variant === 'complete') {
      onReviewWeek(selectedCard.weekNumber);
      return;
    }
    if (selectedCard.variant === 'locked' || selectedCard.disabled) return;
    onSelectWeek(selectedCard.weekNumber);
  };

  const selFocusLine = selectedCard
    ? formatSelFocusLine(selectedCard.selFocus) ?? selectedCard.selFocus
    : null;

  return (
    <div
      className={[
        'heroExploreOverlay',
        layout === 'overlay' ? 'heroExploreOverlay--onMap' : 'heroExploreOverlay--stacked',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="region"
      aria-label="Explore weekly adventures"
    >
      <div className="heroExploreOverlayPanel">
        <h3 className="heroExploreOverlayTitle">Explore Weekly Adventures</h3>

        <div className="heroExploreOverlayBody">
          <ul className="heroExploreOverlayWeekList" aria-label="Weeks in this month">
            {cards.map((card) => {
              const isActive = card.weekNumber === selectedWeekNumber;
              const weekAccent = resolveWeeklyAdventureWeekAccent(card.weekNumber);
              const pillVariant =
                isActive && card.variant === 'available' ? 'selected' : card.variant;

              return (
                <li key={card.weekNumber}>
                  <button
                    type="button"
                    className={[
                      'heroExploreOverlayWeekRow',
                      isActive ? 'heroExploreOverlayWeekRow--active' : '',
                      card.variant === 'locked' ? 'heroExploreOverlayWeekRow--locked' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    data-week-accent={weekAccent}
                    onClick={() => handleWeekRowClick(card)}
                    disabled={card.variant === 'locked' || card.disabled}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    <span className="heroExploreOverlayWeekBadge">W{card.weekNumber}</span>
                    <WeekRowThumb src={card.thumbnailUrl} />
                    <span className="heroExploreOverlayWeekCopy">
                      <span className="heroExploreOverlayWeekTitle">{card.title}</span>
                      <span className="heroExploreOverlayWeekSel">
                        {formatSelFocusLine(card.selFocus) ?? card.selFocus}
                      </span>
                    </span>
                    <span className={`heroExploreOverlayWeekPill heroExploreOverlayWeekPill--${pillVariant}`}>
                      {card.statusLabel}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {selectedCard ? (
            <div
              className="heroExploreOverlayDetail"
              data-week-accent={resolveWeeklyAdventureWeekAccent(selectedCard.weekNumber)}
            >
              <p className="heroExploreOverlayDetailEyebrow">Week {selectedCard.weekNumber}</p>
              <h4 className="heroExploreOverlayDetailTitle">{selectedCard.title}</h4>
              {selFocusLine ? (
                <p className="heroExploreOverlayDetailSel">{selFocusLine}</p>
              ) : null}
              {selectedCard.description ? (
                <p className="heroExploreOverlayDetailDesc">{selectedCard.description}</p>
              ) : null}

              <p className="heroExploreOverlayDetailReward">{selectedCard.rewardPreview}</p>

              <ul className="heroExploreOverlayDetailStats" aria-label="Week content summary">
                {selectedCard.missionsCount != null && selectedCard.missionsCount > 0 ? (
                  <li>{selectedCard.missionsCount} missions</li>
                ) : null}
                {selectedCard.activitiesCount != null && selectedCard.activitiesCount > 0 ? (
                  <li>{selectedCard.activitiesCount} activities</li>
                ) : null}
                {selectedCard.downloadsCount != null && selectedCard.downloadsCount > 0 ? (
                  <li>{selectedCard.downloadsCount} downloads</li>
                ) : null}
              </ul>

              <button
                type="button"
                className={[
                  'heroExploreOverlayCta',
                  selectedCard.variant === 'complete'
                    ? 'heroExploreOverlayCta--complete'
                    : '',
                  selectedCard.variant === 'locked' ? 'heroExploreOverlayCta--locked' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={handleCta}
                disabled={selectedCard.variant === 'locked' || selectedCard.disabled}
              >
                {selectedCard.ctaLabel}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
