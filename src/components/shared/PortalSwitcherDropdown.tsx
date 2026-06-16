import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { readActivePilotProgram } from '../../config/activePilotProgram';
import { readActivePortalRole, signOutPortal } from '../../config/portalContext';
import { PORTAL_PATH } from '../../config/courageRoutes';
import {
  familyGoalsPath,
  familyPortalPath,
  familySettingsPath,
} from '../../lib/familyPortalPaths';
import { assignPortalRoute } from '../../lib/portalHardNavigation';
import { copyToClipboard } from '../../lib/copyToClipboard';
import { getMobilePortalBranding } from '../../lib/getMobilePortalBranding';
import { resolvePortalSwitcherLabels } from '../../lib/portalGamePaths';
import { useGameplayPlayerChip } from '../../hooks/useGameplayPlayerChip';
import './portal-switcher.css';

type PortalSwitcherDropdownProps = {
  className?: string;
  linkedCampLabel?: string | null;
  familyNav?: boolean;
  /** Mobile portal header: family title-case names, facilitator uppercase org labels. */
  mobileVariant?: 'family' | 'facilitator';
};

const MENU_GAP_PX = 6;
const MENU_Z_INDEX = 12000;

export default function PortalSwitcherDropdown({
  className = '',
  linkedCampLabel = null,
  familyNav = false,
  mobileVariant,
}: PortalSwitcherDropdownProps) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({ visibility: 'hidden' });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const role = readActivePortalRole();
  const playerChip = useGameplayPlayerChip();
  const mobileBranding = useMemo(
    () =>
      mobileVariant
        ? getMobilePortalBranding({
            familyDisplayName: playerChip.displayName,
            role: mobileVariant === 'family' ? 'family' : 'facilitator',
          })
        : null,
    [mobileVariant, playerChip.displayName],
  );
  const desktopLabels = useMemo(
    () => resolvePortalSwitcherLabels({ familyDisplayName: playerChip.displayName }),
    [playerChip.displayName],
  );
  const fullLabel = mobileBranding?.dropdownLabel ?? desktopLabels.full;
  const displayLabel = mobileBranding?.dropdownLabel ?? desktopLabels.display;
  const familyCode = readActivePilotProgram()?.familyAccessCode;
  const programName = readActivePilotProgram()?.programName?.trim() || null;
  const showFamilyNav = familyNav && role === 'family';
  const avatarLetter =
    mobileVariant === 'family' ? 'C' : playerChip.avatarLetter || '?';

  const familyNavItems = showFamilyNav
    ? [
        { label: 'Family Dashboard', href: familyPortalPath('', location.pathname) },
        { label: 'Weekly Adventures', href: familyPortalPath('continue-learning', location.pathname) },
        { label: 'Character Hub', href: familyPortalPath('characters', location.pathname) },
        { label: 'Parent Resources', href: familyPortalPath('downloads', location.pathname) },
        { label: 'Family Goals', href: familyGoalsPath(location.pathname) },
        { label: 'Settings', href: familySettingsPath(location.pathname) },
      ]
    : [];

  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    setMenuStyle({
      position: 'fixed',
      top: rect.bottom + MENU_GAP_PX,
      right: Math.max(8, window.innerWidth - rect.right),
      zIndex: MENU_Z_INDEX,
      visibility: 'visible',
    });
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    updateMenuPosition();
    const handleReposition = () => updateMenuPosition();
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);
    return () => {
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [open, updateMenuPosition]);

  useEffect(() => {
    if (!open) return undefined;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const handleSignOut = () => {
    setOpen(false);
    signOutPortal();
    assignPortalRoute(PORTAL_PATH);
  };

  const handleRouteClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    setOpen(false);
    assignPortalRoute(href);
  };

  const menu = open ? (
    <ul
      ref={menuRef}
      className="portal-switcherMenu portal-switcherMenu--portal"
      role="menu"
      aria-label="Portal menu"
      style={menuStyle}
    >
      {familyNavItems.map((item) => (
        <li key={item.href}>
          <a
            href={item.href}
            className="portal-switcherOption"
            role="menuitem"
            onClick={(event) => handleRouteClick(event, item.href)}
          >
            {item.label}
          </a>
        </li>
      ))}
      {familyNavItems.length > 0 ? <li className="portal-switcherDivider" aria-hidden="true" /> : null}
      {role === 'family' && linkedCampLabel ? (
        <li className="portal-switcherInfoBlock">
          <p className="portal-switcherCodeLabel">Linked Program</p>
          <p className="portal-switcherInfoValue">{linkedCampLabel}</p>
        </li>
      ) : null}
      {role === 'family' && programName && programName !== linkedCampLabel ? (
        <li className="portal-switcherInfoBlock">
          <p className="portal-switcherCodeLabel">Family Program</p>
          <p className="portal-switcherInfoValue">{programName}</p>
        </li>
      ) : null}
      {role === 'family' && familyCode ? (
        <li className="portal-switcherCodeBlock">
          <p className="portal-switcherCodeLabel">Family Access Code</p>
          <div className="portal-switcherCodeRow">
            <code className="portal-switcherCodeValue">{familyCode}</code>
            <button
              type="button"
              className="portal-switcherCodeCopy"
              onClick={() => void copyToClipboard(familyCode, 'Copied')}
            >
              Copy
            </button>
          </div>
        </li>
      ) : null}
      <li>
        <button type="button" className="portal-switcherOption portal-switcherOption--signOut" onClick={handleSignOut}>
          Sign Out
        </button>
      </li>
    </ul>
  ) : null;

  return (
    <div
      className={[
        'portal-switcher',
        showFamilyNav ? 'portal-switcher--familyNav' : '',
        mobileVariant === 'family' ? 'portal-switcher--mobileFamily' : '',
        mobileVariant === 'facilitator' ? 'portal-switcher--mobileFacilitator' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        ref={triggerRef}
        type="button"
        className={[
          'portal-switcherTrigger',
          showFamilyNav ? 'portal-switcherTrigger--familyNav' : '',
          mobileVariant === 'family' ? 'portal-switcherTrigger--mobileFamily' : '',
          mobileVariant === 'facilitator' ? 'portal-switcherTrigger--mobileFacilitator' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-haspopup="menu"
        aria-expanded={open}
        title={fullLabel}
        aria-label={`${fullLabel} menu`}
        onClick={() => setOpen((value) => !value)}
      >
        {showFamilyNav ? (
          <span className="portal-switcherAvatar" aria-hidden="true">
            {avatarLetter}
          </span>
        ) : null}
        <span className="portal-switcherLabel" title={fullLabel}>
          {displayLabel}
        </span>
        <svg className="portal-switcherChevron" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {menu && typeof document !== 'undefined' ? createPortal(menu, document.body) : null}
    </div>
  );
}
