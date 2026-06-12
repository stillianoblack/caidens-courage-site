import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { readActivePilotProgram } from '../../config/activePilotProgram';
import { readActivePortalRole, signOutPortal } from '../../config/portalContext';
import { PORTAL_PATH } from '../../config/courageRoutes';
import { assignPortalRoute } from '../../lib/portalHardNavigation';
import { copyToClipboard } from '../../lib/copyToClipboard';
import './portal-switcher.css';

type PortalSwitcherDropdownProps = {
  className?: string;
  linkedCampLabel?: string | null;
};

function resolvePortalLabel(): string {
  const role = readActivePortalRole();
  if (role === 'facilitator') return 'Facilitator Portal';
  if (role === 'family') return 'Family Portal';
  return 'Portal';
}

const MENU_GAP_PX = 6;
const MENU_Z_INDEX = 12000;

export default function PortalSwitcherDropdown({
  className = '',
  linkedCampLabel = null,
}: PortalSwitcherDropdownProps) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({ visibility: 'hidden' });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const currentLabel = resolvePortalLabel();
  const role = readActivePortalRole();
  const familyCode = readActivePilotProgram()?.familyAccessCode;
  const programName = readActivePilotProgram()?.programName?.trim() || null;

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

  const menu = open ? (
    <ul
      ref={menuRef}
      className="portal-switcherMenu portal-switcherMenu--portal"
      role="menu"
      aria-label="Portal menu"
      style={menuStyle}
    >
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
    <div className={`portal-switcher${className ? ` ${className}` : ''}`}>
      <button
        ref={triggerRef}
        type="button"
        className="portal-switcherTrigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
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
      {menu && typeof document !== 'undefined' ? createPortal(menu, document.body) : null}
    </div>
  );
}
