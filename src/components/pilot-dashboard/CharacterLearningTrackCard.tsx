import React from 'react';
import { useNavigate } from 'react-router-dom';
import type {
  PilotCharacterTrackMetric,
  PilotCharacterTrackId,
} from '../../data/pilotDashboardContent';

type CharacterLearningTrackCardProps = {
  id: PilotCharacterTrackId;
  name: string;
  track: string;
  imageSrc: string;
  previewHref: string;
  metrics: PilotCharacterTrackMetric[];
  baselineChecksCompleted?: number;
};

function resolveMetricValue(
  metric: PilotCharacterTrackMetric,
  baselineChecksCompleted: number,
): string {
  if (metric.metricKey === 'baselineChecksCompleted') {
    return String(baselineChecksCompleted);
  }
  if (metric.placeholder) {
    return '—';
  }
  return metric.value ?? '—';
}

export default function CharacterLearningTrackCard({
  name,
  track,
  imageSrc,
  previewHref,
  metrics,
  baselineChecksCompleted = 0,
}: CharacterLearningTrackCardProps) {
  const navigate = useNavigate();

  const openPreview = () => {
    navigate(previewHref);
  };

  return (
    <article className="pilot-characterTrackCard">
      <button type="button" className="pilot-characterTrackMain" onClick={openPreview}>
        <img
          src={imageSrc}
          alt=""
          className="pilot-characterTrackAvatar"
          width={56}
          height={56}
          loading="lazy"
        />
        <div className="pilot-characterTrackBody">
          <p className="pilot-characterTrackName">{name}</p>
          <p className="pilot-characterTrackLabel">{track}</p>
        </div>
      </button>

      <ul className="pilot-characterTrackMetrics" aria-label={`${name} progress summary`}>
        {metrics.map((metric) => (
          <li key={metric.label} className="pilot-characterTrackMetric">
            <span className="pilot-characterTrackMetricLabel">{metric.label}</span>
            <span
              className={`pilot-characterTrackMetricValue${metric.placeholder ? ' pilot-characterTrackMetricValue--placeholder' : ''}`}
            >
              {resolveMetricValue(metric, baselineChecksCompleted)}
            </span>
          </li>
        ))}
      </ul>

      <div className="pilot-characterTrackActions">
        <button type="button" className="pilot-characterTrackBtn" onClick={openPreview}>
          Preview
        </button>
      </div>
    </article>
  );
}
