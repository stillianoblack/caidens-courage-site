import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  COURAGE_LOGO_SRC,
  flattenKidsMegaNav,
  FOR_DROPDOWN,
  isNavPathActive,
  KIDS_MEGA_DROPDOWN,
  KIDS_NAV_PATHS,
  PORTAL_PATH,
  STORY_DROPDOWN,
  STORY_NAV_PATHS,
  type CourageKidsMegaNav,
  type CourageNavLink,
} from '../../config/courageNav';
import PilotAccessNavLink from './PilotAccessNavLink';

function navPillClass(isActive: boolean, mobile = false) {
  return [
    mobile ? 'block min-h-11 w-full rounded-xl px-4 py-3 text-base text-left' : 'inline-flex min-h-11 items-center rounded-full px-4 py-2 text-sm',
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

function megaNavLinkClass(href: string, pathname: string, hash: string, search: string) {
  const active = isNavHrefActive(href, pathname, hash, search);
  return [
    'block w-full rounded-lg px-2 py-2 text-sm font-semibold transition-colors text-left',
    active ? 'bg-navy-50 text-navy-800' : 'text-navy-600 hover:bg-navy-50 hover:text-navy-800',
  ].join(' ');
}

function renderCourageNavItem(
  item: CourageNavLink,
  className: string,
  onNavigate?: () => void,
) {
  if (item.pilotInterest) {
    return (
      <PilotAccessNavLink
        label={item.label}
        className={className}
        interestType={item.pilotInterest}
        clickSource="header_nav"
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <Link to={item.href} onClick={onNavigate} className={className}>
      {item.label}
    </Link>
  );
}

const KIDS_MEGA_VIEWPORT_PADDING = 24;

function useViewportCenteredPanel(isOpen: boolean, containerRef: React.RefObject<HTMLDivElement>, panelRef: React.RefObject<HTMLDivElement>) {
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({
    left: '50%',
    transform: 'translateX(-50%)',
  });

  useLayoutEffect(() => {
    if (!isOpen) {
      setPanelStyle({ left: '50%', transform: 'translateX(-50%)' });
      return;
    }

    const clampPanel = () => {
      const container = containerRef.current;
      const panel = panelRef.current;
      if (!container || !panel) return;

      const containerRect = container.getBoundingClientRect();
      const panelWidth = panel.offsetWidth;
      const centerX = containerRect.left + containerRect.width / 2;
      const idealLeft = centerX - panelWidth / 2;
      const clampedLeft = Math.max(
        KIDS_MEGA_VIEWPORT_PADDING,
        Math.min(window.innerWidth - KIDS_MEGA_VIEWPORT_PADDING - panelWidth, idealLeft),
      );

      setPanelStyle({
        left: clampedLeft - containerRect.left,
        transform: 'none',
      });
    };

    clampPanel();
    window.addEventListener('resize', clampPanel);
    window.addEventListener('scroll', clampPanel, { passive: true });
    return () => {
      window.removeEventListener('resize', clampPanel);
      window.removeEventListener('scroll', clampPanel);
    };
  }, [isOpen, containerRef, panelRef]);

  return panelStyle;
}

function KidsMegaIntro({ intro }: { intro: NonNullable<CourageKidsMegaNav['intro']> }) {
  return (
    <div className="mb-5 border-b border-navy-100 pb-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-navy-400">{intro.label}</p>
      <p className="mt-1 text-sm leading-relaxed text-navy-500">{intro.description}</p>
    </div>
  );
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
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const menuId = `courage-${label.toLowerCase().replace(/\s+/g, '-')}-menu`;

  return (
    <div ref={ref} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={onToggle}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onToggle();
          }
        }}
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-haspopup="menu"
        className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-golden-500/70 ${
          active ? 'bg-navy-500 text-white' : 'text-navy-500 hover:bg-navy-50'
        }`}
      >
        {label}
        <svg className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
        </svg>
      </button>
      {isOpen ? (
        <div id={menuId} role="menu" className="absolute left-0 top-full z-50 mt-2 min-w-[290px] max-w-[min(100vw-2rem,340px)] rounded-2xl border border-navy-100 bg-white py-2 shadow-xl">
          {items.map((item) => (
            <DropdownMenuItem key={`${item.href}-${item.label}`} item={item} onClose={onClose} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function DropdownMenuItem({ item, onClose }: { item: CourageNavLink; onClose: () => void }) {
  const content = <>{item.icon ? <NavItemIcon name={item.icon} /> : null}<span><span className="block text-sm font-semibold">{item.label}</span>{item.description ? <span className="mt-0.5 block text-xs font-normal leading-snug text-navy-400">{item.description}</span> : null}</span></>;
  const className = 'group flex min-h-12 items-start gap-3 px-4 py-3 text-navy-600 transition-colors hover:bg-navy-50 hover:text-navy-800 focus:bg-navy-50 focus:outline-none';
  return item.href.startsWith('http')
    ? <a href={item.href} onClick={onClose} role="menuitem" className={className}>{content}</a>
    : <Link to={item.href} onClick={onClose} role="menuitem" className={className}>{content}</Link>;
}

function NavItemIcon({ name }: { name: NonNullable<CourageNavLink['icon']> }) {
  const paths = {
    story: <path d="M5 4.5h5.2c1 0 1.8.8 1.8 1.8V20c0-1.1-.9-2-2-2H5V4.5Zm14 0h-5.2c-1 0-1.8.8-1.8 1.8V20c0-1.1.9-2 2-2h5V4.5Z" />,
    characters: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.5-4 2.8-6 7-6s6.5 2 7 6" /></>,
    world: <><circle cx="12" cy="12" r="8" /><path d="M4 12h16M12 4c2.7 2.5 4 5.2 4 8s-1.3 5.5-4 8c-2.7-2.5-4-5.2-4-8s1.3-5.5 4-8Z" /></>,
    vale: <><path d="M12 3v18M5 9l7-6 7 6M7 21v-8h10v8" /><path d="M3 21h18" /></>,
  };
  return <svg className="mt-0.5 h-5 w-5 shrink-0 text-golden-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{paths[name]}</svg>;
}

type KidsMegaDropdownProps = {
  mega: CourageKidsMegaNav;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  active: boolean;
};

function DesktopKidsMegaDropdown({ mega, isOpen, onToggle, onClose, active }: KidsMegaDropdownProps) {
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const panelStyle = useViewportCenteredPanel(isOpen, ref, panelRef);

  useEffect(() => {
    if (!isOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  return (
    <div ref={ref} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={onToggle}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onToggle();
          }
        }}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls="courage-kids-menu"
        className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-golden-500/70 ${
          active ? 'bg-navy-500 text-white' : 'text-navy-500 hover:bg-navy-50'
        }`}
      >
        Kids
        <svg className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
        </svg>
      </button>
      {isOpen ? (
        <div
          ref={panelRef}
          id="courage-kids-menu"
          role="menu"
          aria-label="Kids"
          style={panelStyle}
          className="absolute top-full z-50 mt-2 w-[min(880px,calc(100vw-3rem))] max-w-[min(900px,calc(100vw-3rem))] rounded-2xl border border-navy-100 bg-white p-5 shadow-xl"
        >
          {mega.intro ? <KidsMegaIntro intro={mega.intro} /> : null}
          <div className="grid grid-cols-3 gap-6">
            {mega.columns.map((column, columnIndex) => (
              <div key={columnIndex} className="min-w-0">
                {column.sections.map((section) => (
                  <div key={section.heading}>
                    <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-navy-400">
                      {section.heading}
                    </p>
                    <ul className="space-y-0.5">
                      {section.items.map((item) => (
                        <li key={`${item.href}-${item.label}`}>
                          {renderCourageNavItem(
                            item,
                            megaNavLinkClass(
                              item.href,
                              location.pathname,
                              location.hash,
                              location.search,
                            ),
                            onClose,
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>
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
        aria-haspopup="menu"
        aria-controls={`courage-mobile-${label.toLowerCase().replace(/\s+/g, '-')}-menu`}
        className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-base font-semibold text-navy-500 hover:bg-navy-50"
      >
        {label}
        <svg className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
        </svg>
      </button>
      {isOpen ? (
        <ul id={`courage-mobile-${label.toLowerCase().replace(/\s+/g, '-')}-menu`} className="mt-1 space-y-1 pl-2" aria-label={label}>
          {items.map((item) => (
            <li key={`${item.href}-${item.label}`}>
              {item.href.startsWith('http') ? (
                <a href={item.href} onClick={onClose} className="block min-h-11 rounded-lg px-4 py-2.5 text-sm font-semibold text-navy-600 hover:bg-navy-50">{item.label}</a>
              ) : (
                <Link to={item.href} onClick={onClose} className="block min-h-11 rounded-lg px-4 py-2.5 text-sm font-semibold text-navy-600 hover:bg-navy-50">{item.label}</Link>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function MobileKidsMegaGroup({ mega, isOpen, onToggle, onClose }: Omit<KidsMegaDropdownProps, 'active'>) {
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls="courage-mobile-kids-menu"
        className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-base font-semibold text-navy-500 hover:bg-navy-50"
      >
        Kids
        <svg className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
        </svg>
      </button>
      {isOpen ? (
        <div id="courage-mobile-kids-menu" className="mt-1 pl-2" aria-label="Kids">
          {mega.intro ? (
            <div className="mb-4 px-4 pb-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-navy-400">{mega.intro.label}</p>
              <p className="mt-1 text-sm leading-relaxed text-navy-500">{mega.intro.description}</p>
            </div>
          ) : null}
          <div className="space-y-6">
            {mega.columns.flatMap((column) =>
              column.sections.map((section) => (
                <div key={section.heading}>
                  <p className="px-4 pb-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-navy-400">
                    {section.heading}
                  </p>
                  <ul className="space-y-1">
                    {section.items.map((item) => (
                      <li key={`${item.href}-${item.label}`}>
                        {renderCourageNavItem(
                          item,
                          'block rounded-lg px-4 py-2.5 text-sm font-semibold text-navy-600 hover:bg-navy-50 text-left w-full',
                          onClose,
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )),
            )}
          </div>
        </div>
      ) : null}
    </li>
  );
}

export default function CourageHeader() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [storyOpen, setStoryOpen] = useState(false);
  const [kidsOpen, setKidsOpen] = useState(false);
  const [forOpen, setForOpen] = useState(false);
  const [mobileStoryOpen, setMobileStoryOpen] = useState(false);
  const [mobileKidsOpen, setMobileKidsOpen] = useState(false);
  const [mobileForOpen, setMobileForOpen] = useState(false);

  const closeAllDropdowns = () => {
    setStoryOpen(false);
    setKidsOpen(false);
    setForOpen(false);
  };

  const closeAllMobileDropdowns = () => {
    setMobileStoryOpen(false);
    setMobileKidsOpen(false);
    setMobileForOpen(false);
  };

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    closeAllDropdowns();
    closeAllMobileDropdowns();
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
  const kidsFlatLinks = flattenKidsMegaNav(KIDS_MEGA_DROPDOWN);
  const storyActive =
    isNavPathActive(STORY_NAV_PATHS, location.pathname) ||
    isDropdownActive(STORY_DROPDOWN, location.pathname, location.hash, location.search);
  const kidsActive =
    isNavPathActive(KIDS_NAV_PATHS, location.pathname) ||
    isDropdownActive(kidsFlatLinks, location.pathname, location.hash, location.search);
  const forActive = isDropdownActive(FOR_DROPDOWN, location.pathname, location.hash, location.search);
  const gamesActive = KIDS_MEGA_DROPDOWN.columns.some((column) =>
    column.sections.some((section) =>
      section.items.some(
        (item) =>
          item.pilotInterest === 'focus_flame_lab' &&
          isNavHrefActive(item.href, location.pathname, location.hash, location.search),
      ),
    ),
  );
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
              src={COURAGE_LOGO_SRC}
              alt="Caiden's Courage"
              className="block h-10 w-auto max-w-[min(100%,13.5rem)] flex-shrink-0 object-contain object-left sm:h-11 sm:max-w-[min(100%,15rem)] lg:h-12 lg:max-w-[min(100%,16.5rem)]"
              decoding="async"
            />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Caiden's Courage navigation">
            <NavLink to="/" end className={({ isActive }) => navPillClass(isActive)}>
              Home
            </NavLink>
            <DesktopDropdown
              label="The Story"
              items={STORY_DROPDOWN}
              isOpen={storyOpen}
              onToggle={() => {
                setStoryOpen((open) => !open);
                setKidsOpen(false);
                setForOpen(false);
              }}
              onClose={() => setStoryOpen(false)}
              active={storyActive}
            />
            <DesktopKidsMegaDropdown
              mega={KIDS_MEGA_DROPDOWN}
              isOpen={kidsOpen}
              onToggle={() => {
                setKidsOpen((o) => !o);
                setStoryOpen(false);
                setForOpen(false);
              }}
              onClose={() => setKidsOpen(false)}
              active={kidsActive}
            />
            <DesktopDropdown
              label="For"
              items={FOR_DROPDOWN}
              isOpen={forOpen}
              onToggle={() => {
                setForOpen((o) => !o);
                setStoryOpen(false);
                setKidsOpen(false);
              }}
              onClose={() => setForOpen(false)}
              active={forActive}
            />
            <PilotAccessNavLink
              label="Games"
              className={navPillClass(gamesActive)}
              interestType="focus_flame_lab"
              clickSource="header_games"
            />
            <NavLink to={PORTAL_PATH} className="ml-2 inline-flex min-h-[50px] items-center rounded-full bg-golden-500 px-8 text-base font-bold text-navy-800 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-golden-400 active:translate-y-0 active:bg-golden-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-golden-500/70 focus-visible:ring-offset-2">
              Enter the World <span className="ml-2" aria-hidden>→</span>
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
            className="cc-courage-mobile-nav relative z-50 max-h-[70vh] overflow-y-auto border-t border-navy-100 bg-[#FAF9F7] shadow-lg sm:px-6 lg:hidden"
            aria-label="Caiden's Courage mobile navigation"
          >
            <ul className="cc-courage-mobile-nav-list cc-courage-header-inner cc-site-container mx-auto flex w-full flex-col gap-1">
              <li>
                <NavLink to="/" end className={({ isActive }) => navPillClass(isActive, true)} onClick={closeMenu}>
                  Home
                </NavLink>
              </li>
              <MobileDropdownGroup
                label="The Story"
                items={STORY_DROPDOWN}
                isOpen={mobileStoryOpen}
                onToggle={() => {
                  setMobileStoryOpen((open) => !open);
                  setMobileKidsOpen(false);
                  setMobileForOpen(false);
                }}
                onClose={closeMenu}
              />
              <MobileKidsMegaGroup
                mega={KIDS_MEGA_DROPDOWN}
                isOpen={mobileKidsOpen}
                onToggle={() => {
                  setMobileKidsOpen((o) => !o);
                  setMobileStoryOpen(false);
                  setMobileForOpen(false);
                }}
                onClose={closeMenu}
              />
              <MobileDropdownGroup
                label="For"
                items={FOR_DROPDOWN}
                isOpen={mobileForOpen}
                onToggle={() => {
                  setMobileForOpen((o) => !o);
                  setMobileStoryOpen(false);
                  setMobileKidsOpen(false);
                }}
                onClose={closeMenu}
              />
              <li>
                <PilotAccessNavLink
                  label="Games"
                  className={navPillClass(gamesActive, true)}
                  interestType="focus_flame_lab"
                  clickSource="header_games_mobile"
                  onNavigate={closeMenu}
                />
              </li>
              <li>
                <NavLink
                  to={PORTAL_PATH}
                  className="mt-2 flex min-h-12 items-center justify-center rounded-xl bg-golden-500 px-4 py-3 text-base font-bold text-navy-800"
                  onClick={closeMenu}
                >
                  Enter the World <span className="ml-2" aria-hidden>→</span>
                </NavLink>
              </li>
            </ul>
          </nav>
        </>
      ) : null}
    </header>
  );
}
