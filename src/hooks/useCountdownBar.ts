import { useEffect, useState } from 'react';

/**
 * Drives a countdown progress from 1 -> 0 over durationMs.
 * Returns progress (0..1) for bar width: width = progress * 100%.
 * Respects prefers-reduced-motion (skips animation, jumps to 0 at end).
 */
export function useCountdownBar(
  active: boolean,
  durationMs: number,
  onComplete?: () => void
): number {
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    if (!active || durationMs <= 0) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      const id = setTimeout(() => {
        setProgress(0);
        onComplete?.();
      }, durationMs);
      return () => clearTimeout(id);
    }

    const start = Date.now();
    let rafId: number;

    const tick = () => {
      const elapsed = Date.now() - start;
      const p = Math.max(0, 1 - elapsed / durationMs);
      setProgress(p);
      if (p > 0) {
        rafId = requestAnimationFrame(tick);
      } else {
        onComplete?.();
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [active, durationMs, onComplete]);

  return progress;
}
