import React from 'react';
import { CHARACTER_HOTSPOT_IMAGES } from '../../kids-adventure/characterThemes';
import './cinematic-mission.css';

type CinematicMissionShellProps = {
  backgroundSrc: string;
  backgroundSource?: string;
  children: React.ReactNode;
  className?: string;
};

/**
 * Full-bleed mission backdrop — month hero from CMS with dim + blur overlay.
 * TODO(future): Admin-configurable per-mission background overrides.
 */
export default function CinematicMissionShell({
  backgroundSrc,
  backgroundSource,
  children,
  className = '',
}: CinematicMissionShellProps) {
  return (
    <div
      className={['cinematicMissionShell', className].filter(Boolean).join(' ')}
      data-hero-source={backgroundSource}
      style={
        {
          '--cinematic-b4-coach-art': `url("${CHARACTER_HOTSPOT_IMAGES.b4}")`,
        } as React.CSSProperties
      }
    >
      <div
        className="cinematicMissionShellBg"
        style={{ backgroundImage: `url("${backgroundSrc}")` }}
        aria-hidden="true"
      />
      <div className="cinematicMissionShellScrim" aria-hidden="true" />
      <div className="cinematicMissionShellContent">{children}</div>
    </div>
  );
}
