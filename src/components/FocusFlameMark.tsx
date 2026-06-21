import React, { useMemo } from 'react';
import { FOCUS_FLAME_ACADEMY_MARK_SRC } from '../design-system/brand/brandLogos';

export type FocusFlameState = 'scattered' | 'flickering' | 'steady' | 'golden';

export default function FocusFlameMark({
  state = 'steady',
  size = 300,
  className,
}: {
  state?: FocusFlameState;
  size?: number;
  className?: string;
}) {
  const embers = useMemo(
    () =>
      Array.from({ length: 9 }).map((_, i) => ({
        id: i,
        left: 16 + ((i * 11) % 68),
        delay: (i % 6) * 0.32,
        duration: 2.9 + (i % 4) * 0.55,
        drift: ((i % 3) - 1) * 14,
        scale: 0.65 + (i % 4) * 0.12,
      })),
    []
  );

  return (
    <div
      className={`focus-flame-wrapper focus-flame-wrapper--${state} ${className ?? ''}`.trim()}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <div className="flame-glow" />
      <div className="flame-shimmer" aria-hidden="true" />
      <img
        className="flame-svg"
        src={FOCUS_FLAME_ACADEMY_MARK_SRC}
        alt=""
        decoding="async"
      />
      <div className="embers" aria-hidden="true">
        {embers.map((e) => (
          <span
            key={e.id}
            className="ember"
            style={{
              left: `${e.left}%`,
              animationDelay: `${e.delay}s`,
              animationDuration: `${e.duration}s`,
              transform: `translateX(-50%) scale(${e.scale})`,
              // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
              ['--ember-drift' as any]: `${e.drift}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

