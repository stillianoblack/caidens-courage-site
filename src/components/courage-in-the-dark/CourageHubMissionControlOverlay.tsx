import React from 'react';
import './courage-hub-mission-control.css';

type CourageHubMissionControlOverlayProps = {
  title: string;
  subtitle?: string;
  onBackToExplore?: () => void;
  children: React.ReactNode;
  className?: string;
};

export default function CourageHubMissionControlOverlay({
  title,
  subtitle,
  onBackToExplore,
  children,
  className = '',
}: CourageHubMissionControlOverlayProps) {
  return (
    <aside
      className={['courageHubMissionControlOverlay', className].filter(Boolean).join(' ')}
      aria-label={title}
    >
      <header className="courageHubMissionControlOverlayHeader">
        <div className="courageHubMissionControlOverlayHeading">
          <h3 className="courageHubMissionControlOverlayTitle">{title}</h3>
          {subtitle ? (
            <p className="courageHubMissionControlOverlaySubtitle">{subtitle}</p>
          ) : null}
        </div>
        {onBackToExplore ? (
          <button
            type="button"
            className="courageHubMissionControlOverlayBack"
            onClick={onBackToExplore}
          >
            Explore
          </button>
        ) : null}
      </header>
      <div className="courageHubMissionControlOverlayBody">{children}</div>
    </aside>
  );
}
