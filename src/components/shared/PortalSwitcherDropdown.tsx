import React, { useEffect, useRef, useState } from 'react';
import { readActivePortalRole, signOutPortal } from '../../config/portalContext';
import { PORTAL_PATH } from '../../config/courageRoutes';
import { assignPortalRoute } from '../../lib/portalHardNavigation';
import './portal-switcher.css';

type PortalSwitcherDropdownProps = {
  className?: string;
};

function resolvePortalLabel(): string {
  const role = readActivePortalRole();
  if (role === 'facilitator') return 'Facilitator Portal';
  if (role === 'family') return 'Family Portal';
  return 'Portal';
}

export default function PortalSwitcherDropdown({ className = '' }: PortalSwitcherDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const currentLabel = resolvePortalLabel();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    setOpen(false);
    signOutPortal();
    assignPortalRoute(PORTAL_PATH);
  };

  return (
    <div className={`portal-switcher${className ? ` ${className}` : ''}`} ref={rootRef}>
      <button
        type="button"
        className="portal-switcherTrigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{currentLabel}</span>
        <svg className="portal-switcherChevron" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {open ? (
        <ul className="portal-switcherMenu" role="menu" aria-label="Portal menu">
          <li>
            <button type="button" className="portal-switcherOption portal-switcherOption--signOut" onClick={handleSignOut}>
              Sign Out
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  );
}
