import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  GAMES_DROPDOWN,
  PORTAL_PATH,
  PORTAL_QUICK_LINKS,
  RESOURCES_DROPDOWN,
  SCHOOLS_DROPDOWN,
  type CourageNavLink,
} from '../config/courageNav';
import { PORTAL_DASHBOARD_PATH } from '../config/portalAccess';
import PortalNavPanel from './courage/PortalNavPanel';
import { usePortalUnlock } from '../hooks/usePortalUnlock';

function navPillClass(isActive: boolean, mobile = false) {
  return [
    mobile ? 'block w-full rounded-xl px-4 py-3 text-base text-left' : 'rounded-full px-3 py-1.5 text-sm',
    'font-semibold transition-colors',
    isActive ? 'bg-navy-500 text-white' : 'text-navy-500 hover:bg-navy-50',
  ].join(' ');
}

function isNavHrefActive(href: string, pathname: string, hash: string, search: string) {
  const url = new URL(href, 'https://caidenscourage.com');
  if (url.pathname !== pathname) return false;
  if (url.hash && url.hash !== hash) return false;
  if (url.search && url.search !== search) return false;
  return true;
}

function isDropdownActive(items: CourageNavLink[], pathname: string, hash: string, search: string) {
  return items.some((item) => isNavHrefActive(item.href, pathname, hash, search));
}

type DropdownProps = {
  label: string;
  items: CourageNavLink[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  active: boolean;
};

function DesktopDropdown({ label, items, isOpen, onToggle, onClose, active }: DropdownProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [isOpen, onClose]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
          active ? 'bg-navy-500 text-white' : 'text-navy-500 hover:bg-navy-50'
        }`}
      >
        {label}
        <svg className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
        </svg>
      </button>
      {isOpen ? (
        <div className="absolute left-0 top-full z-50 mt-2 min-w-[220px] max-w-[min(100vw-2rem,280px)] rounded-2xl border border-navy-100 bg-white py-2 shadow-xl">
          {items.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={onClose}
              className="block px-4 py-2.5 text-sm font-semibold text-navy-600 transition-colors hover:bg-navy-50 hover:text-navy-800"
            >
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function MobileDropdownGroup({
  label,
  items,
  isOpen,
  onToggle,
  onClose,
}: Omit<DropdownProps, 'active'>) {
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-base font-semibold text-navy-500 hover:bg-navy-50"
      >
        {label}
        <svg className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
        </svg>
      </button>
      {isOpen ? (
        <ul className="mt-1 space-y-1 pl-2">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                onClick={onClose}
                className="block rounded-lg px-4 py-2.5 text-sm font-semibold text-navy-600 hover:bg-navy-50"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function DesktopPortalDropdown({
  isOpen,
  onToggle,
  onClose,
  active,
}: {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  active: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { accessCode, error, handleSubmit, onAccessCodeChange } = usePortalUnlock('nav', onClose);

  useEffect(() => {
    if (!isOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [isOpen, onClose]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
          active ? 'bg-navy-500 text-white' : 'text-navy-500 hover:bg-navy-50'
        }`}
      >
        Portal
        <svg className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
        </svg>
      </button>
      {isOpen ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,20rem)] rounded-2xl border border-navy-100 bg-white p-4 shadow-xl sm:left-auto sm:w-[19rem]">
          <PortalNavPanel
            accessCode={accessCode}
            error={error}
            onAccessCodeChange={onAccessCodeChange}
            onSubmit={handleSubmit}
            onLinkClick={onClose}
          />
        </div>
      ) : null}
    </div>
  );
}

function MobilePortalGroup({
  isOpen,
  onToggle,
  onClose,
}: {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const { accessCode, error, handleSubmit, onAccessCodeChange } = usePortalUnlock('nav', onClose);

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-base font-semibold text-navy-500 hover:bg-navy-50"
      >
        Portal
        <svg className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
        </svg>
      </button>
      {isOpen ? (
        <div className="mt-2 rounded-xl border border-navy-100/90 bg-white px-4 py-4">
          <PortalNavPanel
            accessCode={accessCode}
            error={error}
            onAccessCodeChange={onAccessCodeChange}
            onSubmit={handleSubmit}
            onLinkClick={onClose}
            compact
          />
        </div>
      ) : null}
    </li>
  );
}

