import React from 'react';
import { openAskB4 } from '../../lib/openAskB4';
import type { B4Recommendation } from '../../lib/pilotOverviewInsights';

type PilotB4RecommendationCardProps = {
  recommendation: B4Recommendation;
};

export default function PilotB4RecommendationCard({ recommendation }: PilotB4RecommendationCardProps) {
  return (
    <section className="pilot-overviewMiniCard pilot-overviewMiniCard--b4">
      <h3 className="pilot-overviewMiniCardTitle">B-4 Recommendation</h3>
      <p className="pilot-overviewMiniCardCopy">{recommendation.message}</p>
      <button type="button" className="pilot-overviewMiniCardCta" onClick={() => openAskB4()}>
        {recommendation.cta}
      </button>
    </section>
  );
}
