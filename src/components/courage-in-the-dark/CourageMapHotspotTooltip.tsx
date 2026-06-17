import React from 'react';
import type { CourageInTheDarkMission } from '../../data/courageInTheDarkMap';

type CourageMapHotspotTooltipProps = {
  hotspot: CourageInTheDarkMission;
  complete: boolean;
  locked: boolean;
  lockedReason?: string;
  style: React.CSSProperties;
};

function resolveRewardLine(rewardText: string): string {
  const coinMatch = rewardText.match(/\+?\d+\s+Focus Coins?/i);
  return coinMatch?.[0] ?? rewardText.split('•')[0]?.trim() ?? rewardText;
}

export default function CourageMapHotspotTooltip({
  hotspot,
  complete,
  locked,
  lockedReason,
  style,
}: CourageMapHotspotTooltipProps) {
  const ctaLine = locked
    ? lockedReason ?? 'Locked'
    : complete
      ? 'Click to replay'
      : 'Click to start';

  return (
    <div
      className={[
        'courageMapHotspotTooltip',
        locked ? 'courageMapHotspotTooltip--locked' : '',
        complete ? 'courageMapHotspotTooltip--complete' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
      role="tooltip"
      id={`courage-map-hotspot-tip-${hotspot.id}`}
    >
      <p className="courageMapHotspotTooltipEyebrow">{hotspot.characterName}</p>
      <p className="courageMapHotspotTooltipTitle">{hotspot.label}</p>
      {!locked ? (
        <p className="courageMapHotspotTooltipReward">{resolveRewardLine(hotspot.rewardText)}</p>
      ) : null}
      <p className="courageMapHotspotTooltipCta">{ctaLine}</p>
    </div>
  );
}