export default function CourageHeader() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [schoolsOpen, setSchoolsOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [gamesOpen, setGamesOpen] = useState(false);
  const [portalOpen, setPortalOpen] = useState(false);
  const [mobileSchoolsOpen, setMobileSchoolsOpen] = useState(false);
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);
  const [mobileGamesOpen, setMobileGamesOpen] = useState(false);
  const [mobilePortalOpen, setMobilePortalOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSchoolsOpen(false);
    setResourcesOpen(false);
    setGamesOpen(false);
    setPortalOpen(false);
    setMobileSchoolsOpen(false);
    setMobileResourcesOpen(false);
    setMobileGamesOpen(false);
    setMobilePortalOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);
  const schoolsActive = isDropdownActive(
    SCHOOLS_DROPDOWN,
    location.pathname,
    location.hash,
    location.search
  );
  const resourcesActive = isDropdownActive(
    RESOURCES_DROPDOWN,
    location.pathname,
    location.hash,
    location.search
  );
  const gamesActive = isDropdownActive(GAMES_DROPDOWN, location.pathname, location.hash, location.search);
  const portalActive =
    location.pathname === PORTAL_PATH ||
    location.pathname.startsWith(PORTAL_DASHBOARD_PATH) ||
    isDropdownActive(PORTAL_QUICK_LINKS, location.pathname, location.hash, location.search);

  return (
    <header
      className={[
        'sticky top-0 z-50 w-full',
        'bg-[#FAF9F7]/95 backdrop-blur',
        'border-b border-navy-100',
        isScrolled ? 'shadow-[0_10px_30px_rgba(31,60,99,0.08)]' : '',
      ].join(' ')}
      aria-label="Caiden's Courage header"
    >
      <div className="cc-courage-header-shell sm:px-6 lg:px-8">
        <div className="cc-courage-header-inner cc-site-container mx-auto flex min-h-16 w-full items-center justify-between gap-3 py-3.5 sm:min-h-[4.25rem] sm:py-4">
          <Link
            to="/"
            className="flex shrink-0 items-center leading-none rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-golden-500/60"
            aria-label="Caiden's Courage home"
          >
            <img
              src="/images/icons/CC_logo.svg"
              alt="Caiden's Courage"
              className="block h-10 w-auto flex-shrink-0 object-contain object-left sm:h-11 lg:h-12"
              decoding="async"
            />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Caiden's Courage navigation">
          <NavLink to="/" end className={({ isActive }) => navPillClass(isActive)}>
            Home
          </NavLink>
          <NavLink to="/kids" className={({ isActive }) => navPillClass(isActive)}>
            Kids
          </NavLink>
          <DesktopDropdown
            label="Schools & Districts"
            items={SCHOOLS_DROPDOWN}
            isOpen={schoolsOpen}
            onToggle={() => {
              setSchoolsOpen((o) => !o);
              setResourcesOpen(false);
              setGamesOpen(false);
              setPortalOpen(false);
            }}
            onClose={() => setSchoolsOpen(false)}
            active={schoolsActive}
          />
          <DesktopDropdown
            label="Resources"
            items={RESOURCES_DROPDOWN}
            isOpen={resourcesOpen}
            onToggle={() => {
              setResourcesOpen((o) => !o);
              setSchoolsOpen(false);
              setGamesOpen(false);
              setPortalOpen(false);
            }}
            onClose={() => setResourcesOpen(false)}
            active={resourcesActive}
          />
          <DesktopDropdown
            label="Games"
            items={GAMES_DROPDOWN}
            isOpen={gamesOpen}
            onToggle={() => {
              setGamesOpen((o) => !o);
              setSchoolsOpen(false);
              setResourcesOpen(false);
              setPortalOpen(false);
            }}
            onClose={() => setGamesOpen(false)}
            active={gamesActive}
          />
          <DesktopPortalDropdown
            isOpen={portalOpen}
            onToggle={() => {
              setPortalOpen((o) => !o);
              setSchoolsOpen(false);
              setResourcesOpen(false);
              setGamesOpen(false);
            }}
            onClose={() => setPortalOpen(false)}
            active={portalActive}
          />
        </nav>

        <button
          type="button"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-navy-100 bg-white text-navy-500 shadow-sm transition-colors hover:bg-navy-50 lg:hidden"
          aria-expanded={menuOpen}
          aria-controls="courage-mobile-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
          {menuOpen ? (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
        </div>
      </div>

      {menuOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-navy-900/20 backdrop-blur-[2px] lg:hidden"
            aria-label="Close menu"
            onClick={closeMenu}
          />
          <nav
            id="courage-mobile-nav"
            className="cc-courage-mobile-nav relative z-50 max-h-[70vh] overflow-y-auto border-t border-navy-100 bg-[#FAF9F7] shadow-lg sm:px-6 lg:hidden"
            aria-label="Caiden's Courage mobile navigation"
          >
            <ul className="cc-courage-mobile-nav-list cc-courage-header-inner cc-site-container mx-auto flex w-full flex-col gap-1">
              <li>
                <NavLink to="/" end className={({ isActive }) => navPillClass(isActive, true)} onClick={closeMenu}>
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/kids" className={({ isActive }) => navPillClass(isActive, true)} onClick={closeMenu}>
                  Kids
                </NavLink>
              </li>
              <MobileDropdownGroup
                label="Schools & Districts"
                items={SCHOOLS_DROPDOWN}
                isOpen={mobileSchoolsOpen}
                onToggle={() => {
                  setMobileSchoolsOpen((o) => !o);
                  setMobileResourcesOpen(false);
                  setMobileGamesOpen(false);
                  setMobilePortalOpen(false);
                }}
                onClose={closeMenu}
              />
              <MobileDropdownGroup
                label="Resources"
                items={RESOURCES_DROPDOWN}
                isOpen={mobileResourcesOpen}
                onToggle={() => {
                  setMobileResourcesOpen((o) => !o);
                  setMobileSchoolsOpen(false);
                  setMobileGamesOpen(false);
                  setMobilePortalOpen(false);
                }}
                onClose={closeMenu}
              />
              <MobileDropdownGroup
                label="Games"
                items={GAMES_DROPDOWN}
                isOpen={mobileGamesOpen}
                onToggle={() => {
                  setMobileGamesOpen((o) => !o);
                  setMobileSchoolsOpen(false);
                  setMobileResourcesOpen(false);
                  setMobilePortalOpen(false);
                }}
                onClose={closeMenu}
              />
              <MobilePortalGroup
                isOpen={mobilePortalOpen}
                onToggle={() => {
                  setMobilePortalOpen((o) => !o);
                  setMobileSchoolsOpen(false);
                  setMobileResourcesOpen(false);
                  setMobileGamesOpen(false);
                }}
                onClose={closeMenu}
              />
            </ul>
          </nav>
        </>
      ) : null}
    </header>
  );
}
