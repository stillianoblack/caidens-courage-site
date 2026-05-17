import React, { useEffect, useState } from 'react';

export default function StepMicroFeedback({
  headline,
  message,
  points,
  triggerKey,
}: {
  headline?: string | null;
  message?: string | null;
  points?: number | null;
  triggerKey?: number;
}) {
  const [showPoints, setShowPoints] = useState(false);

  useEffect(() => {
    if (points == null || points <= 0 || triggerKey == null) {
      setShowPoints(false);
      return;
    }
    setShowPoints(true);
    const t = window.setTimeout(() => setShowPoints(false), 1100);
    return () => window.clearTimeout(t);
  }, [points, triggerKey]);

  if (!headline && !message && !showPoints) return null;

  return (
    <div className="ffl-selStep-feedback">
      {headline ? (
        <p className="ffl-selStep-nice" aria-live="polite">
          {headline}
        </p>
      ) : null}
      {message ? (
        <p className="ffl-selStep-confirm" aria-live="polite" aria-atomic="true">
          {message}
        </p>
      ) : null}
      {showPoints && points != null ? (
        <p className="ffl-selStep-points" aria-hidden="true">
          +{points} Focus Points
        </p>
      ) : null}
    </div>
  );
}
