import React from 'react';
import PortalBreadcrumb from '../../components/portal/PortalBreadcrumb';
import type { MissionGameTheme } from '../../components/mission-game/MissionSpeechRow';
export type GameShellPortalType = 'facilitator' | 'family' | 'kid';

/**
 * Focus Flame GameShell — standard wrapper for ALL question-based interactive modules.
 * Kid games, facilitator training, family activities, baseline checks, and adult
 * assessments should use this pattern (directly or via GameAssessmentFlow).
 *
 * @see interactiveModuleRegistry.ts for component naming and module examples
 */
export type GameShellProps = {
  portalType: GameShellPortalType;
  gameTitle: string;
  characterId?: string;
  participantName?: string;
  progress?: number;
  onBack?: () => void;
  backHref?: string;
  backLabel?: string;
  backTheme?: MissionGameTheme;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  children: React.ReactNode;
  insightSlot?: React.ReactNode;
  lockInTipSlot?: React.ReactNode;
  footerSlot?: React.ReactNode;
  className?: string;
};

export default function GameShell({
  portalType,
  gameTitle,
  participantName,
  progress = 0,
  onBack,
  backHref,
  backLabel = 'Back',
  backTheme = 'default',
  children,
  insightSlot,
  lockInTipSlot,
  footerSlot,
  className = '',
}: GameShellProps) {
  const hasAside = Boolean(insightSlot || lockInTipSlot);

  return (
    <div className={['ds-gameShell', className].filter(Boolean).join(' ')}>
      <header className="ds-gameShellTop">
        <div>
          {backHref || onBack ? (
            backHref ? (
              <PortalBreadcrumb
                label={backLabel.startsWith('Back to') ? backLabel : `Back to ${backLabel}`}
                href={backHref}
                theme={backTheme}
                variant="game"
                className="game-shellBackBtn"
              />
            ) : (
              <PortalBreadcrumb
                label={backLabel.startsWith('Back to') ? backLabel : `Back to ${backLabel}`}
                onClick={onBack}
                theme={backTheme}
                variant="game"
                className="game-shellBackBtn"
              />
            )
          ) : null}
          <h1 className="ds-gameShellTitle">{gameTitle}</h1>
        </div>
        <div className="ds-gameShellMeta">
          <span className="ds-gameShellPlayer">
            {portalType === 'family' ? 'Family' : portalType === 'facilitator' ? 'Facilitator' : 'Player'}
            {participantName ? ` · ${participantName}` : ''}
          </span>
        </div>
      </header>

      <div className="ds-gameShellProgress" aria-hidden="true">
        <div className="ds-gameShellProgressFill" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
      </div>

      <div
        className={[
          'ds-gameShellBody',
          hasAside ? 'ds-gameShellBody--withInsight' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="ds-gameShellMain">{children}</div>
        {hasAside ? (
          <aside className="ds-gameShellAside">
            {lockInTipSlot}
            {insightSlot}
          </aside>
        ) : null}
      </div>

      {footerSlot ? <footer className="ds-gameShellFooter">{footerSlot}</footer> : null}
    </div>
  );
}
