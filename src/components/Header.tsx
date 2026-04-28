import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { NAV_ITEMS, RIGHT_NAV_ITEMS, handleAnchorClick, NavItem } from '../config/nav';
import { SAFE_MODE } from '../lib/safeMode';

const DISABLE_HEADER_ANIMATIONS = process.env.REACT_APP_DISABLE_HEADER_ANIMATIONS === 'true';

interface HeaderProps {
  onComingSoonClick?: () => void;
}

const HeaderInner: React.FC<HeaderProps> = ({ onComingSoonClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isPreorderOpen, setIsPreorderOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const prevScrolledRef = useRef<boolean | null>(null);
  const renderCountRef = useRef(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showResourcesDropdown, setShowResourcesDropdown] = useState(false);
  const [showShopDropdown, setShowShopDropdown] = useState(false);
  const [showWorldDropdown, setShowWorldDropdown] = useState(false);
  const [showMobileResourcesDropdown, setShowMobileResourcesDropdown] = useState(false);
  const [showMobileShopDropdown, setShowMobileShopDropdown] = useState(false);
  const [showMobileWorldDropdown, setShowMobileWorldDropdown] = useState(false);
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);
  const [shopCloseTimeout, setShopCloseTimeout] = useState<NodeJS.Timeout | null>(null);
  const [worldCloseTimeout, setWorldCloseTimeout] = useState<NodeJS.Timeout | null>(null);

  // Handle scroll for header (UI state only; throttled). Defer to idle so route render/paint happens first.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (SAFE_MODE || reduceMotion) return;

    let cancelled = false;
    let ticking = false;
    const handlerRef = { current: null as (() => void) | null };
    const schedule = () => {
      if (cancelled) return;
      const handleScroll = () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(() => {
          if (cancelled) return;
          const scrolled = window.scrollY > 50;
          if (prevScrolledRef.current !== scrolled) {
            prevScrolledRef.current = scrolled;
            setIsScrolled(scrolled);
          }
          ticking = false;
        });
      };
      handlerRef.current = handleScroll;
      window.addEventListener('scroll', handleScroll, { passive: true });
    };
    const id =
      typeof (window as any).requestIdleCallback !== 'undefined'
        ? (window as any).requestIdleCallback(schedule, { timeout: 600 })
        : (setTimeout(schedule, 400) as unknown as number);

    return () => {
      cancelled = true;
      if (typeof (window as any).cancelIdleCallback !== 'undefined') (window as any).cancelIdleCallback(id);
      else clearTimeout(id);
      const h = handlerRef.current;
      if (h) window.removeEventListener('scroll', h);
    };
  }, []);

  // Sync scroll state when route changes (fixed header + SPA navigation).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const scrolled = window.scrollY > 50;
    prevScrolledRef.current = scrolled;
    setIsScrolled(scrolled);
  }, [location.pathname]);

  // Dev-only: log Header render count when ?perf=1
  renderCountRef.current += 1;
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development' || typeof window === 'undefined') return;
    try {
      if (new URLSearchParams(window.location.search).get('perf') === '1') {
        // eslint-disable-next-line no-console
        console.log('[Header] render count', renderCountRef.current);
      }
    } catch (e) {}
  });

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (closeTimeout) {
        clearTimeout(closeTimeout);
      }
      if (shopCloseTimeout) {
        clearTimeout(shopCloseTimeout);
      }
      if (worldCloseTimeout) {
        clearTimeout(worldCloseTimeout);
      }
    };
  }, [closeTimeout, shopCloseTimeout, worldCloseTimeout]);

  const handleComingSoonClick = () => {
    if (onComingSoonClick) {
      onComingSoonClick();
    }
  };

  const handleMouseEnter = () => {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      setCloseTimeout(null);
    }
    setShowResourcesDropdown(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowResourcesDropdown(false);
    }, 200);
    setCloseTimeout(timeout);
  };

  const handleShopMouseEnter = () => {
    if (shopCloseTimeout) {
      clearTimeout(shopCloseTimeout);
      setShopCloseTimeout(null);
    }
    setShowShopDropdown(true);
  };

  const handleShopMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowShopDropdown(false);
    }, 200);
    setShopCloseTimeout(timeout);
  };

  const handleWorldMouseEnter = () => {
    if (worldCloseTimeout) {
      clearTimeout(worldCloseTimeout);
      setWorldCloseTimeout(null);
    }
    setShowWorldDropdown(true);
  };

  const handleWorldMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowWorldDropdown(false);
    }, 200);
    setWorldCloseTimeout(timeout);
  };


  // Helper to check if nav item is active
  const isNavItemActive = (item: NavItem): boolean => {
    if (item.activePaths) {
      return item.activePaths.some(path => location.pathname === path);
    }
    return location.pathname === item.href;
  };

  const handleKeyDown = (e: React.KeyboardEvent, toggleFn: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleFn();
    }
  };

  // For /# links only: intercept to scroll or navigate (preventDefault required for same-page scroll).
  const handleAnchorClickOnly = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#')) {
      handleAnchorClick(e, href, navigate, location);
    }
  };

  const navSurfaceClass = useMemo(() => {
    const base = isScrolled ? 'cv-nav--scrolled' : 'cv-nav--top';
    if (DISABLE_HEADER_ANIMATIONS || SAFE_MODE) return `${base} cv-nav--no-blur`;
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return `${base} cv-nav--no-blur`;
    }
    return base;
  }, [isScrolled]);

  // Plain NavLink/Link – no preventDefault, no nav wrappers. Menu-close in onClick only where needed.
  const renderNavLink = (item: NavItem) => {
    const isAnchor = item.href.startsWith('/#');
    const baseClass =
      'nav-link-underline font-semibold tracking-wide cv-nav-link hover:text-[color:var(--cv-nav-link-hover)] transition-colors duration-200 ease';
    const activeClass = 'font-bold text-white border-b-2 border-golden-500';

    if (isAnchor) {
      return (
        <Link
          to={item.href}
          onClick={(e) => handleAnchorClickOnly(e, item.href)}
          className={`${baseClass} ${isNavItemActive(item) ? activeClass : ''}`}
        >
          {item.label}
        </Link>
      );
    }
    return (
      <NavLink
        to={item.href}
        className={({ isActive }) => `${baseClass} ${isActive ? activeClass : ''}`}
      >
        {item.label}
      </NavLink>
    );
  };

  // Render a dropdown nav item
  const renderDropdown = (item: NavItem, isOpen: boolean, onMouseEnter: () => void, onMouseLeave: () => void, onToggle: () => void) => {
    if (item.label === 'Resources') {
      // Special handling for Resources dropdown (two-column layout)
      return (
        <div 
          className="relative has-dropdown"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <div
            className="nav-link-underline font-semibold tracking-wide cv-nav-link hover:text-[color:var(--cv-nav-link-hover)] transition-colors duration-200 ease flex items-center gap-1.5 cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              onToggle();
            }}
            onKeyDown={(e) => handleKeyDown(e, onToggle)}
            role="button"
            tabIndex={0}
            aria-haspopup="true"
            aria-expanded={isOpen}
          >
            {item.label}
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <div className="absolute top-full left-0 w-full h-3" />
          <div 
            className={`dropdown-menu absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl py-6 px-6 min-w-[600px] z-50 transition-[opacity,transform] duration-200 ${
              isOpen 
                ? 'opacity-100 visible pointer-events-auto translate-y-0' 
                : 'opacity-0 invisible pointer-events-none -translate-y-2'
            }`}
            style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            <div className="grid grid-cols-2 gap-8">
              {/* Column 1: Classroom & Home Tools */}
              <div>
                <h3 className="font-display font-bold text-base text-navy-500 mb-4">Classroom & Home Tools</h3>
                <div className="space-y-3">
                  {item.dropdownItems?.slice(0, 3).map((dropdownItem, idx) => (
                    <Link
                      key={idx}
                      to={dropdownItem.href}
                      onClick={() => setShowResourcesDropdown(false)}
                      className="block rounded-xl p-4 hover:bg-navy-50 transition-colors focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2"
                    >
                      <div className="font-semibold text-sm text-navy-700 mb-1">{dropdownItem.label}</div>
                      {dropdownItem.description && (
                        <div className="text-xs text-navy-500">{dropdownItem.description}</div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
              
              {/* Column 2: For Educators */}
              <div>
                <h3 className="font-display font-bold text-base text-navy-500 mb-4">For Educators</h3>
                <div className="space-y-3">
                  {item.dropdownItems?.slice(3, 6).map((dropdownItem, idx) => (
                    <Link
                      key={idx + 3}
                      to={dropdownItem.href}
                      className="block rounded-xl p-4 hover:bg-navy-50 transition-colors focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2"
                      onClick={() => setShowResourcesDropdown(false)}
                    >
                      <div className="font-semibold text-sm text-navy-700 mb-1">{dropdownItem.label}</div>
                      {dropdownItem.description && (
                        <div className="text-xs text-navy-500">{dropdownItem.description}</div>
                      )}
                    </Link>
                  ))}
                  {/* Shop link at bottom */}
                  {item.dropdownItems?.slice(6).map((dropdownItem, idx) => (
                    <Link
                      key={idx + 6}
                      to={dropdownItem.href}
                      className="block rounded-xl p-4 hover:bg-navy-50 transition-colors focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2"
                      onClick={() => setShowResourcesDropdown(false)}
                    >
                      <div className="font-semibold text-sm text-navy-700 mb-1">{dropdownItem.label}</div>
                      {dropdownItem.description && (
                        <div className="text-xs text-navy-500">{dropdownItem.description}</div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="border-t border-navy-200 mt-4 pt-4">
              <h3 className="font-display font-bold text-xs text-navy-500 mb-3 uppercase tracking-wide">Browse by audience</h3>
              <div className="grid grid-cols-4 gap-2">
                <Link to="/braveminds#kids" className="block rounded-lg p-3 hover:bg-navy-50 transition-colors text-center focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2" onClick={() => setShowResourcesDropdown(false)}>
                  <div className="font-semibold text-xs text-navy-700">For Kids</div>
                </Link>
                <Link to="/braveminds#parents" className="block rounded-lg p-3 hover:bg-navy-50 transition-colors text-center focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2" onClick={() => setShowResourcesDropdown(false)}>
                  <div className="font-semibold text-xs text-navy-700">For Parents</div>
                </Link>
                <Link to="/braveminds#teachers" className="block rounded-lg p-3 hover:bg-navy-50 transition-colors text-center focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2" onClick={() => setShowResourcesDropdown(false)}>
                  <div className="font-semibold text-xs text-navy-700">For Teachers</div>
                </Link>
                <Link to="/braveminds" className="block rounded-lg p-3 hover:bg-navy-50 transition-colors text-center focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2" onClick={() => setShowResourcesDropdown(false)}>
                  <div className="font-semibold text-xs text-navy-700">All Resources</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (item.label === 'Shop') {
      // Special handling for Shop dropdown (Coming Soon items)
      return (
        <div 
          className="relative has-dropdown"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <div
            className="nav-link-underline font-semibold tracking-wide cv-nav-link hover:text-[color:var(--cv-nav-link-hover)] transition-colors duration-200 ease flex items-center gap-1.5 cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              onToggle();
            }}
            onKeyDown={(e) => handleKeyDown(e, onToggle)}
            role="button"
            tabIndex={0}
            aria-haspopup="true"
            aria-expanded={isOpen}
          >
            {item.label}
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <div className="absolute top-full left-0 w-full h-3" />
          <div 
            className={`dropdown-menu absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl py-2 min-w-[240px] z-50 transition-[opacity,transform] duration-200 ${
              isOpen 
                ? 'opacity-100 visible pointer-events-auto translate-y-0' 
                : 'opacity-0 invisible pointer-events-none -translate-y-2'
            }`}
            style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            {item.dropdownItems?.map((dropdownItem, idx) => {
              if (dropdownItem.href === '#') {
                // Coming Soon item
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setShowShopDropdown(false);
                      handleComingSoonClick();
                    }}
                    className="block w-full text-left px-4 py-2.5 text-navy-500 hover:bg-navy-50 transition-colors"
                  >
                    <div className="font-semibold text-sm">{dropdownItem.label} <span className="text-xs font-normal">— {dropdownItem.subtitle}</span></div>
                    {dropdownItem.description && (
                      <div className="text-xs text-navy-400 mt-0.5">{dropdownItem.description}</div>
                    )}
                  </button>
                );
              }
              return (
                <Link
                  key={idx}
                  to={dropdownItem.href}
                  onClick={() => setShowShopDropdown(false)}
                  className="block w-full text-left px-4 py-2.5 text-navy-500 hover:bg-navy-50 transition-colors"
                >
                  <div className="font-semibold text-sm">{dropdownItem.label}</div>
                  {dropdownItem.subtitle && (
                    <div className="text-xs text-navy-400 mt-0.5">{dropdownItem.subtitle}</div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      );
    } else {
      // Standard dropdown
      return (
        <div 
          className="relative has-dropdown"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <div
            className="nav-link-underline font-semibold tracking-wide cv-nav-link hover:text-[color:var(--cv-nav-link-hover)] transition-colors duration-200 ease flex items-center gap-1.5 cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              onToggle();
            }}
            onKeyDown={(e) => handleKeyDown(e, onToggle)}
            role="button"
            tabIndex={0}
            aria-haspopup="true"
            aria-expanded={isOpen}
          >
            {item.label}
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <div className="absolute top-full left-0 w-full h-3" />
          <div 
            className={`dropdown-menu absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl py-2 min-w-[240px] z-50 transition-[opacity,transform] duration-200 ${
              isOpen 
                ? 'opacity-100 visible pointer-events-auto translate-y-0' 
                : 'opacity-0 invisible pointer-events-none -translate-y-2'
            }`}
            style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            {item.dropdownItems?.map((dropdownItem, idx) => (
              <Link
                key={idx}
                to={dropdownItem.href}
                onClick={() => item.label === 'The World' && setShowWorldDropdown(false)}
                className="block w-full text-left px-4 py-2.5 text-navy-500 hover:bg-navy-50 transition-colors"
              >
                <div className="font-semibold text-sm">{dropdownItem.label}</div>
                {dropdownItem.description && (
                  <div className="text-xs text-navy-400 mt-0.5">{dropdownItem.description}</div>
                )}
              </Link>
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50">
        {/* Mobile header — keep existing layout/behavior exactly as-is */}
        <div className={`lg:hidden ${navSurfaceClass}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-20">
              {/* Left: Hamburger (mobile) + Logo */}
              <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0 pl-1">
                {/* Hamburger Menu Button - Mobile only (left) */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 rounded-lg transition-colors duration-150 text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/60 relative flex items-center justify-center"
                  aria-label="Toggle menu"
                  aria-expanded={isMobileMenuOpen}
                >
                  <svg 
                    className={`w-7 h-7 transition-[opacity,transform] duration-200 ${isMobileMenuOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <svg 
                    className={`w-7 h-7 absolute transition-[opacity,transform] duration-200 ${isMobileMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                <Link to="/" className="header-logo-link flex items-center flex-shrink-0">
                  <img
                    src="/images/logos/CaidenVale_Logo_Web.svg"
                    alt="Caiden Vale and the Focus Flame"
                    className="header-logo-img h-[22px] md:h-[26px] w-auto object-contain brightness-0 invert"
                  />
                </Link>
              </div>
              
              {/* Right: Pre-Order (mobile) */}
              <div className="flex items-center gap-3 sm:gap-4 lg:gap-5 flex-shrink-0">
                <Link
                  to="/comicbook"
                  className="whitespace-nowrap flex-shrink-0 text-sm sm:text-base px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 h-11 sm:h-12 inline-flex items-center justify-center font-bold rounded-full bg-golden-500 hover:bg-golden-400 text-navy-700 transition-colors shadow-[0_10px_26px_-14px_rgba(240,206,110,0.55)] hover:shadow-[0_14px_34px_-16px_rgba(240,206,110,0.7)]"
                >
                  Pre-Order Volume 1
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile promo strip (global) */}
          <div
            className="w-full border-t"
            style={{
              borderColor: 'rgba(255,255,255,0.08)',
              height: 'var(--mobile-promo-height)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingLeft: '16px',
              paddingRight: '16px',
              background: 'rgba(7, 15, 28, 0.96)',
            }}
          >
            <div
              className="flex items-center gap-2"
              style={{
                color: 'rgba(255,255,255,0.78)',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                fontSize: '11px',
                fontWeight: 700,
                whiteSpace: 'nowrap',
              }}
            >
              <span
                aria-hidden="true"
                className="inline-block rounded-full"
                style={{
                  width: '10px',
                  height: '10px',
                  background: 'var(--golden-500)',
                  boxShadow: '0 0 14px rgba(229, 192, 106, 0.35)',
                }}
              />
              <span>Where different minds discover their power</span>
            </div>
          </div>
        </div>

        {/* Desktop header — Marvel-inspired two-tier + promo strip */}
        <div className={`hidden lg:block cv-marvel-nav ${isScrolled ? 'cv-marvel-nav--scrolled' : ''}`}>
          {/* A) Top utility bar */}
          <div
            style={{
              background: 'rgba(7, 15, 28, 0.98)',
            }}
          >
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <div className="h-16 grid items-center" style={{ gridTemplateColumns: '1fr auto 1fr' }}>
                <div className="flex items-center justify-start">
                  <div
                    className="flex items-center justify-start gap-5 pr-6 pl-6 h-10"
                    style={{
                      borderLeft: '1px solid rgba(255,255,255,0.12)',
                      borderRight: '1px solid rgba(255,255,255,0.12)',
                    }}
                  >
                    <NavLink
                      to={RIGHT_NAV_ITEMS.partnerLink.href}
                      className={({ isActive }) =>
                        `nav-link-underline font-semibold tracking-wide whitespace-nowrap transition-colors duration-200 ease ${
                          isActive ? 'font-bold text-white border-b-2 border-golden-500' : ''
                        }`
                      }
                      style={{ color: 'rgba(255,255,255,0.92)' }}
                    >
                      {RIGHT_NAV_ITEMS.partnerLink.label}
                    </NavLink>
                  </div>
                </div>

                <div
                  className="flex items-center justify-center px-6"
                >
                  <Link to="/" className="header-logo-link flex items-center">
                    <img
                      src="/images/logos/CaidenVale_Logo_Web.svg"
                      alt="Caiden Vale and the Focus Flame"
                      className="header-logo-img h-[26px] w-auto object-contain brightness-0 invert"
                    />
                  </Link>
                </div>

                <div className="flex items-center justify-end">
                  <div
                    className="flex items-center justify-end gap-2 pr-6 pl-6 h-10"
                    style={{
                      borderLeft: '1px solid rgba(255,255,255,0.12)',
                      borderRight: '1px solid rgba(255,255,255,0.12)',
                    }}
                  >
                    <Link
                      to="/comicbook"
                      className="group inline-flex items-center whitespace-nowrap text-sm font-semibold tracking-wide leading-none transition-colors duration-200 ease hover:text-[#E5C06A]"
                      style={{ color: 'rgba(255,255,255,0.92)' }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 317.81 450.05"
                        fill="none"
                        aria-hidden="true"
                        className="flex-shrink-0 transition-colors duration-200 group-hover:text-[#E5C06A]"
                        style={{ color: '#E5C06A' }}
                      >
                        <path
                          d="M169.59,249.44c-.85-.45-1.36-1.87-2.18-2.62-3.58-4.02-7.9-.88-11.32-1.64-1.95-.32-2.98-2.63-4.88-3.43-2.34-.88-4.65.7-6.93,1.13-2.6.59-5.63-.79-7.81,1.65-.72.74-1.63,1.15-2.66.96-5.41-1.11-10.1,1.63-12.7,6.43-.55.96-1.38,1.66-2.33,2.2-5.25,3.03-5.79,7.51-5.5,12.99-2.48,3.31-2.68,5.02-1.75,8.99.15.83-.06,1.21-.37,1.91-1.71,4.35-5.26,11.02-5.81,13.99-.56,2.62-1.79,8.6-2.18,10.34-.17.79-1.28.68-2.03.78-8.54.66-12.18,8.29-11.55,15.71.62,7.43,5.49,14.64,13.87,14.47.79-.02,1.68.12,1.9.98-.05,10.9,10.43,16.53,3.19,25.71-.5.67-1.38,1.54-2.11,1.46-4.73-2.7-3.47-8.22-6.77-14.4-.74-1.49-1.75-3.09-3.06-4.72-1.83-2.36-3.76-3.93-5.94-6.04-7.11-7.01-8.77-15.78-15.08-15.86-1.64.13-1.78-.09-2.71-1.83-1.85-3.12-5.66-9.51-7.88-13.24-2.91-4.48-5.23-9.52-5.48-14.99-.86-10.91-3.24-21.16-6.73-31.39-1.22-3.01-2.14-7.06-.42-9.95,4.48-8.72,22.8-11.33,23.24-15.78-1.02-5.2-8.88-3.09-12.27-1.55-16.7,7.06,11.56-31.53-3.71-31.36-2.94,1.44-1.74,19.5-8.5,22.8-1.83.75-1.45-1.67-1.58-3.48-.44-6.88.58-14.42-2.37-20.76-.69-1.61-3.48-2.87-4.51-1.61-1.24,2.01-.46,4.44-.29,6.78.76,5.97,2.21,14.34-.44,19.97-1.41-2.67-4.57-10.25-6.17-13.79-2.03-3.87-1.43-5.32-4.32-7.35-2.61-1.14-4.65,2-3.46,4.55.89,2.29,4.11,9.75,5.82,13.92.6,1.05.7,2.8-.12,3.78-3.11,1.85-9.13-11.55-12.96-9.86-2.18,1.83-.61,5.17,1.17,6.84,5.27,5.78,7.47,7.12,7.74,15.06.02,1.39.33,2.84,1.18,3.91,16.32,21.77.72,49.05,20.39,78.38,1.01,1.9,4.5,8.46,5.69,10.72.67,1.2,1.24,2.7.98,4.18-1.04,4.71-5.63,9.97-.88,14.83,7.51,7.27,13.76,15.54,14.32,23.45.64,5.86-.81,12.23-4.37,19.91-.26.55-.66,1.25-1.18,1.34-11.84-8.84-17.57-22.76-26.08-35.29-5.24-8.91-13.43-16.38-18.61-25.43-31.86-66.71-27.81-151.68,13.95-213.63,2.87,21.17,7.48,44.48,26.47,56.86.43.29,1.28.81,1.58.34C69.35,91.96,133.82,26.26,213.42,0c-21.18,79.5,54.78,142.82,50.72,222.47-.14,1.18.07,1.42.66.39,11.89-20.3,28.91-41.6,53.01-43.26-11.64,23.4-8.25,50.07-4.9,75.01,26.2,118.69-64.23,224.4-186.55,188.25-1.07-5.68-4.78-32.23.72-34.64,4.48-2.29,13.53,3.29,17.97,4.66.59.15,1.12.02,1.68-.32,10.41-7.96,28.29,6.33,42,.15,7.6-2.34,19.66-5.33,26.5-7.23,1.95-.54,2.38-.72,3.22-.74,2.38.28,6.95.59,9.75.89,1.36.22,1.91-.07,3.09-.55,6.82-2.84,12.35,3.03,18.65.73.94-.34,1.27-1.24.56-2.03-2.74-3.56-7.04-4-11.17-5.82-.66-.59.92-.61,1.31-.73,6.53-.93,14.51-.36,15.18-3.29-.34-3.75-5.88-2.24-9.9-2.76-1.98-.09-3.63-.12-5.3-.19-1.17-.09-2.05.09-1.89-.38,3.76-6.81,17.02-4.96,17.22-10.53-.18-2.1-3.53-2.76-5.34-2.06-1.61.58-8.42,3.05-12.87,4.67-2.44.66-5.05,2.64-3.16-.27,3.37-6.29,11.07-8.9,12.19-14.3.02-1.61-1.45-2.64-2.97-2.24-7.57,1.3-11.1,10.81-17.79,16.27-.97.77-1.54.34-1.54-.81-.17-5.12,4.22-10.69-.36-13.15-.54-.29-1.27-.48-1.83-.24-4.79,5.51-4.45,14.43-5,21.37-.4,5.26-6.91,6.62-11.36,6.35-13.8.07-22.29,3.06-30.37,2.38-7.33-.18-13.92-5.33-22.17-12.47-8.32-2.54-16.06-6.01-24.25-9.53-1.93-.97-4.09-.53-6.17-1.21-4.04-1.31.48-7.13,3-4.81,10.1,7.36,23.77,5.75,35.76.78,2.51-1.09,3.24-3.67,5.35-5.52,9.05-9.55,27.33-19.88,20.06-32.28-.37-.7-1.2-1.94-.54-2.5,1.31-1.31,5.55-.91,8.52-3.94.74-.72,1.51-1.87,2.39-2.21,10.25-2.02,16.89-8.47,18.9-18.89,2.8-5.51,1.61-11.79-2.7-16.46-.72-.83-1.11-1.83-1.27-2.91-.69-4.29-3.15-7.79-7.23-9.43-1.2-.44-2.2-1.32-2.84-2.48-4.63-9.11-5.47-12.74-15.81-14.31-.34-.12-1.39-.37-1.52-.63-4.19-5.53-7.51-9.32-15.33-9.73l-.15-.07Z"
                          fill="currentColor"
                        />
                      </svg>
                      <span className="ml-2.5 group-hover:text-[#E5C06A]">Pre-Order Volume 1</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* B) Main nav row */}
          <div
            style={{
              background: '#111A2A',
            }}
          >
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <div className="h-11 flex items-center justify-center">
                <nav className="flex items-center justify-center gap-8">
                  {NAV_ITEMS.map((item) => {
                    if (item.type === 'link') {
                      return <React.Fragment key={item.label}>{renderNavLink(item)}</React.Fragment>;
                    }
                    if (item.type === 'dropdown') {
                      let isOpen = false;
                      let onMouseEnter = () => {};
                      let onMouseLeave = () => {};
                      let onToggle = () => {};

                      if (item.label === 'Resources') {
                        isOpen = showResourcesDropdown;
                        onMouseEnter = handleMouseEnter;
                        onMouseLeave = handleMouseLeave;
                        onToggle = () => setShowResourcesDropdown(!showResourcesDropdown);
                      } else if (item.label === 'Shop') {
                        isOpen = showShopDropdown;
                        onMouseEnter = handleShopMouseEnter;
                        onMouseLeave = handleShopMouseLeave;
                        onToggle = () => setShowShopDropdown(!showShopDropdown);
                      } else if (item.label === 'The World') {
                        isOpen = showWorldDropdown;
                        onMouseEnter = handleWorldMouseEnter;
                        onMouseLeave = handleWorldMouseLeave;
                        onToggle = () => setShowWorldDropdown(!showWorldDropdown);
                      }

                      return (
                        <React.Fragment key={item.label}>
                          {renderDropdown(item, isOpen, onMouseEnter, onMouseLeave, onToggle)}
                        </React.Fragment>
                      );
                    }
                    return null;
                  })}
                </nav>
              </div>
            </div>
          </div>

          {/* C) Promo strip */}
          <div style={{ background: '#000000' }}>
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <div className="h-9 flex items-center justify-center gap-2 text-center">
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full" style={{ background: 'rgba(229, 192, 106, 0.18)' }} aria-hidden="true">
                  <span className="block w-1.5 h-1.5 rounded-full" style={{ background: '#E5C06A' }} />
                </span>
                <span
                  className="text-xs font-semibold uppercase tracking-[0.22em]"
                  style={{ color: 'rgba(255, 255, 255, 0.88)' }}
                >
                  WHERE DIFFERENT MINDS DISCOVER THEIR POWER
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Full Screen, Slides from Left */}
      <div
        className={`fixed top-16 sm:top-20 left-0 right-0 bottom-0 z-40 lg:hidden ${DISABLE_HEADER_ANIMATIONS ? '' : 'transition-opacity duration-200'} ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        {/* Full Screen Menu Panel - Slides from Left */}
        <div
          className={`absolute inset-0 bg-white ${DISABLE_HEADER_ANIMATIONS ? '' : 'transform transition-transform duration-200 ease-out'} ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Menu Items */}
          <nav className="px-6 pt-8 pb-8 overflow-y-auto h-[calc(100vh-96px)]">
            <div className="flex flex-col space-y-2 max-w-7xl mx-auto" style={{ paddingTop: '100px' }}>
              {NAV_ITEMS.map((item) => {
                if (item.type === 'link') {
                  const isAnchor = item.href.startsWith('/#');
                  return isAnchor ? (
                    <Link
                      key={item.label}
                      to={item.href}
                      onClick={(e) => { handleAnchorClickOnly(e, item.href); setIsMobileMenuOpen(false); }}
                      className={`px-6 py-6 text-navy-600 text-2xl font-semibold hover:bg-navy-50 transition-colors border-b border-navy-100 flex items-center justify-between rounded-lg ${isNavItemActive(item) ? 'bg-navy-50 font-bold' : ''}`}
                    >
                      <span>{item.label}</span>
                      <svg className="w-7 h-7 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ) : (
                    <NavLink
                      key={item.label}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `px-6 py-6 text-navy-600 text-2xl font-semibold hover:bg-navy-50 transition-colors border-b border-navy-100 flex items-center justify-between rounded-lg ${isActive ? 'bg-navy-50 font-bold' : ''}`
                      }
                    >
                      <span>{item.label}</span>
                      <svg className="w-7 h-7 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </NavLink>
                  );
                } else if (item.type === 'dropdown') {
                  let isOpen = false;
                  let setIsOpen = (val: boolean) => {};
                  
                  if (item.label === 'Resources') {
                    isOpen = showMobileResourcesDropdown;
                    setIsOpen = setShowMobileResourcesDropdown;
                  } else if (item.label === 'Shop') {
                    isOpen = showMobileShopDropdown;
                    setIsOpen = setShowMobileShopDropdown;
                  } else if (item.label === 'The World') {
                    isOpen = showMobileWorldDropdown;
                    setIsOpen = setShowMobileWorldDropdown;
                  }
                  
                  return (
                    <div key={item.label} className="border-b border-navy-100">
                      <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-full px-6 py-6 text-navy-600 text-2xl font-semibold hover:bg-navy-50 transition-colors flex items-center justify-between rounded-lg"
                      >
                        <span>{item.label}</span>
                        <svg 
                          className={`w-7 h-7 text-navy-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      <div className={`overflow-hidden transition-all duration-300 ${
                        isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                        {item.label === 'Resources' ? (
                          <>
                            <div className="px-12 py-4">
                              <h3 className="font-display font-bold text-lg text-navy-700 mb-3">Classroom & Home Tools</h3>
                              <div className="space-y-3">
                                {item.dropdownItems?.slice(0, 3).map((dropdownItem, idx) => (
                                  <Link
                                    key={idx}
                                    to={dropdownItem.href}
                                    onClick={() => { setIsMobileMenuOpen(false); setShowMobileResourcesDropdown(false); }}
                                    className="block rounded-xl p-4 bg-white hover:bg-navy-50 transition-colors border border-navy-100"
                                  >
                                    <div className="font-semibold text-base text-navy-700 mb-1">{dropdownItem.label}</div>
                                    {dropdownItem.description && (
                                      <div className="text-sm text-navy-500">{dropdownItem.description}</div>
                                    )}
                                  </Link>
                                ))}
                              </div>
                            </div>
                            <div className="px-12 py-4 border-t border-navy-100">
                              <h3 className="font-display font-bold text-lg text-navy-700 mb-3">For Educators</h3>
                              <div className="space-y-3">
                                {item.dropdownItems?.slice(3, 7).map((dropdownItem, idx) => (
                                  <Link
                                    key={idx + 3}
                                    to={dropdownItem.href}
                                    onClick={() => { setIsMobileMenuOpen(false); setShowMobileResourcesDropdown(false); }}
                                    className="block rounded-xl p-4 bg-white hover:bg-navy-50 transition-colors border border-navy-100"
                                  >
                                    <div className="font-semibold text-base text-navy-700 mb-1">{dropdownItem.label}</div>
                                    {dropdownItem.description && (
                                      <div className="text-sm text-navy-500">{dropdownItem.description}</div>
                                    )}
                                  </Link>
                                ))}
                              </div>
                            </div>
                            <div className="px-12 py-4 border-t border-navy-200">
                              <div className="grid grid-cols-2 gap-2">
                                <Link to="/braveminds?audience=kids" onClick={() => { setIsMobileMenuOpen(false); setShowMobileResourcesDropdown(false); }} className="block rounded-lg p-3 bg-white hover:bg-navy-50 transition-colors text-center border border-navy-100">
                                  <div className="font-semibold text-sm text-navy-700">For Kids</div>
                                </Link>
                                <Link to="/braveminds?audience=parents" onClick={() => { setIsMobileMenuOpen(false); setShowMobileResourcesDropdown(false); }} className="block rounded-lg p-3 bg-white hover:bg-navy-50 transition-colors text-center border border-navy-100">
                                  <div className="font-semibold text-sm text-navy-700">For Parents</div>
                                </Link>
                                <Link to="/braveminds?audience=teachers" onClick={() => { setIsMobileMenuOpen(false); setShowMobileResourcesDropdown(false); }} className="block rounded-lg p-3 bg-white hover:bg-navy-50 transition-colors text-center border border-navy-100">
                                  <div className="font-semibold text-sm text-navy-700">For Teachers</div>
                                </Link>
                                <Link to="/braveminds" onClick={() => { setIsMobileMenuOpen(false); setShowMobileResourcesDropdown(false); }} className="block rounded-lg p-3 bg-white hover:bg-navy-50 transition-colors text-center border border-navy-100">
                                  <div className="font-semibold text-sm text-navy-700">All Resources</div>
                                </Link>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="px-12 py-4">
                            {item.dropdownItems?.map((dropdownItem, idx) => {
                              if (item.label === 'Shop' && dropdownItem.href === '#') {
                                return (
                                  <button
                                    key={idx}
                                    onClick={() => {
                                      setIsMobileMenuOpen(false);
                                      setShowMobileShopDropdown(false);
                                      handleComingSoonClick();
                                    }}
                                    className="block w-full text-left px-4 py-4 text-navy-500 hover:bg-navy-50 transition-colors"
                                  >
                                    <div className="font-semibold text-lg">{dropdownItem.label} <span className="text-base font-normal">— {dropdownItem.subtitle}</span></div>
                                    {dropdownItem.description && (
                                      <div className="text-sm text-navy-400 mt-0.5">{dropdownItem.description}</div>
                                    )}
                                  </button>
                                );
                              }
                              return (
                                <Link
                                  key={idx}
                                  to={dropdownItem.href}
                                  onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    if (item.label === 'Shop') setShowMobileShopDropdown(false);
                                    if (item.label === 'The World') setShowMobileWorldDropdown(false);
                                  }}
                                  className="block px-4 py-4 text-navy-500 hover:bg-navy-50 transition-colors"
                                >
                                  <div className="font-semibold text-lg">{dropdownItem.label}</div>
                                  {dropdownItem.subtitle && (
                                    <div className="text-sm text-navy-400 mt-0.5">{dropdownItem.subtitle}</div>
                                  )}
                                  {dropdownItem.description && (
                                    <div className="text-sm text-navy-400 mt-0.5">{dropdownItem.description}</div>
                                  )}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              })}
              
              {/* Partner With Us Link in Mobile Menu */}
              <NavLink
                to={RIGHT_NAV_ITEMS.partnerLink.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-6 py-6 text-navy-600 text-2xl font-semibold hover:bg-navy-50 transition-colors border-b border-navy-100 flex items-center justify-between rounded-lg ${isActive ? 'bg-navy-50 font-bold' : ''}`
                }
              >
                <span>{RIGHT_NAV_ITEMS.partnerLink.label}</span>
                <svg className="w-7 h-7 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </NavLink>
              
              {/* CTA in Mobile Menu - router-native Link */}
              <div className="px-6 py-6 mt-4">
                <Link
                  to="/comicbook"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center font-bold rounded-lg bg-golden-500 hover:bg-golden-400 text-navy-500 py-4 px-6 transition-colors"
                >
                  Pre-Order Volume 1
                </Link>
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* Pre-order Modal */}
      {isPreorderOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 ${DISABLE_HEADER_ANIMATIONS ? '' : 'backdrop-blur-sm'}`}
          onClick={() => setIsPreorderOpen(false)}
        >
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 sm:p-10 max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 text-navy-500 hover:text-navy-700 text-2xl font-bold"
              onClick={() => setIsPreorderOpen(false)}
              aria-label="Close modal"
            >
              ×
            </button>
            <iframe
              src="https://beacons.ai/stillianoblack"
              className="w-full h-[600px] border-0 rounded-lg"
              title="Join the Courage Community"
              loading="lazy"
            />
          </div>
        </div>
      )}
    </>
  );
};

const Header = React.memo(HeaderInner);
export default Header;

