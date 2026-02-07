import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { NAV_ITEMS, RIGHT_NAV_ITEMS, handleAnchorClick, NavItem } from '../config/nav';
import Button from './ui/Button';

interface HeaderProps {
  onComingSoonClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onComingSoonClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isPreorderOpen, setIsPreorderOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
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

  // Handle scroll for header (UI state only; throttled)
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 50);
        ticking = false;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const handleLogoClick = () => {
    if (location.pathname !== '/') {
      navigate('/');
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

  // Helper to handle nav link clicks (including anchors)
  const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#')) {
      handleAnchorClick(e, href, navigate, location);
    }
  };

  // Render a simple nav link
  const renderNavLink = (item: NavItem) => {
    const isActive = isNavItemActive(item);
    return (
      <Link
        to={item.href}
        onMouseEnter={item.href === '/mission' ? () => import('../pages/Mission') : undefined}
        onClick={(e) => handleNavLinkClick(e, item.href)}
        className={`nav-link-underline font-semibold transition-all duration-300 hover:font-bold ${isScrolled ? 'text-white' : 'text-navy-500'} ${isActive ? 'font-bold border-b-2 border-golden-500' : ''}`}
      >
        {item.label}
      </Link>
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
            className={`nav-link-underline font-semibold transition-all duration-300 hover:font-bold flex items-center gap-1.5 cursor-pointer ${isScrolled ? 'text-white' : 'text-navy-500'}`}
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
              className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <div className="absolute top-full left-0 w-full h-3" />
          <div 
            className={`dropdown-menu absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl py-6 px-6 min-w-[600px] z-50 transition-all duration-200 ${
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
                      onClick={(e) => {
                        handleNavLinkClick(e, dropdownItem.href);
                        setShowResourcesDropdown(false);
                      }}
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
                <Link to="/resources#kids" className="block rounded-lg p-3 hover:bg-navy-50 transition-colors text-center focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2" onClick={() => setShowResourcesDropdown(false)}>
                  <div className="font-semibold text-xs text-navy-700">For Kids</div>
                </Link>
                <Link to="/resources#parents" className="block rounded-lg p-3 hover:bg-navy-50 transition-colors text-center focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2" onClick={() => setShowResourcesDropdown(false)}>
                  <div className="font-semibold text-xs text-navy-700">For Parents</div>
                </Link>
                <Link to="/resources#teachers" className="block rounded-lg p-3 hover:bg-navy-50 transition-colors text-center focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2" onClick={() => setShowResourcesDropdown(false)}>
                  <div className="font-semibold text-xs text-navy-700">For Teachers</div>
                </Link>
                <Link to="/resources" className="block rounded-lg p-3 hover:bg-navy-50 transition-colors text-center focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2" onClick={() => setShowResourcesDropdown(false)}>
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
            className={`nav-link-underline font-semibold transition-all duration-300 hover:font-bold flex items-center gap-1.5 cursor-pointer ${isScrolled ? 'text-white' : 'text-navy-500'}`}
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
              className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <div className="absolute top-full left-0 w-full h-3" />
          <div 
            className={`dropdown-menu absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl py-2 min-w-[240px] z-50 transition-all duration-200 ${
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
                  onClick={(e) => {
                    handleNavLinkClick(e, dropdownItem.href);
                    setShowShopDropdown(false);
                  }}
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
            className={`nav-link-underline font-semibold transition-all duration-300 hover:font-bold flex items-center gap-1.5 cursor-pointer ${isScrolled ? 'text-white' : 'text-navy-500'}`}
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
              className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <div className="absolute top-full left-0 w-full h-3" />
          <div 
            className={`dropdown-menu absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl py-2 min-w-[240px] z-50 transition-all duration-200 ${
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
                onClick={(e) => {
                  handleNavLinkClick(e, dropdownItem.href);
                  if (item.label === 'The World') setShowWorldDropdown(false);
                }}
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
      <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md transition-all duration-300 ${isScrolled ? 'bg-navy-500 shadow-xl' : 'bg-white/90 shadow-md'}`} style={isScrolled ? { boxShadow: '0 10px 25px -5px rgba(36, 62, 112, 0.4), 0 8px 10px -6px rgba(36, 62, 112, 0.3)' } : { boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Left Cluster: Logo + Navigation */}
            <div className="flex items-center gap-4 lg:gap-6">
              {/* Hamburger Menu Button - Mobile only */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`lg:hidden p-2 rounded-lg transition-all duration-300 ${isScrolled ? 'text-white' : 'text-navy-500'} hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 ${isScrolled ? 'focus:ring-white' : 'focus:ring-navy-500'} relative flex items-center justify-center`}
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                <svg 
                  className={`w-7 h-7 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg 
                  className={`w-7 h-7 absolute transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* Logo */}
              <Link 
                to="/"
                onClick={handleLogoClick}
                className="inline-block hover:opacity-80 transition-opacity flex-shrink-0"
              >
                <img 
                  src="/logoCaiden.png" 
                  alt="Caiden's Courage" 
                  className="h-10 sm:h-12 w-auto"
                />
              </Link>
              
              {/* Desktop Navigation - Left-aligned */}
              <nav className="hidden lg:flex items-center gap-4">
                {NAV_ITEMS.map((item) => {
                  if (item.type === 'link') {
                    return <React.Fragment key={item.label}>{renderNavLink(item)}</React.Fragment>;
                  } else if (item.type === 'dropdown') {
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
                    
                    return <React.Fragment key={item.label}>{renderDropdown(item, isOpen, onMouseEnter, onMouseLeave, onToggle)}</React.Fragment>;
                  }
                  return null;
                })}
              </nav>
            </div>
            
            {/* Right Cluster: Partner With Us + CTA Button */}
            <div className="flex items-center gap-4 lg:gap-5">
              {/* Partner With Us Link */}
              <Link
                to={RIGHT_NAV_ITEMS.partnerLink.href}
                onClick={(e) => handleNavLinkClick(e, RIGHT_NAV_ITEMS.partnerLink.href)}
                className={`hidden lg:block nav-link-underline font-semibold transition-all duration-300 hover:font-bold whitespace-nowrap ${isScrolled ? 'text-white' : 'text-navy-500'} ${isNavItemActive({ href: RIGHT_NAV_ITEMS.partnerLink.href, activePaths: RIGHT_NAV_ITEMS.partnerLink.activePaths } as NavItem) ? 'font-bold border-b-2 border-golden-500' : ''}`}
              >
                {RIGHT_NAV_ITEMS.partnerLink.label}
              </Link>
              
              {/* CTA Button - Narrower */}
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/comicbook')}
                className="whitespace-nowrap flex-shrink-0 text-xs sm:text-sm px-4 lg:px-5 !min-w-0"
              >
                Pre-Order Volume 1
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Full Screen, Slides from Left */}
      <div 
        className={`fixed top-16 sm:top-20 left-0 right-0 bottom-0 z-40 lg:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        {/* Full Screen Menu Panel - Slides from Left */}
        <div 
          className={`absolute inset-0 bg-white transform transition-transform duration-300 ease-out ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Menu Items */}
          <nav className="px-6 pt-8 pb-8 overflow-y-auto h-[calc(100vh-96px)]">
            <div className="flex flex-col space-y-2 max-w-7xl mx-auto" style={{ paddingTop: '100px' }}>
              {NAV_ITEMS.map((item) => {
                if (item.type === 'link') {
                  const isActive = isNavItemActive(item);
                  return (
                    <Link
                      key={item.label}
                      to={item.href}
                      onMouseEnter={item.href === '/mission' ? () => import('../pages/Mission') : undefined}
                      onClick={(e) => {
                        setIsMobileMenuOpen(false);
                        handleNavLinkClick(e, item.href);
                      }}
                      className={`px-6 py-6 text-navy-600 text-2xl font-semibold hover:bg-navy-50 transition-colors border-b border-navy-100 flex items-center justify-between rounded-lg ${isActive ? 'bg-navy-50 font-bold' : ''}`}
                    >
                      <span>{item.label}</span>
                      <svg className="w-7 h-7 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
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
                                    onClick={(e) => {
                                      setIsMobileMenuOpen(false);
                                      setShowMobileResourcesDropdown(false);
                                      handleNavLinkClick(e, dropdownItem.href);
                                    }}
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
                                    onClick={(e) => {
                                      setIsMobileMenuOpen(false);
                                      setShowMobileResourcesDropdown(false);
                                      handleNavLinkClick(e, dropdownItem.href);
                                    }}
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
                                <Link to="/resources?audience=kids" onClick={() => { setIsMobileMenuOpen(false); setShowMobileResourcesDropdown(false); }} className="block rounded-lg p-3 bg-white hover:bg-navy-50 transition-colors text-center border border-navy-100">
                                  <div className="font-semibold text-sm text-navy-700">For Kids</div>
                                </Link>
                                <Link to="/resources?audience=parents" onClick={() => { setIsMobileMenuOpen(false); setShowMobileResourcesDropdown(false); }} className="block rounded-lg p-3 bg-white hover:bg-navy-50 transition-colors text-center border border-navy-100">
                                  <div className="font-semibold text-sm text-navy-700">For Parents</div>
                                </Link>
                                <Link to="/resources?audience=teachers" onClick={() => { setIsMobileMenuOpen(false); setShowMobileResourcesDropdown(false); }} className="block rounded-lg p-3 bg-white hover:bg-navy-50 transition-colors text-center border border-navy-100">
                                  <div className="font-semibold text-sm text-navy-700">For Teachers</div>
                                </Link>
                                <Link to="/resources" onClick={() => { setIsMobileMenuOpen(false); setShowMobileResourcesDropdown(false); }} className="block rounded-lg p-3 bg-white hover:bg-navy-50 transition-colors text-center border border-navy-100">
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
                                  onClick={(e) => {
                                    setIsMobileMenuOpen(false);
                                    if (item.label === 'Shop') setShowMobileShopDropdown(false);
                                    if (item.label === 'The World') setShowMobileWorldDropdown(false);
                                    handleNavLinkClick(e, dropdownItem.href);
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
              <Link
                to={RIGHT_NAV_ITEMS.partnerLink.href}
                onClick={(e) => {
                  setIsMobileMenuOpen(false);
                  handleNavLinkClick(e, RIGHT_NAV_ITEMS.partnerLink.href);
                }}
                className={`px-6 py-6 text-navy-600 text-2xl font-semibold hover:bg-navy-50 transition-colors border-b border-navy-100 flex items-center justify-between rounded-lg ${isNavItemActive({ href: RIGHT_NAV_ITEMS.partnerLink.href, activePaths: RIGHT_NAV_ITEMS.partnerLink.activePaths } as NavItem) ? 'bg-navy-50 font-bold' : ''}`}
              >
                <span>{RIGHT_NAV_ITEMS.partnerLink.label}</span>
                <svg className="w-7 h-7 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              
              {/* CTA Button in Mobile Menu */}
              <div className="px-6 py-6 mt-4">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => {
                    navigate('/comicbook');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Pre-Order Volume 1
                </Button>
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* Pre-order Modal */}
      {isPreorderOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
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
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Header;

