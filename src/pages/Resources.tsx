import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { RESOURCES, ResourceType, Audience } from '../data/resources';
import { getWaitlistUrl, openExternalUrl } from '../config/externalLinks';
import Button from '../components/ui/Button';

const Resources: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ResourceType | 'all'>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedAudience, setSelectedAudience] = useState<Audience | 'all'>('all');
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showResourcesDropdown, setShowResourcesDropdown] = useState(false);
  const [showShopDropdown, setShowShopDropdown] = useState(false);
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);
  const [shopCloseTimeout, setShopCloseTimeout] = useState<NodeJS.Timeout | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileResourcesDropdown, setShowMobileResourcesDropdown] = useState(false);

  // Scroll-triggered animations for sections
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleSections((prev) => new Set(prev).add(entry.target.id));
        }
      });
    }, observerOptions);

    // Observe all sections
    const sections = document.querySelectorAll('[data-section]');
    sections.forEach((section) => {
      observer.observe(section);
    });

    return () => {
      sections.forEach((section) => {
        observer.unobserve(section);
      });
    };
  }, []);

  // Check URL params for filter on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const typeParam = params.get('type');
    const audienceParam = params.get('audience');
    
    if (typeParam === 'all') {
      setSelectedType('all');
    } else if (typeParam && ['wallpaper', 'coloring', 'worksheet', 'teacher-pack'].includes(typeParam)) {
      setSelectedType(typeParam as ResourceType);
    }
    
    if (audienceParam === 'kids') {
      setSelectedAudience('students');
    } else if (audienceParam && ['parents', 'teachers', 'all'].includes(audienceParam)) {
      setSelectedAudience(audienceParam as Audience);
    }
  }, [location.search]);

  // Handle scroll + highlight when audience filter changes (from URL or dropdown)
  useEffect(() => {
    if (location.pathname === '/resources') {
      const params = new URLSearchParams(location.search);
      const audienceParam = params.get('audience');
      
      // Only scroll/highlight if audience param is present (user clicked dropdown or deep-linked)
      if (audienceParam) {
        // Wait for DOM to update, then scroll and highlight
        requestAnimationFrame(() => {
          setTimeout(() => {
            const el = document.getElementById('resource-results');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              
              // Remove any existing highlight classes
              document.querySelectorAll('.section-anchor.anchor-landed').forEach(element => {
                element.classList.remove('anchor-landed');
              });
              
              // Add highlight animation class
              el.classList.add('anchor-landed');
              
              // Remove class after animation completes
              setTimeout(() => {
                el.classList.remove('anchor-landed');
              }, 1100);
            }
          }, 100);
        });
      }
    }
  }, [location.search, location.pathname]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showResourcesDropdown) {
        setShowResourcesDropdown(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showResourcesDropdown]);

  // Handle click outside to close dropdown (mobile)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showResourcesDropdown && !target.closest('.has-dropdown')) {
        setShowResourcesDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showResourcesDropdown]);

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

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleWaitlistClick = () => {
    const waitlistUrl = getWaitlistUrl();
    if (waitlistUrl) return openExternalUrl(waitlistUrl);
  };

  const handleLogoClick = () => {
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  // Get all unique tags from resources
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    RESOURCES.forEach(resource => {
      resource.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, []);

  // Filter resources based on search, type, tag, and audience
  const filteredResources = useMemo(() => {
    return RESOURCES.filter(resource => {
      // Type filter
      if (selectedType !== 'all' && resource.type !== selectedType) {
        return false;
      }

      // Tag filter
      if (selectedTag !== 'all' && !resource.tags.includes(selectedTag)) {
        return false;
      }

      // Audience filter
      if (selectedAudience !== 'all' && !resource.audience.includes(selectedAudience)) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const searchableText = [
          resource.title,
          resource.description || '',
          ...resource.tags
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, selectedType, selectedTag, selectedAudience]);

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with email service
    setEmailSubmitted(true);
    setEmail('');
    setTimeout(() => setEmailSubmitted(false), 3000);
  };

  const handleDownload = (fileUrl: string, title: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = (fileUrl: string) => {
    window.open(fileUrl, '_blank');
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
    }, 200); // 200ms delay before closing
    setCloseTimeout(timeout);
  };

  const handleToggleDropdown = () => {
    setShowResourcesDropdown(!showResourcesDropdown);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggleDropdown();
    }
  };

  return (
    <div className="min-h-screen bg-cream font-body">
      {/* Navigation */}
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
            
            {/* Desktop Navigation - Only visible on desktop (lg and up) */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link 
                to="/#about" 
                className={`nav-link-underline font-semibold transition-all duration-300 hover:font-bold ${isScrolled ? 'text-white' : 'text-navy-500'}`}
              >
                About
              </Link>
              <Link 
                to="/#characters" 
                className={`nav-link-underline font-semibold transition-all duration-300 hover:font-bold ${isScrolled ? 'text-white' : 'text-navy-500'}`}
              >
                Characters
              </Link>
              
              {/* Shop Dropdown */}
              <div 
                className="relative has-dropdown"
                onMouseEnter={() => {
                  if (shopCloseTimeout) {
                    clearTimeout(shopCloseTimeout);
                    setShopCloseTimeout(null);
                  }
                  setShowShopDropdown(true);
                }}
                onMouseLeave={() => {
                  const timeout = setTimeout(() => {
                    setShowShopDropdown(false);
                  }, 200);
                  setShopCloseTimeout(timeout);
                }}
              >
                <div
                  className={`nav-link-underline font-semibold transition-all duration-300 hover:font-bold flex items-center gap-1.5 cursor-pointer ${isScrolled ? 'text-white' : 'text-navy-500'}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setShowShopDropdown(!showShopDropdown);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setShowShopDropdown(!showShopDropdown);
                    }
                  }}
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
                  onMouseEnter={() => {
                    if (shopCloseTimeout) {
                      clearTimeout(shopCloseTimeout);
                      setShopCloseTimeout(null);
                    }
                    setShowShopDropdown(true);
                  }}
                  onMouseLeave={() => {
                    const timeout = setTimeout(() => {
                      setShowShopDropdown(false);
                    }, 200);
                    setShopCloseTimeout(timeout);
                  }}
                >
                  <Link
                    to="/comicbook"
                    className="block w-full text-left px-4 py-2.5 text-navy-500 hover:bg-navy-50 transition-colors"
                    onClick={() => setShowShopDropdown(false)}
                  >
                    <div className="font-semibold text-sm">Comic Book</div>
                    <div className="text-xs text-navy-400 mt-0.5">Volume 1: The Graphic Novel</div>
                  </Link>
                  <Link
                    to="/#products"
                    className="block w-full text-left px-4 py-2.5 text-navy-500 hover:bg-navy-50 transition-colors"
                    onClick={() => setShowShopDropdown(false)}
                  >
                    <div className="font-semibold text-sm">T-shirts</div>
                    <div className="text-xs text-navy-400 mt-0.5">Caiden's courage t-shirts</div>
                  </Link>
                  <div className="block w-full text-left px-4 py-2.5 text-navy-500 opacity-60 cursor-not-allowed">
                    <div className="font-semibold text-sm">Plushies <span className="text-xs font-normal">(Coming soon)</span></div>
                    <div className="text-xs text-navy-400 mt-0.5">Soft companions for your journey</div>
                  </div>
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
                  onClick={handleToggleDropdown}
                  onKeyDown={handleKeyDown}
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
                className={`nav-link-underline font-semibold transition-all duration-300 hover:font-bold ${isScrolled ? 'text-white' : 'text-navy-500'}`}
              >
                Comic Book
              </Link>
            </nav>
            
            {/* Action Area - Contact + Join Waitlist Button */}
            <div className="flex items-center gap-6">
              <a 
                href="mailto:stills@caidenscourage.com" 
                className={`nav-link-underline font-semibold transition-all duration-300 hover:font-bold ${isScrolled ? 'text-white' : 'text-navy-500'}`}
              >
                Contact
              </a>
              <Button
                variant="primary"
                size="sm"
                onClick={handleWaitlistClick}
              >
                Join Waitlist
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Full Screen, Slides from Left, Under Navigation */}
      <div 
        className={`fixed top-16 sm:top-20 left-0 right-0 bottom-0 z-40 md:hidden transition-opacity duration-300 ${
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
          {/* Menu Items - Centered */}
          <nav className="px-6 pt-8 pb-8 overflow-y-auto h-[calc(100vh-96px)]">
            <div className="flex flex-col space-y-2 max-w-7xl mx-auto" style={{ paddingTop: '100px' }}>
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
                to="/#about"
                onClick={() => setIsMobileMenuOpen(false)}
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
              
              <Link
                to="/#products"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-6 py-6 text-navy-600 text-2xl font-semibold hover:bg-navy-50 transition-colors border-b border-navy-100 flex items-center justify-between rounded-lg"
              >
                <span>Shop</span>
                <svg className="w-7 h-7 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              
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
                    to="/resources?audience=all"
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
              
              <a
                href="mailto:stills@caidenscourage.com"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-6 py-6 text-navy-600 text-2xl font-semibold hover:bg-navy-50 transition-colors border-b border-navy-100 flex items-center justify-between rounded-lg"
              >
                <span>Contact</span>
                <svg className="w-7 h-7 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
              
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
                  Join Waitlist
                </Button>
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div 
        id="resources-header"
        data-section="header"
        className={`bg-navy-500 text-white py-16 pt-32 fade-in-up ${visibleSections.has('resources-header') ? 'visible' : ''}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4">
            Resources
          </h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-3xl mb-2">
            Download free wallpapers, coloring pages, SEL worksheets, and teacher packs to support courage, creativity, and neurodiverse kids.
          </p>
          <p className="text-sm sm:text-base text-white/80">
            All resources are free and designed to support neurodiverse kids.
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div 
        id="resources-filters"
        data-section="filters"
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in-up ${visibleSections.has('resources-filters') ? 'visible' : ''}`}
        style={{ marginTop: '70px' }}
      >
        {/* White Card Container */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-8">
          {/* Audience Filter Buttons */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-navy-700 mb-3">I'm looking for resources for:</label>
            <div className="pill-toggle is-scroll">
              <button
                onClick={() => setSelectedAudience('all')}
                className="pill"
                data-persona="everyone"
                data-selected={selectedAudience === 'all'}
              >
                Everyone
              </button>
              <button
                onClick={() => setSelectedAudience('parents')}
                className="pill"
                data-persona="parents"
                data-selected={selectedAudience === 'parents'}
              >
                Parents
              </button>
              <button
                onClick={() => setSelectedAudience('teachers')}
                className="pill"
                data-persona="teachers"
                data-selected={selectedAudience === 'teachers'}
              >
                Teachers
              </button>
              <button
                onClick={() => setSelectedAudience('students')}
                className="pill"
                data-persona="kids"
                data-selected={selectedAudience === 'students'}
              >
                Students
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-full border-2 border-gray-300 focus:border-navy-500 focus:outline-none text-navy-700 bg-white shadow-sm"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">🔍</span>
            </div>

            {/* Type Filter */}
            <div className="md:w-64 relative">
              <label htmlFor="type-filter" className="sr-only">Resource Type</label>
              <select
                id="type-filter"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as ResourceType | 'all')}
                className="w-full px-4 py-3 pr-10 rounded-full border-2 border-gray-300 focus:border-navy-500 focus:outline-none text-navy-700 bg-white shadow-sm appearance-none"
              >
                <option value="all">All Resource Types</option>
                <option value="wallpaper">Wallpapers</option>
                <option value="coloring">Coloring Pages</option>
                <option value="worksheet">SEL Worksheets</option>
                <option value="teacher-pack">Teacher Packs</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Tag Filter */}
            <div className="md:w-64 relative">
              <label htmlFor="tag-filter" className="sr-only">Tags</label>
              <select
                id="tag-filter"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full px-4 py-3 pr-10 rounded-full border-2 border-gray-300 focus:border-navy-500 focus:outline-none text-navy-700 bg-white shadow-sm appearance-none"
              >
                <option value="all">All Tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>
                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-navy-600">
          <p className="text-sm">
            Showing {filteredResources.length} of {RESOURCES.length} resources
          </p>
        </div>

        {/* Resources Grid - Wrapped in anchor div for scroll target */}
        <div id="resource-results" className="section-anchor">
        <div 
          id="resources-grid"
          data-section="grid"
          className={`fade-in-up ${visibleSections.has('resources-grid') ? 'visible' : ''}`}
        >
        {filteredResources.length === 0 ? (
          <div className="text-center py-16 px-4">
            <p className="text-navy-600 text-lg mb-4">
              We're creating more courage tools right now 💛
            </p>
            <p className="text-navy-500 text-base mb-6">
              Want to be notified when new resources are added?
            </p>
            <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-4 py-3 rounded-lg border-2 border-navy-300 focus:border-navy-500 focus:outline-none text-navy-700"
                />
                <button
                  type="submit"
                  className="btn btn--sm"
                  style={{
                    backgroundColor: 'var(--navy-500)',
                    color: 'white',
                    border: 'none'
                  }}
                  disabled={emailSubmitted}
                >
                  {emailSubmitted ? '✓ Notified!' : 'Notify Me'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredResources.map((resource) => (
              <div
                key={resource.id}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-navy-100 flex flex-col h-full"
              >
                {/* Thumbnail */}
                <div className="aspect-square bg-navy-100 relative overflow-hidden">
                  <img
                    src={resource.thumbnail}
                    alt={resource.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/logoCaiden.png';
                    }}
                  />
                  {resource.format && (
                    <div className="absolute top-2 right-2 bg-navy-500 text-white text-xs px-2 py-1 rounded font-semibold">
                      {resource.format}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="px-5 pt-5 pb-6 flex flex-col flex-grow">
                  <h3 className="font-display font-bold text-lg text-navy-500 mb-2" title={resource.title}>
                    {resource.title}
                  </h3>

                  {resource.description && (
                    <p className="text-sm text-navy-600 mb-4 leading-relaxed flex-grow">
                      {resource.description}
                    </p>
                  )}

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {resource.ageRange && (
                      <span className="text-xs px-3 py-1 bg-navy-100 text-navy-600 rounded-full font-semibold">
                        {resource.ageRange}
                      </span>
                    )}
                    {resource.format && (
                      <span className="text-xs px-3 py-1 bg-navy-100 text-navy-600 rounded-full font-semibold">
                        {resource.format === 'PDF' ? 'Printable' : resource.format}
                      </span>
                    )}
                    {resource.useCase && (
                      <span className="text-xs px-3 py-1 bg-navy-100 text-navy-600 rounded-full font-semibold">
                        {resource.useCase === 'both' ? 'Classroom & Home' : resource.useCase === 'home' ? 'Home' : 'Classroom'}
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {resource.tags.map(tag => (
                      <button
                        key={tag}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTagClick(tag);
                        }}
                        className="text-xs px-2 py-1 bg-golden-100 text-navy-600 rounded-full hover:bg-golden-200 hover:shadow-md hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-golden-500"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 mt-auto pt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreview(resource.fileUrl);
                      }}
                      className="flex-1 px-4 py-2 bg-navy-500 text-white rounded-full font-semibold hover:bg-navy-600 hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2"
                    >
                      Preview
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(resource.fileUrl, resource.title);
                      }}
                      className="flex-1 px-4 py-2 bg-golden-500 text-navy-500 rounded-full font-semibold hover:bg-golden-600 hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm focus:outline-none focus:ring-2 focus:ring-golden-500 focus:ring-offset-2"
                      style={{ opacity: 1, backgroundColor: '#F0CE6E' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '1';
                        e.currentTarget.style.backgroundColor = '#e8c255';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                        e.currentTarget.style.backgroundColor = '#F0CE6E';
                      }}
                    >
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
        </div>

        {/* FAQ / Help Section */}
        <div style={{ marginTop: '180px', marginBottom: '100px' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-8 sm:mb-10 lg:mb-12">
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-500 mb-2 sm:mb-3">
                Frequently Asked Questions
              </h2>
              <p className="text-lg sm:text-xl text-navy-600 max-w-3xl mx-auto mb-2">
                Everything you need to know about downloading and using our free resources.
              </p>
              <p className="text-sm text-navy-500 max-w-2xl mx-auto">
                Parents, teachers, and students can download resources instantly — no login required.
              </p>
            </div>

            {/* Two-column layout: Illustration + FAQ Accordion */}
            <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left: FAQ Illustration */}
              <div className="order-2 md:order-1 mb-12 md:mb-0">
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-navy-100">
                  <img
                    src="/Caiden_FAQ_section.jpg"
                    alt="Caiden using resources and worksheets"
                    className="w-full h-auto object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/logoCaiden.png';
                    }}
                  />
                </div>
              </div>

              {/* Right: FAQ Accordion */}
              <div className="order-1 md:order-2">
                <div className="space-y-1">
                  {[
                    {
                      question: "Are these resources free?",
                      answer: "Yes. All resources on this page are free to download and designed to support courage, creativity, and neurodiverse kids."
                    },
                    {
                      question: "Do I need an account to download?",
                      answer: "No account needed. Just click Download and you'll get the file instantly."
                    },
                    {
                      question: "What ages are these for?",
                      answer: "Most resources are best for ages 7–12, but parents and teachers can adapt them for younger or older kids."
                    },
                    {
                      question: "Can I use these in the classroom?",
                      answer: "Yes. Teacher-friendly resources are made for classroom and home use. You can print and share them with your students."
                    },
                    {
                      question: "Can I print these worksheets?",
                      answer: "Yes. PDFs are printable. For best results, print at 100% scale on letter-size paper unless the download notes say otherwise."
                    },
                    {
                      question: "How do I use the SEL worksheets?",
                      answer: "Use them as a short reflection activity, a conversation starter, or part of a weekly check-in. They're designed to build emotional vocabulary and self-awareness."
                    },
                    {
                      question: "What if I can't open the file?",
                      answer: "Try opening PDFs in a browser or Adobe Reader. If you still have issues, contact us and we'll help."
                    },
                    {
                      question: "Will you add more resources?",
                      answer: "Yes. We're adding new wallpapers, coloring pages, SEL worksheets, and teacher packs regularly."
                    }
                  ].map((faq, index) => (
                    <div key={index} className="border-b border-navy-100 last:border-b-0">
                      <button
                        onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setOpenFaqIndex(openFaqIndex === index ? null : index);
                          } else if (e.key === 'Escape' && openFaqIndex === index) {
                            setOpenFaqIndex(null);
                          }
                        }}
                        className="w-full py-6 sm:py-7 text-left flex items-center justify-between focus:outline-none"
                        aria-expanded={openFaqIndex === index}
                        aria-controls={`faq-answer-${index}`}
                        id={`faq-question-${index}`}
                      >
                        <span className="font-semibold text-lg text-navy-600 pr-4 flex-1">
                          {faq.question}
                        </span>
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center transition-colors duration-200 hover:bg-orange-600">
                          {openFaqIndex === index ? (
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                            </svg>
                          ) : (
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                            </svg>
                          )}
                        </div>
                      </button>
                      <div
                        id={`faq-answer-${index}`}
                        role="region"
                        aria-labelledby={`faq-question-${index}`}
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          openFaqIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="pb-6 sm:pb-7 text-navy-600 leading-relaxed text-base">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Soft Engagement CTA */}
        {filteredResources.length > 0 && (
          <div 
            id="resources-cta"
            data-section="cta"
            className={`px-4 fade-in-up ${visibleSections.has('resources-cta') ? 'visible' : ''}`}
            style={{ marginTop: '150px', marginBottom: '150px' }}
          >
            <div className="relative w-full max-w-7xl mx-auto">
              {/* Blue to yellow gradient background */}
              <div className="relative bg-gradient-to-r from-navy-500 via-navy-400 to-yellow-200 rounded-3xl py-16 sm:py-20 lg:py-24 px-8 sm:px-12 lg:px-16 shadow-2xl overflow-hidden">
                <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                  {/* Left: Image */}
                  <div className="flex-shrink-0">
                    <img
                      src="/Caiden@4x-100.jpeg"
                      alt="Caiden"
                      className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full object-cover border-4 border-white/50 shadow-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/logoCaiden.png';
                      }}
                    />
                  </div>

                  {/* Right: Content - center aligned to image */}
                  <div className="flex-1 text-left flex flex-col justify-center">
                    <h3 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-white mb-3">
                      Get notified when new free resources are added
                    </h3>
                    <p className="text-white/90 mb-6 text-base sm:text-lg">
                      Join the Courage community for free tools and updates
                    </p>
                    <form onSubmit={handleEmailSubmit} className="max-w-lg">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          required
                          className="flex-1 px-5 py-3.5 rounded-full bg-white border-2 border-white/50 focus:border-white focus:outline-none text-navy-700 placeholder-navy-400/60 shadow-lg transition-all duration-300 hover:shadow-xl"
                        />
                        <button
                          type="submit"
                          className="px-8 py-3.5 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-all duration-300 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-navy-500 shadow-lg hover:shadow-xl hover:scale-105"
                        >
                          {emailSubmitted ? '✓ Subscribed!' : 'Subscribe'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-navy-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="font-display text-xl font-extrabold">
                <span className="text-white">Caiden's</span>
                <span className="text-golden-400">Courage</span>
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link to="/privacy" className="text-white/70 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-white/70 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <a href="mailto:stills@caidenscourage.com" className="text-white/70 hover:text-white transition-colors">
                Contact
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center">
            <p className="text-white/60 text-sm">
              © {new Date().getFullYear()} Caiden's Courage. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Resources;

