import { useRef } from 'react';
import type { GameAssessmentConfig } from '../types/gameAssessment';

function buildAdaptiveMissionConfigSessionKey(config: GameAssessmentConfig): string {
  const contentBand = config.adaptiveMeta?.contentBand ?? 'unknown';
  const sourceBand = config.adaptiveMeta?.sourceBand ?? contentBand;
  return `${config.id}::${contentBand}::${sourceBand}`;
}

/**
 * Freeze adaptive mission config for the active play session so background grade
 * refresh does not reshuffle questions mid-quiz.
 *
 * Session key includes content/source band so a late grade profile load can
 * upgrade from a default 2-3 pool to the correct band before play starts.
 */
export function useStableAdaptiveMissionConfig(
  config: GameAssessmentConfig | null | undefined,
): GameAssessmentConfig | null {
  const latchedRef = useRef<GameAssessmentConfig | null>(null);
  const latchedSessionKeyRef = useRef<string | null>(null);

  if (!config) {
    return latchedRef.current;
  }

  const sessionKey = buildAdaptiveMissionConfigSessionKey(config);

  if (!latchedRef.current || latchedSessionKeyRef.current !== sessionKey) {
    latchedRef.current = config;
    latchedSessionKeyRef.current = sessionKey;
    return config;
  }

  return latchedRef.current;
}
