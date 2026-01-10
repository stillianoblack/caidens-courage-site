import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getStripePreorderUrl, getWaitlistUrl, openExternalUrl } from '../config/externalLinks';
import Button from '../components/ui/Button';

// Preview page data
const PREVIEW_PAGES = [
  { id: 1, image: '/previews/page-01.jpg', alt: 'Preview page 1' },
  { id: 2, image: '/previews/page-02.jpg', alt: 'Preview page 2' },
  { id: 3, image: '/previews/page-03.jpg', alt: 'Preview page 3' },
  { id: 4, image: '/previews/page-04.jpg', alt: 'Preview page 4' },
  { id: 5, image: '/previews/page-05.jpg', alt: 'Preview page 5' },
];

// Gentle anchor messages between pages
// Note 1 shows when currentPage === 3 (between page 2 and 3)
// Note 2 shows when currentPage === 5 (between page 4 and 5)
const ANCHOR_MESSAGES: Record<number, string> = {
  3: "Caiden struggles with focus — not because he's broken, but because he sees more.",
  5: "This story blends emotional growth with adventure."
};

const Preview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [isPreorderOpen, setIsPreorderOpen] = useState(false);
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [imagesLoaded, setImagesLoaded] = useState<Set<number>>(new Set());
  
  // Full-screen reading modal state
  const [isReadingModalOpen, setIsReadingModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isFitted, setIsFitted] = useState(true);
  const [showHelperText, setShowHelperText] = useState(false);
  
  // Touch gesture tracking
  const touchStartDistance = useRef<number | null>(null);
  const touchStartCenter = useRef<{ x: number; y: number } | null>(null);
  const lastTapTime = useRef<number>(0);
  const lastPanPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isPanning = useRef<boolean>(false);
  const swipeStartY = useRef<number | null>(null);
  const initialZoomLevel = useRef<number>(1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileResourcesDropdown, setShowMobileResourcesDropdown] = useState(false);
  const [showMobileShopDropdown, setShowMobileShopDropdown] = useState(false);
  const [showResourcesDropdown, setShowResourcesDropdown] = useState(false);
  const [showShopDropdown, setShowShopDropdown] = useState(false);
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);
  const [shopCloseTimeout, setShopCloseTimeout] = useState<NodeJS.Timeout | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const totalPages = PREVIEW_PAGES.length;

  // Handle scroll for navigation styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (closeTimeout) clearTimeout(closeTimeout);
      if (shopCloseTimeout) clearTimeout(shopCloseTimeout);
    };
  }, [closeTimeout, shopCloseTimeout]);

  // Check if image exists when page changes - add timeout to detect missing images
  useEffect(() => {
    const currentImageSrc = PREVIEW_PAGES[currentPage - 1].image;
    const img = new Image();
    let timeoutId: NodeJS.Timeout;

    // Set timeout to show error if image doesn't load within 3 seconds
    timeoutId = setTimeout(() => {
      setImageErrors(prev => {
        if (!prev.has(currentPage)) {
          return new Set(prev).add(currentPage);
        }
        return prev;
      });
    }, 3000);

    img.onload = () => {
      clearTimeout(timeoutId);
      setImagesLoaded(prev => new Set(prev).add(currentPage));
      setImageErrors(prev => {
        const next = new Set(prev);
        next.delete(currentPage);
        return next;
      });
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      setImageErrors(prev => new Set(prev).add(currentPage));
      setImagesLoaded(prev => {
        const next = new Set(prev);
        next.delete(currentPage);
        return next;
      });
    };

    img.src = currentImageSrc;

    return () => {
      clearTimeout(timeoutId);
    };
  }, [currentPage]);

  // Navigation handlers
  const handlePrevious = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setIsZoomed(false);
    }
  }, [currentPage]);

  const handleNext = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      setIsZoomed(false);
    }
  }, [currentPage, totalPages]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') setIsZoomed(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevious, handleNext]);

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    handleSwipe();
  };

  const handleSwipe = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        // Swipe left - next page
        handleNext();
      } else {
        // Swipe right - previous page
        handlePrevious();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Zoom handler (legacy - kept for compatibility)
  const handleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  // Full-screen reading modal handlers
  const openReadingModal = () => {
    setIsReadingModalOpen(true);
    // Disable body scroll
    document.body.style.overflow = 'hidden';
    // Check if helper text should show (first time only)
    const hasSeenHelper = localStorage.getItem('preview-helper-dismissed');
    if (!hasSeenHelper) {
      setShowHelperText(true);
      setTimeout(() => setShowHelperText(false), 4000);
    }
    // Reset zoom and pan
    setZoomLevel(1);
    setPanX(0);
    setPanY(0);
    setIsFitted(true);
  };

  const closeReadingModal = () => {
    setIsReadingModalOpen(false);
    // Re-enable body scroll
    document.body.style.overflow = '';
    // Reset zoom and pan
    setZoomLevel(1);
    setPanX(0);
    setPanY(0);
    setIsFitted(true);
  };

  const dismissHelperText = () => {
    setShowHelperText(false);
    localStorage.setItem('preview-helper-dismissed', 'true');
  };

  // Calculate distance between two touches
  const getTouchDistance = (touch1: React.Touch, touch2: React.Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Calculate center point between two touches
  const getTouchCenter = (touch1: React.Touch, touch2: React.Touch): { x: number; y: number } => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    };
  };

  // Handle touch start for reading modal
  const handleReadingModalTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch gesture - store initial zoom level
      const distance = getTouchDistance(e.touches[0], e.touches[1]);
      touchStartDistance.current = distance;
      initialZoomLevel.current = zoomLevel;
      const center = getTouchCenter(e.touches[0], e.touches[1]);
      touchStartCenter.current = center;
      isPanning.current = false;
      swipeStartY.current = null;
    } else if (e.touches.length === 1) {
      // Single touch - check for double tap or start pan/swipe
      const now = Date.now();
      const timeSinceLastTap = now - lastTapTime.current;
      
      if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
        // Double tap - toggle fit-to-screen
        e.preventDefault();
        toggleFitToScreen();
        lastTapTime.current = 0;
      } else {
        lastTapTime.current = now;
        const touch = e.touches[0];
        lastPanPosition.current = { x: touch.clientX, y: touch.clientY };
        swipeStartY.current = touch.clientY;
        isPanning.current = zoomLevel > 1.1; // Only pan if zoomed
      }
    }
  };

  // Handle touch move for reading modal
  const handleReadingModalTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDistance.current !== null && touchStartCenter.current) {
      // Pinch to zoom
      e.preventDefault();
      const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / touchStartDistance.current;
      const newZoom = Math.max(1, Math.min(5, initialZoomLevel.current * scale));
      setZoomLevel(newZoom);
      setIsFitted(false);
      
      touchStartDistance.current = currentDistance;
    } else if (e.touches.length === 1 && isPanning.current && zoomLevel > 1.1) {
      // Pan when zoomed
      e.preventDefault();
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const deltaX = currentX - lastPanPosition.current.x;
      const deltaY = currentY - lastPanPosition.current.y;
      
      setPanX(prev => {
        const maxPan = (zoomLevel - 1) * 200; // Limit pan based on zoom
        return Math.max(-maxPan, Math.min(maxPan, prev + deltaX));
      });
      setPanY(prev => {
        const maxPan = (zoomLevel - 1) * 200;
        return Math.max(-maxPan, Math.min(maxPan, prev + deltaY));
      });
      
      lastPanPosition.current = { x: currentX, y: currentY };
    }
  };

  // Handle touch end for reading modal
  const handleReadingModalTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      touchStartDistance.current = null;
      touchStartCenter.current = null;
      isPanning.current = false;
    }
    
    // Check for swipe down to close (only when not zoomed and single touch)
    if (e.changedTouches.length === 1 && zoomLevel <= 1.1 && swipeStartY.current !== null) {
      const touch = e.changedTouches[0];
      const startY = swipeStartY.current;
      const endY = touch.clientY;
      const swipeDistance = endY - startY;
      
      // Swipe down more than 100px to close
      if (swipeDistance > 100) {
        closeReadingModal();
      }
    }
    
    swipeStartY.current = null;
  };

  // Toggle fit-to-screen vs full scale
  const toggleFitToScreen = () => {
    if (isFitted) {
      // Switch to full scale
      setZoomLevel(2);
      setIsFitted(false);
      setPanX(0);
      setPanY(0);
    } else {
      // Switch to fit-to-screen
      setZoomLevel(1);
      setIsFitted(true);
      setPanX(0);
      setPanY(0);
    }
  };

  // External link handlers
  const handlePhysicalCopyClick = () => {
    const stripeUrl = getStripePreorderUrl();
    if (stripeUrl) return openExternalUrl(stripeUrl);
  };

  const handleDigitalClick = () => {
    // TODO: Add digital download link
    console.log('Digital download coming soon');
  };

  const handleWaitlistClick = () => {
    const waitlistUrl = getWaitlistUrl();
    if (waitlistUrl) return openExternalUrl(waitlistUrl);
    setIsPreorderOpen(true);
  };

  const handleComingSoonClick = () => {
    setIsComingSoonModalOpen(true);
  };

  const handleLogoClick = () => {
    navigate('/');
    window.scrollTo(0, 0);
  };

  // Check if anchor message should show for current page
  const shouldShowAnchorMessage = (pageNumber: number) => {
    return pageNumber === 3 || pageNumber === 5;
  };

  const getAnchorMessage = (pageNumber: number) => {
    return ANCHOR_MESSAGES[pageNumber];
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
                to="/mission" 
                className={`nav-link-underline font-semibold transition-all duration-300 hover:font-bold ${isScrolled ? 'text-white' : 'text-navy-500'} ${location.pathname === '/mission' ? 'font-bold border-b-2 border-golden-500' : ''}`}
              >
                Mission
              </Link>
              <Link 
                to="/#about"
                onClick={(e) => {
                  if (location.pathname === '/') {
                    e.preventDefault();
                    const element = document.getElementById('about');
                    if (element) {
                      const headerOffset = 80;
                      const elementPosition = element.getBoundingClientRect().top;
                      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                    }
                  }
                }}
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
                onMouseEnter={() => {
                  if (closeTimeout) {
                    clearTimeout(closeTimeout);
                    setCloseTimeout(null);
                  }
                  setShowResourcesDropdown(true);
                }}
                onMouseLeave={() => {
                  const timeout = setTimeout(() => {
                    setShowResourcesDropdown(false);
                  }, 200);
                  setCloseTimeout(timeout);
                }}
              >
                <div
                  className={`nav-link-underline font-semibold transition-all duration-300 hover:font-bold flex items-center gap-1.5 cursor-pointer ${isScrolled ? 'text-white' : 'text-navy-500'}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setShowResourcesDropdown(!showResourcesDropdown);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setShowResourcesDropdown(!showResourcesDropdown);
                    }
                  }}
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
                
                <div className="absolute top-full left-0 w-full h-3" />
                
                <div 
                  className={`dropdown-menu absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl py-2 min-w-[240px] z-50 transition-all duration-200 ${
                    showResourcesDropdown 
                      ? 'opacity-100 visible pointer-events-auto translate-y-0' 
                      : 'opacity-0 invisible pointer-events-none -translate-y-2'
                  }`}
                  style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                  onMouseEnter={() => {
                    if (closeTimeout) {
                      clearTimeout(closeTimeout);
                      setCloseTimeout(null);
                    }
                    setShowResourcesDropdown(true);
                  }}
                  onMouseLeave={() => {
                    const timeout = setTimeout(() => {
                      setShowResourcesDropdown(false);
                    }, 200);
                    setCloseTimeout(timeout);
                  }}
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
              
              <Link
                to="/comicbook" 
                className={`nav-link-underline font-semibold transition-all duration-300 hover:font-bold ${isScrolled ? 'text-white' : 'text-navy-500'}`}
              >
                Comic Book
              </Link>
            </nav>
            
            {/* Action Area - Contact (desktop only) + Join Waitlist Button */}
            <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
              {/* Contact Link - Desktop only */}
              <a 
                href="mailto:stills@caidenscourage.com" 
                className={`hidden lg:block nav-link-underline font-semibold transition-all duration-300 hover:font-bold ${isScrolled ? 'text-white' : 'text-navy-500'}`}
              >
                Contact
              </a>
              {/* Join Waitlist Button - All screens, responsive padding */}
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

      {/* Mobile Menu - Full Screen, Slides from Left, Under Navigation - Visible up to lg (1024px) for iPad portrait */}
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
                  if (location.pathname === '/') {
                    e.preventDefault();
                    const element = document.getElementById('about');
                    if (element) {
                      const headerOffset = 80;
                      const elementPosition = element.getBoundingClientRect().top;
                      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                    }
                  }
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
                  Join the Courage Community
                </Button>
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-20 sm:pt-24 pb-16">
        {/* Hero Section - Left-aligned, editorial style */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 relative text-left">
          {/* Subtle B-4 Watermark - Decorative only, hidden on mobile */}
          <div 
            className="absolute right-0 bottom-0 opacity-[0.04] sm:opacity-[0.05] pointer-events-none hidden sm:block"
            aria-hidden="true"
            style={{ 
              width: 'clamp(200px, 30vw, 400px)',
              height: 'clamp(200px, 30vw, 400px)',
              transform: 'translate(20%, 20%)'
            }}
          >
            <img 
              src="/b4-watermark.svg" 
              alt="" 
              className="w-full h-full"
              style={{ filter: 'blur(0.5px)' }}
            />
          </div>

          {/* Breadcrumb */}
          <Link 
            to="/comicbook"
            className="inline-block text-sm text-navy-400 hover:text-navy-600 transition-colors mb-4 group"
          >
            <span className="group-hover:underline">← Back to Comic Book</span>
          </Link>

          {/* Title - Left aligned */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-navy-500 mb-6 leading-tight text-left">
            Preview: Caiden's Courage and the Dragon's Nest
          </h1>
          
          {/* Subtitle - Left aligned */}
          <p className="text-xl sm:text-2xl text-navy-400 mb-8 leading-relaxed text-left">
            A short look inside the story, art, and world.
          </p>
          
          {/* Info Block - Left aligned, aligned with title */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-navy-100 mb-12 text-left relative z-10">
            <div className="font-semibold text-navy-600 mb-3">Inside this preview:</div>
            <ul className="space-y-2 text-navy-500">
              <li className="flex items-start">
                <span className="text-navy-400 mr-3 mt-1">•</span>
                <span>Selected opening pages</span>
              </li>
              <li className="flex items-start">
                <span className="text-navy-400 mr-3 mt-1">•</span>
                <span>Art style and tone</span>
              </li>
              <li className="flex items-start">
                <span className="text-navy-400 mr-3 mt-1">•</span>
                <span>No spoilers</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Preview Viewer Section */}
        <section className="w-full px-4 sm:px-6 lg:px-8 pb-16">
          {/* Preview Microcopy - Left aligned */}
          <div className="max-w-4xl mx-auto mb-6 text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-500 mb-2">Preview Pages</h2>
            <p className="text-navy-400">See sample art & story</p>
          </div>

          {/* Guidance Text - Left aligned, subtle */}
          <div className="max-w-4xl mx-auto mb-8 text-left">
            <p className="text-sm sm:text-base text-navy-400/80 leading-relaxed">
              Scroll through selected pages from the opening of the story.
            </p>
          </div>

          {/* Gentle Anchor Messages - Show ABOVE viewer, between specific pages */}
          {shouldShowAnchorMessage(currentPage) && (
            <div className="max-w-4xl mx-auto mb-6 text-left">
              <p className="text-navy-400 italic text-sm sm:text-base leading-relaxed">
                {getAnchorMessage(currentPage)}
              </p>
            </div>
          )}

          {/* Page Viewer Container - Always centered */}
          <div className="flex flex-col items-center">
            {/* Page Viewer - Centered with max-width and margins */}
            <div 
              ref={pageRef}
              className="relative bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 mb-8 w-full"
              style={{ 
                maxWidth: 'clamp(320px, 95vw, 900px)',
                marginInline: 'auto'
              }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Page Image - Centered within viewer */}
              <div 
                className={`relative transition-all duration-300 flex items-center justify-center bg-navy-50/30 rounded-lg ${imageErrors.has(currentPage) ? '' : 'cursor-zoom-in'}`} 
                onClick={!imageErrors.has(currentPage) && imagesLoaded.has(currentPage) ? openReadingModal : undefined}
                style={{ 
                  aspectRatio: '3/4',
                  width: '100%',
                  minHeight: '400px',
                  maxHeight: '75vh'
                }}
              >
                {imageErrors.has(currentPage) ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center w-full h-full min-h-[400px]">
                    <svg className="w-16 h-16 mb-4 text-navy-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm sm:text-base font-medium text-navy-500 mb-2">Preview images not found</p>
                    <p className="text-xs sm:text-sm text-navy-400 max-w-md mb-2">
                      Add files to: <br />
                      <code className="bg-white px-2 py-1 rounded text-navy-600 font-mono text-xs sm:text-sm mt-2 inline-block break-all">
                        /public/previews/page-{String(currentPage).padStart(2, '0')}.jpg
                      </code>
                    </p>
                    <p className="text-xs text-navy-300">
                      Expected files: page-01.jpg through page-05.jpg
                    </p>
                  </div>
                ) : (
                  <>
                    <img
                      src={PREVIEW_PAGES[currentPage - 1].image}
                      alt={PREVIEW_PAGES[currentPage - 1].alt}
                      className="rounded-lg shadow-md w-full h-full max-w-full transition-all duration-300 object-contain"
                      style={{ 
                        aspectRatio: '3/4',
                        maxHeight: '75vh'
                      }}
                      onLoad={() => {
                        setImagesLoaded(prev => new Set(prev).add(currentPage));
                        setImageErrors(prev => {
                          const next = new Set(prev);
                          next.delete(currentPage);
                          return next;
                        });
                      }}
                      onError={() => {
                        setImageErrors(prev => new Set(prev).add(currentPage));
                        setImagesLoaded(prev => {
                          const next = new Set(prev);
                          next.delete(currentPage);
                          return next;
                        });
                      }}
                    />
                    {!imagesLoaded.has(currentPage) && !imageErrors.has(currentPage) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-navy-50/30 rounded-lg">
                        <div className="text-navy-300 text-sm">Loading preview page...</div>
                      </div>
                    )}
                    {imagesLoaded.has(currentPage) && !imageErrors.has(currentPage) && (
                      <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-none">
                        Tap to zoom
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Navigation Controls - Centered under viewer with spacing */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 w-full mt-4" style={{ maxWidth: 'clamp(320px, 95vw, 900px)' }}>
              {/* Previous Button */}
              <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-full font-semibold transition-all duration-200 text-sm sm:text-base ${
                  currentPage === 1
                    ? 'bg-navy-100 text-navy-300 cursor-not-allowed'
                    : 'bg-navy-500 text-white hover:bg-navy-600 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2'
                }`}
                aria-label="Previous page"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Previous</span>
              </button>

              {/* Page Indicator - Centered */}
              <div className="text-navy-600 font-semibold text-base sm:text-lg px-4 flex-shrink-0">
                Page {currentPage} of {totalPages}
              </div>

              {/* Next Button */}
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-full font-semibold transition-all duration-200 text-sm sm:text-base ${
                  currentPage === totalPages
                    ? 'bg-navy-100 text-navy-300 cursor-not-allowed'
                    : 'bg-navy-500 text-white hover:bg-navy-600 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2'
                }`}
                aria-label="Next page"
              >
                <span className="hidden sm:inline">Next</span>
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* End-of-Preview Conversion Section - ALWAYS RENDER with spacing for chapter break feel */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 lg:pt-16 pb-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-500 mb-4">
              Want to continue the journey?
            </h2>
            <p className="text-xl text-navy-400 mb-8 leading-relaxed max-w-2xl mx-auto">
              Caiden's story continues with deeper challenges, stronger courage, and the discovery of what makes his mind powerful.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-6">
              <Button
                variant="primary"
                size="md"
                onClick={handlePhysicalCopyClick}
              >
                Pre-order Physical Copy
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={handleDigitalClick}
              >
                Download Digital Edition
              </Button>
            </div>

            {/* Tertiary Link */}
            <button
              onClick={handleWaitlistClick}
              className="text-navy-400 text-sm font-medium hover:text-navy-600 transition-colors underline focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 rounded"
            >
              Join the Courage Community
            </button>
          </div>
        </section>
      </main>

      {/* Full-Screen Reading Modal */}
      {isReadingModalOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          onClick={(e) => {
            // Close if clicking outside the image
            if (e.target === e.currentTarget) {
              closeReadingModal();
            }
          }}
          onTouchStart={handleReadingModalTouchStart}
          onTouchMove={handleReadingModalTouchMove}
          onTouchEnd={handleReadingModalTouchEnd}
          style={{ touchAction: 'none' }}
        >
          {/* Helper Text - First time only */}
          {showHelperText && (
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10 bg-black/70 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm animate-fade-in">
              <div className="flex items-center gap-3">
                <span>Pinch to zoom. Swipe down to close.</span>
                <button
                  onClick={dismissHelperText}
                  className="text-white/70 hover:text-white transition-colors"
                  aria-label="Dismiss"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
          
          {/* Comic Page Image */}
          <div
            className="relative max-w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
            style={{
              transform: `translate(${panX}px, ${panY}px) scale(${zoomLevel})`,
              transformOrigin: 'center center',
              transition: isFitted ? 'transform 0.3s ease-out' : 'none',
              willChange: 'transform'
            }}
          >
            <img
              src={PREVIEW_PAGES[currentPage - 1].image}
              alt={PREVIEW_PAGES[currentPage - 1].alt}
              className="max-w-full max-h-[100vh] object-contain"
              draggable={false}
              style={{ userSelect: 'none' }}
            />
          </div>
        </div>
      )}

      {/* Coming Soon Modal */}
      {isComingSoonModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsComingSoonModalOpen(false);
            }
          }}
        >
          <div className="relative w-full max-w-md animate-slide-up bg-white rounded-2xl shadow-2xl p-8 sm:p-10">
            <button
              className="absolute -top-3 -right-3 h-10 w-10 rounded-full bg-white text-navy-500 font-bold shadow-lg flex items-center justify-center hover:bg-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300 z-10"
              onClick={() => setIsComingSoonModalOpen(false)}
              aria-label="Close modal"
            >
              ✕
            </button>
            
            <div className="text-center">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-500 mb-4">
                We're building this next.
              </h2>
              <p className="text-navy-600 text-base sm:text-lg leading-relaxed mb-8">
                We're designing Caiden & B-4 plushies and limited-edition shirts.
                <br />
                Join the Courage Community to get early access when they launch.
              </p>
              
              <div className="flex flex-col gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    handleWaitlistClick();
                    setIsComingSoonModalOpen(false);
                  }}
                  className="w-full"
                >
                  Join the Courage Community
                </Button>
                <button
                  onClick={() => setIsComingSoonModalOpen(false)}
                  className="text-navy-400 text-sm font-medium hover:text-navy-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pre-order Modal */}
      {isPreorderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="relative w-full max-w-2xl animate-slide-up">
            <button
              className="absolute -top-3 -right-3 h-10 w-10 rounded-full bg-white text-navy-500 font-bold shadow-lg flex items-center justify-center hover:bg-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300 z-10"
              onClick={() => setIsPreorderOpen(false)}
              aria-label="Close modal"
            >
              ✕
            </button>
            <iframe
              src="https://beacons.ai/stillianoblack"
              title="Join the Courage Community"
              className="w-full h-[70vh] rounded-2xl bg-white shadow-2xl"
            />
          </div>
        </div>
      )}

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
              <Link to="/mission" className="text-white/70 hover:text-white transition-colors">Mission</Link>
              <Link to="/privacy" className="text-white/70 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-white/70 hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10">
            <div className="flex flex-wrap justify-center gap-4 text-sm mb-4">
              <Link to="/comicbook" className="text-white/70 hover:text-white transition-colors">Comic Book</Link>
              <Link to="/resources" className="text-white/70 hover:text-white transition-colors">Resources</Link>
              <Link 
                to="/#about" 
                onClick={(e) => {
                  if (location.pathname === '/') {
                    e.preventDefault();
                    const element = document.getElementById('about');
                    if (element) {
                      const headerOffset = 80;
                      const elementPosition = element.getBoundingClientRect().top;
                      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                    }
                  }
                }}
                className="text-white/70 hover:text-white transition-colors"
              >
                About
              </Link>
              <Link to="/#characters" className="text-white/70 hover:text-white transition-colors">Characters</Link>
              <Link to="/#products" className="text-white/70 hover:text-white transition-colors">Shop</Link>
              <a href="mailto:stills@caidenscourage.com" className="text-white/70 hover:text-white transition-colors">Contact</a>
            </div>
            <p className="text-white/60 text-sm text-center">
              © {new Date().getFullYear()} The Focus Engine, LLC. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Preview;

