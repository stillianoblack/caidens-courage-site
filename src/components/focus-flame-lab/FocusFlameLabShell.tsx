import React from 'react';
import { FFL_EMBER_PRESETS } from './fflEmberPresets';

type FocusFlameLabShellProps = {
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
};

/** Shared Focus Flame Lab background shell — depth, glow, embers. */
export default function FocusFlameLabShell({
  children,
  className,
  ariaLabel = 'Focus Flame Lab',
}: FocusFlameLabShellProps) {
  const publicUrl = process.env.PUBLIC_URL || '';

  return (
    <main
      className={['ffl-app', 'ffl-focusFlameGame', className].filter(Boolean).join(' ')}
      aria-label={ariaLabel}
      style={{
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        ['--ffl-app-bg' as any]: `url(${publicUrl}/images/backgrounds/focusflame_game_background.webp)`,
      }}
    >
      <div className="ffl-background-depth" aria-hidden="true" />
      <div className="ffl-background-altarGlow" aria-hidden="true" />
      <div className="ffl-background-embers" aria-hidden="true">
        {FFL_EMBER_PRESETS.map((p, i) => (
          <span
            key={i}
            className="ffl-ember"
            style={
              {
                '--ember-x': `${p.x}%`,
                '--ember-delay': `${p.delayS}s`,
                '--ember-dur': `${p.durS}s`,
                '--ember-drift': `${p.driftPx}px`,
                '--ember-s': `${p.sizePx}px`,
                '--ember-o': p.opacity,
                '--ember-bg': p.warm ? 'rgba(240, 185, 95, 0.5)' : 'rgba(236, 150, 72, 0.38)',
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      {children}
    </main>
  );
}
