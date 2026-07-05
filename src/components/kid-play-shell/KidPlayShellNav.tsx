import React from 'react';
import { useNavigate } from 'react-router-dom';
import { kidPlayShellNavigate } from '../../lib/kidShellNav';
import { useInventoryNotificationBadge } from '../../hooks/useInventoryNotificationBadge';
import { readActiveChildParticipantId } from '../../config/activeChildParticipant';
import {
  getKidPlayShellRoute,
  type KidPlayShellModuleId,
} from '../../lib/kidPlayShellRoutes';
import './kid-play-shell-nav.css';

export type { KidPlayShellModuleId };

type KidPlayShellNavItem = {
  id: KidPlayShellModuleId;
  label: string;
  available: boolean;
};

const NAV_ITEMS: KidPlayShellNavItem[] = [
  { id: 'weekly-adventures', label: 'Weekly Adventures', available: true },
  { id: 'collections', label: 'Collections', available: true },
  { id: 'character-hub', label: 'Characters', available: true },
  { id: 'arcade', label: 'Arcade', available: true },
  { id: 'rewards', label: 'Rewards', available: false },
];

type KidPlayShellNavProps = {
  sessionId: string;
  activeModule: KidPlayShellModuleId;
  showArcadeNewBadge?: boolean;
  onExitClick: () => void;
};

export default function KidPlayShellNav({
  sessionId,
  activeModule,
  showArcadeNewBadge = false,
  onExitClick,
}: KidPlayShellNavProps) {
  const navigate = useNavigate();
  const participantId = readActiveChildParticipantId();
  const collectionsBadgeCount = useInventoryNotificationBadge(participantId);
  const resolvedActiveModule = activeModule === 'inventory' ? 'collections' : activeModule;

  return (
    <header className="kidPlayShellNavBar">
      <nav className="kidPlayShellNav" aria-label="Kid play modules">
        <ul className="kidPlayShellNavList">
          {NAV_ITEMS.map((item) => {
            const isActive = item.id === resolvedActiveModule;
            const showBadge = item.id === 'collections' && collectionsBadgeCount > 0;
            const showNewBadge = item.id === 'arcade' && showArcadeNewBadge;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={[
                    'kidPlayShellNavBtn',
                    isActive ? 'kidPlayShellNavBtn--active' : '',
                    !item.available ? 'kidPlayShellNavBtn--placeholder' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => {
                    if (!item.available) return;
                    kidPlayShellNavigate(navigate, getKidPlayShellRoute(sessionId, item.id));
                  }}
                  disabled={!item.available}
                  aria-current={isActive ? 'page' : undefined}
                  title={item.available ? item.label : `${item.label} — coming soon`}
                >
                  {item.label}
                  {showBadge ? (
                    <span className="kidPlayShellNavBadge" aria-label="New collection items">
                      {collectionsBadgeCount > 9 ? '9+' : collectionsBadgeCount}
                    </span>
                  ) : null}
                  {showNewBadge ? (
                    <span className="kidPlayShellNavNewBadge" aria-label="New Arcade game">
                      NEW
                    </span>
                  ) : null}
                  {!item.available ? <span className="kidPlayShellNavSoon">Soon</span> : null}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      <button
        type="button"
        className="kidPlayShellPowerBtn"
        onClick={onExitClick}
        aria-label="Exit game"
        title="Exit game"
      >
        <span className="kidPlayShellPowerBtnIcon" aria-hidden="true">
          ⏻
        </span>
      </button>
    </header>
  );
}

export function KidPlayShellComingSoon({ moduleLabel }: { moduleLabel: string }) {
  return (
    <div className="kidPlayShellComingSoon" role="status">
      <h2 className="kidPlayShellComingSoonTitle">{moduleLabel}</h2>
      <p className="kidPlayShellComingSoonBody">Coming soon to the child game shell.</p>
    </div>
  );
}
