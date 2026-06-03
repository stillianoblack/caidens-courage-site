import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  FOCUS_FLAME_LAB_PATH,
  RESOURCES_DROPDOWN,
  SCHOOLS_DROPDOWN,
  type CourageNavLink,
} from '../config/courageNav';

function navPillClass(isActive: boolean, mobile = false) {
  return [
    mobile ? 'block w-full rounded-xl px-4 py-3 text-base text-left' : 'rounded-full px-3 py-1.5 text-sm',
    'font-semibold transition-colors',
    isActive ? 'bg-navy-500 text-white' : 'text-navy-500 hover:bg-navy-50',
  ].join(' ');
}

function isDropdownActive(items: CourageNavLink[], pathname: string, hash: string) {
  return items.some((item) => {
    const [path, anchor] = item.href.split('#');
    if (anchor) return pathname === path && hash === `#${anchor}`;
    return pathname === path || pathname.startsWith(`${path}/`);
  });
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

export default function CourageHeader() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [schoolsOpen, setSchoolsOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [mobileSchoolsOpen, setMobileSchoolsOpen] = useState(false);
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSchoolsOpen(false);
    setResourcesOpen(false);
    setMobileSchoolsOpen(false);
    setMobileResourcesOpen(false);
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
  const schoolsActive = isDropdownActive(SCHOOLS_DROPDOWN, location.pathname, location.hash);
  const resourcesActive = isDropdownActive(RESOURCES_DROPDOWN, location.pathname, location.hash);

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
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="cc-site-container mx-auto flex min-h-16 items-center justify-between gap-3 py-3.5 sm:min-h-[4.25rem] sm:py-4">
          <Link
            to="/"
            className="flex shrink-0 items-center leading-none rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-golden-500/60"
            aria-label="Caiden's Courage home"
          >
            <img
              src="/images/icons/CC_logo_2_1.svg"
              alt="Caiden's Courage"
              className="block h-8 w-auto flex-shrink-0 object-contain object-left sm:h-9 lg:h-[2.375rem]"
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
            }}
            onClose={() => setResourcesOpen(false)}
            active={resourcesActive}
          />
          <NavLink to={FOCUS_FLAME_LAB_PATH} className={({ isActive }) => navPillClass(isActive)}>
            Focus Flame Lab
          </NavLink>
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
            className="relative z-50 max-h-[70vh] overflow-y-auto border-t border-navy-100 bg-[#FAF9F7] px-4 py-4 shadow-lg sm:px-6 lg:hidden"
            aria-label="Caiden's Courage mobile navigation"
          >
            <ul className="cc-site-container mx-auto flex flex-col gap-1">
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
                }}
                onClose={closeMenu}
              />
              <li>
                <NavLink
                  to={FOCUS_FLAME_LAB_PATH}
                  className={({ isActive }) => navPillClass(isActive, true)}
                  onClick={closeMenu}
                >
                  Focus Flame Lab
                </NavLink>
              </li>
            </ul>
          </nav>
        </>
      ) : null}
    </header>
  );
}
