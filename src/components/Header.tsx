import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getWaitlistUrl, openExternalUrl } from '../config/externalLinks';
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
  const [showMobileResourcesDropdown, setShowMobileResourcesDropdown] = useState(false);
  const [showMobileShopDropdown, setShowMobileShopDropdown] = useState(false);
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);
  const [shopCloseTimeout, setShopCloseTimeout] = useState<NodeJS.Timeout | null>(null);

  // Handle scroll for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
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
    };
  }, [closeTimeout, shopCloseTimeout]);

  const handleWaitlistClick = () => {
    const waitlistUrl = getWaitlistUrl();
    if (waitlistUrl) {
      openExternalUrl(waitlistUrl);
    } else {
      setIsPreorderOpen(true);
    }
  };

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

  // Handle About link click - navigate and scroll
  const handleAboutClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (location.pathname !== '/') {
      // If not on homepage, navigate to homepage with hash
      e.preventDefault();
      navigate('/#about');
      // Scroll will happen after navigation via hash
    } else {
      // If already on homepage, just scroll
      e.preventDefault();
      const element = document.getElementById('about');
      if (element) {
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
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

  const handleToggleResourcesDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowResourcesDropdown(!showResourcesDropdown);
  };

  const handleToggleShopDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowShopDropdown(!showShopDropdown);
  };

  const handleKeyDown = (e: React.KeyboardEvent, toggleFn: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleFn();
    }
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md transition-all duration-300 ${isScrolled ? 'bg-navy-500 shadow-xl' : 'bg-white/90 shadow-md'}`} style={isScrolled ? { boxShadow: '0 10px 25px -5px rgba(36, 62, 112, 0.4), 0 8px 10px -6px rgba(36, 62, 112, 0.3)' } : { boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-3">
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
                className="inline-block hover:opacity-80 transition-opacity"
              >
                <img 
                  src="/logoCaiden.png" 
                  alt="Caiden's Courage" 
                  className="h-10 sm:h-12 w-auto"
                />
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link 
                to="/mission" 
                className={`nav-link-underline font-semibold transition-all duration-300 hover:font-bold ${isScrolled ? 'text-white' : 'text-navy-500'} ${location.pathname === '/mission' ? 'font-bold border-b-2 border-golden-500' : ''}`}
              >
                Mission
              </Link>
              <Link 
                to="/#about"
                onClick={handleAboutClick}
                className={`nav-link-underline font-semibold transition-all duration-300 hover:font-bold ${isScrolled ? 'text-white' : 'text-navy-500'}`}
              >
                About
              </Link>
              <Link 
                to="/#characters"
                onClick={(e) => {
                  if (location.pathname !== '/') {
                    e.preventDefault();
                    navigate('/#characters');
                  } else {
                    e.preventDefault();
                    const element = document.getElementById('characters');
                    if (element) {
                      const headerOffset = 80;
                      const elementPosition = element.getBoundingClientRect().top;
                      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                      window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                      });
                    }
                  }
                }}
                className={`nav-link-underline font-semibold transition-all duration-300 hover:font-bold ${isScrolled ? 'text-white' : 'text-navy-500'}`}
              >
                Characters
              </Link>
              
              {/* Shop Dropdown */}
              <div 
                className="relative has-dropdown"
                onMouseEnter={handleShopMouseEnter}
                onMouseLeave={handleShopMouseLeave}
              >
                <div
                  className={`nav-link-underline font-semibold transition-all duration-300 hover:font-bold flex items-center gap-1.5 cursor-pointer ${isScrolled ? 'text-white' : 'text-navy-500'}`}
                  onClick={handleToggleShopDropdown}
                  onKeyDown={(e) => handleKeyDown(e, () => setShowShopDropdown(!showShopDropdown))}
                  role="button"
                  tabIndex={0}
                  aria-haspopup="true"
                  aria-expanded={showShopDropdown}
                >
                  Shop
                  <svg 
                    className={`w-4 h-4 transition-transform duration-300 ${showShopDropdown ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                {/* Invisible hover bridge */}
                <div className="absolute top-full left-0 w-full h-3" />
                
                <div 
                  className={`dropdown-menu absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl py-2 min-w-[240px] z-50 transition-all duration-200 ${
                    showShopDropdown 
                      ? 'opacity-100 visible pointer-events-auto translate-y-0' 
                      : 'opacity-0 invisible pointer-events-none -translate-y-2'
                  }`}
                  style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                  onMouseEnter={handleShopMouseEnter}
                  onMouseLeave={handleShopMouseLeave}
                >
                  <Link
                    to="/comicbook"
                    className="block w-full text-left px-4 py-2.5 text-navy-500 hover:bg-navy-50 transition-colors"
                    onClick={() => setShowShopDropdown(false)}
                  >
                    <div className="font-semibold text-sm">Comic Book</div>
                    <div className="text-xs text-navy-400 mt-0.5">Volume 1: The Graphic Novel</div>
                  </Link>
                  <button
                    onClick={() => {
                      setShowShopDropdown(false);
                      handleComingSoonClick();
                    }}
                    className="block w-full text-left px-4 py-2.5 text-navy-500 hover:bg-navy-50 transition-colors"
                  >
                    <div className="font-semibold text-sm">T-shirts <span className="text-xs font-normal">— Coming Soon</span></div>
                    <div className="text-xs text-navy-400 mt-0.5">Caiden's courage t-shirts</div>
                  </button>
                  <button
                    onClick={() => {
                      setShowShopDropdown(false);
                      handleComingSoonClick();
                    }}
                    className="block w-full text-left px-4 py-2.5 text-navy-500 hover:bg-navy-50 transition-colors"
                  >
                    <div className="font-semibold text-sm">Plushies <span className="text-xs font-normal">— Coming Soon</span></div>
                    <div className="text-xs text-navy-400 mt-0.5">Soft companions for your journey</div>
                  </button>
                </div>
              </div>
              
              {/* Resources Dropdown */}
              <div 
                className="relative has-dropdown"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div
                  className={`nav-link-underline font-semibold transition-all duration-300 hover:font-bold flex items-center gap-1.5 cursor-pointer ${isScrolled ? 'text-white' : 'text-navy-500'}`}
                  onClick={handleToggleResourcesDropdown}
                  onKeyDown={(e) => handleKeyDown(e, () => setShowResourcesDropdown(!showResourcesDropdown))}
                  role="button"
                  tabIndex={0}
                  aria-haspopup="true"
                  aria-expanded={showResourcesDropdown}
                >
                  Resources
                  <svg 
                    className={`w-4 h-4 transition-transform duration-300 ${showResourcesDropdown ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                {/* Invisible hover bridge */}
                <div className="absolute top-full left-0 w-full h-3" />
                
                <div 
                  className={`dropdown-menu absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl py-2 min-w-[240px] z-50 transition-all duration-200 ${
                    showResourcesDropdown 
                      ? 'opacity-100 visible pointer-events-auto translate-y-0' 
                      : 'opacity-0 invisible pointer-events-none -translate-y-2'
                  }`}
                  style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    to="/resources?audience=kids"
                    className="block w-full text-left px-4 py-2.5 text-navy-500 hover:bg-navy-50 transition-colors"
                    onClick={() => setShowResourcesDropdown(false)}
                  >
                    <div className="font-semibold text-sm">For Kids</div>
                    <div className="text-xs text-navy-400 mt-0.5">Coloring pages, wallpapers, fun activities</div>
                  </Link>
                  <Link
                    to="/resources?audience=parents"
                    className="block w-full text-left px-4 py-2.5 text-navy-500 hover:bg-navy-50 transition-colors"
                    onClick={() => setShowResourcesDropdown(false)}
                  >
                    <div className="font-semibold text-sm">For Parents</div>
                    <div className="text-xs text-navy-400 mt-0.5">Guides, tips, explanations</div>
                  </Link>
                  <Link
                    to="/resources?audience=teachers"
                    className="block w-full text-left px-4 py-2.5 text-navy-500 hover:bg-navy-50 transition-colors"
                    onClick={() => setShowResourcesDropdown(false)}
                  >
                    <div className="font-semibold text-sm">For Teachers</div>
                    <div className="text-xs text-navy-400 mt-0.5">Worksheets, classroom tools</div>
                  </Link>
                  <Link
                    to="/resources"
                    className="block w-full text-left px-4 py-2.5 text-navy-500 hover:bg-navy-50 transition-colors border-t border-navy-100 mt-1 pt-2"
                    onClick={() => setShowResourcesDropdown(false)}
                  >
                    <div className="font-semibold text-sm">All Resources</div>
                    <div className="text-xs text-navy-400 mt-0.5">Browse everything</div>
                  </Link>
                </div>
              </div>
              
              {/* Comic Book */}
              <Link
                to="/comicbook" 
                className={`nav-link-underline font-semibold transition-all duration-300 hover:font-bold ${isScrolled ? 'text-white' : 'text-navy-500'} ${location.pathname === '/comicbook' || location.pathname === '/product' ? 'font-bold border-b-2 border-golden-500' : ''}`}
              >
                Comic Book
              </Link>
              
              {/* Contact */}
              <Link
                to="/contact"
                className={`nav-link-underline font-semibold transition-all duration-300 hover:font-bold ${isScrolled ? 'text-white' : 'text-navy-500'} ${location.pathname === '/contact' ? 'font-bold border-b-2 border-golden-500' : ''}`}
              >
                Contact
              </Link>
            </nav>
            
            {/* Action Area - CTA Button */}
            <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
              <Button
                variant="primary"
                size="sm"
                onClick={handleWaitlistClick}
                className="whitespace-nowrap flex-shrink-0 text-xs sm:text-sm"
              >
                Join Courage Community
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
              <Link
                to="/mission"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-6 py-6 text-navy-600 text-2xl font-semibold hover:bg-navy-50 transition-colors border-b border-navy-100 flex items-center justify-between rounded-lg ${location.pathname === '/mission' ? 'bg-navy-50 font-bold' : ''}`}
              >
                <span>Mission</span>
                <svg className="w-7 h-7 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              
              <Link
                to="/#about"
                onClick={(e) => {
                  setIsMobileMenuOpen(false);
                  handleAboutClick(e);
                }}
                className="px-6 py-6 text-navy-600 text-2xl font-semibold hover:bg-navy-50 transition-colors border-b border-navy-100 flex items-center justify-between rounded-lg"
              >
                <span>About</span>
                <svg className="w-7 h-7 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              
              <Link
                to="/#characters"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-6 py-6 text-navy-600 text-2xl font-semibold hover:bg-navy-50 transition-colors border-b border-navy-100 flex items-center justify-between rounded-lg"
              >
                <span>Characters</span>
                <svg className="w-7 h-7 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              
              {/* Shop Dropdown in Mobile Menu */}
              <div className="border-b border-navy-100">
                <button
                  onClick={() => setShowMobileShopDropdown(!showMobileShopDropdown)}
                  className="w-full px-6 py-6 text-navy-600 text-2xl font-semibold hover:bg-navy-50 transition-colors flex items-center justify-between rounded-lg"
                >
                  <span>Shop</span>
                  <svg 
                    className={`w-7 h-7 text-navy-400 transition-transform duration-300 ${showMobileShopDropdown ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div className={`overflow-hidden transition-all duration-300 ${
                  showMobileShopDropdown ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <Link
                    to="/comicbook"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setShowMobileShopDropdown(false);
                    }}
                    className="block px-12 py-4 text-navy-500 hover:bg-navy-50 transition-colors"
                  >
                    <div className="font-semibold text-lg">Comic Book</div>
                    <div className="text-sm text-navy-400 mt-0.5">Volume 1: The Graphic Novel</div>
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setShowMobileShopDropdown(false);
                      handleComingSoonClick();
                    }}
                    className="block w-full text-left px-12 py-4 text-navy-500 hover:bg-navy-50 transition-colors"
                  >
                    <div className="font-semibold text-lg">T-shirts <span className="text-base font-normal">— Coming Soon</span></div>
                    <div className="text-sm text-navy-400 mt-0.5">Caiden's courage t-shirts</div>
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setShowMobileShopDropdown(false);
                      handleComingSoonClick();
                    }}
                    className="block w-full text-left px-12 py-4 text-navy-500 hover:bg-navy-50 transition-colors"
                  >
                    <div className="font-semibold text-lg">Plushies <span className="text-base font-normal">— Coming Soon</span></div>
                    <div className="text-sm text-navy-400 mt-0.5">Soft companions for your journey</div>
                  </button>
                </div>
              </div>
              
              {/* Resources Dropdown in Mobile Menu */}
              <div className="border-b border-navy-100">
                <button
                  onClick={() => setShowMobileResourcesDropdown(!showMobileResourcesDropdown)}
                  className="w-full px-6 py-6 text-navy-600 text-2xl font-semibold hover:bg-navy-50 transition-colors flex items-center justify-between rounded-lg"
                >
                  <span>Resources</span>
                  <svg 
                    className={`w-7 h-7 text-navy-400 transition-transform duration-300 ${showMobileResourcesDropdown ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div className={`overflow-hidden transition-all duration-300 ${
                  showMobileResourcesDropdown ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <Link
                    to="/resources?audience=kids"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setShowMobileResourcesDropdown(false);
                    }}
                    className="block px-12 py-4 text-navy-500 hover:bg-navy-50 transition-colors"
                  >
                    <div className="font-semibold text-lg">For Kids</div>
                    <div className="text-sm text-navy-400 mt-0.5">Coloring pages, wallpapers, fun activities</div>
                  </Link>
                  <Link
                    to="/resources?audience=parents"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setShowMobileResourcesDropdown(false);
                    }}
                    className="block px-12 py-4 text-navy-500 hover:bg-navy-50 transition-colors"
                  >
                    <div className="font-semibold text-lg">For Parents</div>
                    <div className="text-sm text-navy-400 mt-0.5">Guides, tips, explanations</div>
                  </Link>
                  <Link
                    to="/resources?audience=teachers"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setShowMobileResourcesDropdown(false);
                    }}
                    className="block px-12 py-4 text-navy-500 hover:bg-navy-50 transition-colors"
                  >
                    <div className="font-semibold text-lg">For Teachers</div>
                    <div className="text-sm text-navy-400 mt-0.5">Worksheets, classroom tools</div>
                  </Link>
                  <Link
                    to="/resources"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setShowMobileResourcesDropdown(false);
                    }}
                    className="block px-12 py-4 text-navy-500 hover:bg-navy-50 transition-colors border-t border-navy-100 mt-1 pt-4"
                  >
                    <div className="font-semibold text-lg">All Resources</div>
                    <div className="text-sm text-navy-400 mt-0.5">Browse everything</div>
                  </Link>
                </div>
              </div>
              
              <Link
                to="/comicbook"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-6 py-6 text-navy-600 text-2xl font-semibold hover:bg-navy-50 transition-colors border-b border-navy-100 flex items-center justify-between rounded-lg"
              >
                <span>Comic Book</span>
                <svg className="w-7 h-7 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              
              <Link
                to="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-6 py-6 text-navy-600 text-2xl font-semibold hover:bg-navy-50 transition-colors border-b border-navy-100 flex items-center justify-between rounded-lg ${location.pathname === '/contact' ? 'bg-navy-50 font-bold' : ''}`}
              >
                <span>Contact</span>
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
                    handleWaitlistClick();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Join Courage Community
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

