import React from 'react';
import { ENABLE_B4_CHAT } from '../../config/featureFlags';
import { openAskB4 } from '../../lib/openAskB4';
import type { B4Recommendation } from '../../lib/pilotOverviewInsights';

type PilotB4RecommendationCardProps = {
  recommendation: B4Recommendation;
  onOpenInsights?: () => void;
};

export default function PilotB4RecommendationCard({
  recommendation,
  onOpenInsights,
}: PilotB4RecommendationCardProps) {
  const handleClick = () => {
    if (ENABLE_B4_CHAT) {
      openAskB4();
      return;
    }
    onOpenInsights?.();
  };

  if (!ENABLE_B4_CHAT && !onOpenInsights) {
    return null;
  }

  return (
    <section className="pilot-overviewMiniCard pilot-overviewMiniCard--b4">
      <h3 className="pilot-overviewMiniCardTitle">B-4 Insight</h3>
      <p className="pilot-overviewMiniCardCopy">{recommendation.message}</p>
      <button type="button" className="pilot-overviewMiniCardCta" onClick={handleClick}>
        {ENABLE_B4_CHAT ? recommendation.cta : 'View B-4 Insights'}
      </button>
    </section>
  );
}
