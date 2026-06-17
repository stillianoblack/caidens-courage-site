import React, { useMemo } from 'react';
import FocusCoinIcon from '../../../components/rewards/FocusCoinIcon';
import type { CinematicMissionPlayerRewardMeta } from '../../../lib/cinematicMissionPlayerReward';

type CinematicMissionPlayerRewardCardProps = CinematicMissionPlayerRewardMeta;

function resolveInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
}

function parseProgressPercent(label: string | null): number | null {
  if (!label) return null;
  const match = label.match(/(\d{1,3})\s*%/);
  if (!match) return null;
  const value = Number.parseInt(match[1], 10);
  return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : null;
}

/** Mission-screen player + reward summary — compact game HUD chips. */
export default function CinematicMissionPlayerRewardCard({
  displayName,
  focusCoins,
  focusCoinsLoading = false,
  weekLabel,
  missionCoinReward,
  weeklyBadgeLabel,
  progressLabel,
}: CinematicMissionPlayerRewardCardProps) {
  const progressPct = useMemo(() => parseProgressPercent(progressLabel), [progressLabel]);

  return (
    <section className="cinematicMissionPlayerRewardCard" aria-label="Player and mission rewards">
      <div className="cinematicMissionPlayerRewardCardHud">
        <div className="cinematicMissionPlayerRewardCardAvatar" aria-hidden="true">
          {resolveInitial(displayName)}
        </div>
        <div className="cinematicMissionPlayerRewardCardHudCopy">
          <p className="cinematicMissionPlayerRewardCardEyebrow">Playing as</p>
          <p className="cinematicMissionPlayerRewardCardName">{displayName}</p>
          {weekLabel ? <p className="cinematicMissionPlayerRewardCardWeek">{weekLabel}</p> : null}
        </div>
        <div className="cinematicMissionPlayerRewardCardCoins" aria-label={`${focusCoins} Focus Coins`}>
          <FocusCoinIcon size={14} className="cinematicMissionPlayerRewardCardCoinIconSvg" />
          <span className="cinematicMissionPlayerRewardCardCoinValue">
            {focusCoinsLoading ? '…' : focusCoins.toLocaleString()}
          </span>
        </div>
      </div>

      <ul className="cinematicMissionPlayerRewardCardChips">
        {missionCoinReward ? (
          <li className="cinematicMissionPlayerRewardCardChip">
            <span className="cinematicMissionPlayerRewardCardChipIcon cinematicMissionPlayerRewardCardChipIcon--coin" aria-hidden="true">
              <FocusCoinIcon size={13} />
            </span>
            <span className="cinematicMissionPlayerRewardCardChipCopy">
              <span className="cinematicMissionPlayerRewardCardChipLabel">Mission reward</span>
              <span className="cinematicMissionPlayerRewardCardChipValue">{missionCoinReward}</span>
            </span>
          </li>
        ) : null}
        {weeklyBadgeLabel ? (
          <li className="cinematicMissionPlayerRewardCardChip">
            <span
              className="cinematicMissionPlayerRewardCardChipIcon cinematicMissionPlayerRewardCardChipIcon--badge"
              aria-hidden="true"
            />
            <span className="cinematicMissionPlayerRewardCardChipCopy">
              <span className="cinematicMissionPlayerRewardCardChipLabel">Weekly badge</span>
              <span className="cinematicMissionPlayerRewardCardChipValue">{weeklyBadgeLabel}</span>
            </span>
          </li>
        ) : null}
        {progressLabel ? (
          <li className="cinematicMissionPlayerRewardCardChip">
            <span
              className="cinematicMissionPlayerRewardCardChipIcon cinematicMissionPlayerRewardCardChipIcon--progress"
              aria-hidden="true"
              style={
                progressPct != null
                  ? ({ '--cinematic-progress-pct': `${progressPct}%` } as React.CSSProperties)
                  : undefined
              }
            />
            <span className="cinematicMissionPlayerRewardCardChipCopy">
              <span className="cinematicMissionPlayerRewardCardChipLabel">Progress</span>
              <span className="cinematicMissionPlayerRewardCardChipValue">{progressLabel}</span>
            </span>
          </li>
        ) : null}
      </ul>
    </section>
  );
}
