import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { readActivePilotProgram } from '../../config/activePilotProgram';
import { applyProgramPortalUnlock, readActivePortalRole, signOutPortal } from '../../config/portalContext';
import {
  ensureFacilitatorPortalAccess,
  ensureFamilyPortalAccess,
} from '../../config/blueRibbonPortalAccess';
import {
  FACILITATOR_PORTAL_PATH,
  FAMILY_HUB_PATH,
  FAMILY_PORTAL_PATH,
  PILOT_DASHBOARD_PATH,
  PORTAL_PATH,
  PROGRAM_DASHBOARD_PATH,
} from '../../config/courageRoutes';
import './portal-switcher.css';

export type PortalRole = 'facilitator' | 'family';

type PortalOption = {
  id: PortalRole;
  label: string;
  href: string;
  isProgram?: boolean;
};

function buildPortalOptions(): PortalOption[] {
  const program = readActivePilotProgram();
  const role = readActivePortalRole();
  if (program) {
    // Program signups issue separate family vs facilitator codes — do not cross-grant.
    if (role === 'family') {
      return [{ id: 'family', label: 'Family Portal', href: FAMILY_HUB_PATH, isProgram: true }];
    }
    if (role === 'facilitator') {
      return [
        { id: 'facilitator', label: 'Facilitator Portal', href: PROGRAM_DASHBOARD_PATH, isProgram: true },
      ];
    }
    return [];
  }
  return [
    { id: 'facilitator', label: 'Facilitator Portal', href: FACILITATOR_PORTAL_PATH },
    { id: 'family', label: 'Family Portal', href: FAMILY_PORTAL_PATH },
  ];
}

function resolveCurrentPortal(pathname: string): PortalRole {
  if (
    pathname.startsWith(FACILITATOR_PORTAL_PATH) ||
    pathname.startsWith(PILOT_DASHBOARD_PATH) ||
    pathname.startsWith('/portal/blueribbon2026') ||
    pathname.startsWith(PROGRAM_DASHBOARD_PATH)
  ) {
    return 'facilitator';
  }
  return 'family';
}

type PortalSwitcherDropdownProps = {
  className?: string;
};

export default function PortalSwitcherDropdown({ className = '' }: PortalSwitcherDropdownProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const portalOptions = buildPortalOptions();

  const current = resolveCurrentPortal(location.pathname);
  const currentLabel = portalOptions.find((o) => o.id === current)?.label ?? 'Portal';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: PortalOption) => {
    setOpen(false);
    if (option.id === current) return;

    const program = readActivePilotProgram();
    if (option.isProgram && program) {
      applyProgramPortalUnlock(program, option.id);
      navigate(option.href);
      return;
    }

    if (option.id === 'facilitator') {
      ensureFacilitatorPortalAccess();
    } else {
      ensureFamilyPortalAccess();
    }

    navigate(option.href);
  };

  const handleSignOut = () => {
    setOpen(false);
    signOutPortal();
    navigate(PORTAL_PATH);
  };

  return (
    <div className={`portal-switcher${className ? ` ${className}` : ''}`} ref={rootRef}>
      <button
        type="button"
        className="portal-switcherTrigger"
        aria-haspopup="listbox"
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
        <ul className="portal-switcherMenu" role="listbox" aria-label="Switch portal">
          {portalOptions.map((option) => (
            <li key={option.id} role="option" aria-selected={option.id === current}>
              <button
                type="button"
                className={`portal-switcherOption${option.id === current ? ' portal-switcherOption--active' : ''}`}
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </button>
            </li>
          ))}
          <li role="separator" className="portal-switcherDivider" />
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
