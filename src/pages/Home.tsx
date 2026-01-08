import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getStripePreorderUrl, getWaitlistUrl, openExternalUrl, productLinks } from '../config/externalLinks';
import Button from '../components/ui/Button';

// Pop art style icon components
const SparkleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="40" fill="#FFD700" stroke="#FFA500" strokeWidth="3"/>
    <path d="M50 20 L55 45 L80 50 L55 55 L50 80 L45 55 L20 50 L45 45 Z" fill="#FF6B6B" stroke="#FF4757" strokeWidth="2"/>
    <circle cx="50" cy="50" r="15" fill="#FFD700"/>
    <circle cx="35" cy="35" r="8" fill="#4ECDC4"/>
    <circle cx="65" cy="35" r="8" fill="#FF6B6B"/>
    <circle cx="35" cy="65" r="8" fill="#95E1D3"/>
    <circle cx="65" cy="65" r="8" fill="#F38181"/>
  </svg>
);

const PaletteIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="30" width="60" height="50" rx="5" fill="#FF6B6B" stroke="#FF4757" strokeWidth="3"/>
    <circle cx="35" cy="45" r="8" fill="#4ECDC4"/>
    <circle cx="50" cy="45" r="8" fill="#FFD700"/>
    <circle cx="65" cy="45" r="8" fill="#95E1D3"/>
    <circle cx="35" cy="60" r="8" fill="#F38181"/>
    <circle cx="50" cy="60" r="8" fill="#A8E6CF"/>
    <circle cx="65" cy="60" r="8" fill="#FFD93D"/>
    <rect x="25" y="20" width="15" height="15" rx="3" fill="#FF6B6B" transform="rotate(-15 32.5 27.5)"/>
    <rect x="60" y="20" width="15" height="15" rx="3" fill="#4ECDC4" transform="rotate(15 67.5 27.5)"/>
  </svg>
);

const StrengthIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="35" fill="#4ECDC4" stroke="#26A69A" strokeWidth="4"/>
    <path d="M30 50 L50 30 L70 50 L50 70 Z" fill="#FFD700" stroke="#FFA500" strokeWidth="3"/>
    <circle cx="50" cy="50" r="12" fill="#FF6B6B"/>
    <rect x="45" y="25" width="10" height="20" rx="2" fill="#95E1D3"/>
    <rect x="45" y="55" width="10" height="20" rx="2" fill="#95E1D3"/>
    <rect x="25" y="45" width="20" height="10" rx="2" fill="#95E1D3"/>
    <rect x="55" y="45" width="20" height="10" rx="2" fill="#95E1D3"/>
  </svg>
);

const StarIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 10 L60 40 L90 40 L68 58 L78 88 L50 70 L22 88 L32 58 L10 40 L40 40 Z" fill="#FFD700" stroke="#FFA500" strokeWidth="3"/>
    <circle cx="50" cy="50" r="15" fill="#FF6B6B"/>
    <circle cx="50" cy="50" r="8" fill="#FFD700"/>
    <circle cx="30" cy="30" r="6" fill="#4ECDC4"/>
    <circle cx="70" cy="30" r="6" fill="#F38181"/>
    <circle cx="30" cy="70" r="6" fill="#95E1D3"/>
    <circle cx="70" cy="70" r="6" fill="#A8E6CF"/>
  </svg>
);

// Feature card data - 2026 design trends with glassmorphism and bold gradients
const features = [
  {
    icon: SparkleIcon,
    title: 'Neurodiversity Positive',
    description: "We celebrate the power of different minds. Caiden's story shows kids that ADHD isn't a flaw — it's a source of creativity, energy, and unique strength.",
    bgGradient: 'from-yellow-400/20 via-orange-400/15 to-amber-400/20',
    glowColor: 'rgba(251, 191, 36, 0.4)',
    borderColor: 'border-yellow-300/30',
    iconColor: 'text-yellow-500',
  },
  {
    icon: PaletteIcon,
    title: 'Creativity & Imagination',
    description: "Caiden explores the world through art, imagination, and adventure. His story inspires kids to dream boldly and express their ideas freely.",
    bgGradient: 'from-pink-400/20 via-purple-400/15 to-fuchsia-400/20',
    glowColor: 'rgba(236, 72, 153, 0.4)',
    borderColor: 'border-pink-300/30',
    iconColor: 'text-pink-500',
  },
  {
    icon: StrengthIcon,
    title: 'Emotional Courage',
    description: "Through challenges and big feelings, Caiden learns to understand his emotions, communicate openly, and show up bravely in everyday moments.",
    bgGradient: 'from-brand-blue-400/20 via-brand-blue-400/15 to-brand-blue-500/20',
    glowColor: 'rgba(37, 99, 235, 0.4)',
    borderColor: 'border-brand-blue-400/30',
    iconColor: 'text-brand-blue-600',
  },
  {
    icon: StarIcon,
    title: 'Representation Matters',
    description: "Caiden is a hero who looks, feels, and dreams like the kids who rarely see themselves in stories. His journey helps every child feel seen, valued, and powerful.",
    bgGradient: 'from-green-400/20 via-emerald-400/15 to-teal-400/20',
    glowColor: 'rgba(34, 197, 94, 0.4)',
    borderColor: 'border-green-300/30',
    iconColor: 'text-green-500',
  },
];

// Character data
const characters = [
  {
    name: 'Caiden',
    microLabel: 'The Dreamer',
    description: "The brave, imaginative 11-year-old at the center of our story — learning how his ADHD is actually his greatest strength.",
    image: '/Caiden@4x-100.jpeg',
  },
  {
    name: 'Genesis',
    microLabel: 'The Potential',
    description: "Caiden's heroic alter-ego, unlocked when he taps into courage and creativity. Genesis is everything Caiden is becoming.",
    image: '/Genesis@4x-100.jpeg',
  },
  {
    name: 'B-4',
    microLabel: 'The Mind in Motion',
    description: "A floating robotic companion who represents what's happening inside Caiden's mind. B-4 helps him understand his ADHD.",
    image: '/B-4@4x-100.jpeg',
  },
  {
    name: 'Ollie Buck',
    microLabel: 'Patience & Grounding',
    description: "Caiden's loyal companion who reminds him that slow and steady wins the race — patience is a superpower too.",
    image: '/Turtle@4x-100.jpeg',
  },
];

// Shop products
const products = [
  {
    title: "Caiden's Courage — Limited Edition",
    description: "Caiden discovers that the thing he struggles with most — his ADHD — is actually his superpower. Pre-order the exclusive limited edition now!",
    badge: "Limited Edition",
    badgeColor: "bg-golden-500",
    purchaseUrl: productLinks.limitedEdition,
    available: true,
    image: "/Comic5_Coverpage_header_Shop.jpg",
  },
  {
    title: "Caiden's Courage T-Shirt",
    description: "Wear your courage! Show the world you support neurodiversity with our official Caiden's Courage t-shirt.",
    badge: "New",
    badgeColor: "bg-golden-500",
    purchaseUrl: productLinks.tShirt,
    available: true,
    image: "/Caiden'Courage_Tshirt.jpg",
  },
  {
    title: "B-4 Plush Companions",
    description: "Floating robotic friends that represent different neurodivergent strengths — ADHD, Autism, Anxiety, Big Feelers, & more.",
    badge: "New",
    badgeColor: "bg-golden-500",
    purchaseUrl: productLinks.b4Plush,
    available: true,
    image: "/Caiden'sCOurage_Plushie (1).jpg",
  },
];

// Coming soon products - uncomment when ready
// const comingSoonProducts = [
//   {
//     title: "The Courage Journal",
//     description: "A kid-friendly guided journal that helps children express feelings, track creative ideas, and build emotional strength.",
//     badge: "Coming Soon",
//     badgeColor: "bg-navy-400",
//     image: '/balance.png',
//     purchaseUrl: null,
//     available: false,
//   },
// ];

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isPreorderOpen, setIsPreorderOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [rotatingWord, setRotatingWord] = useState(0);
  const [showResourcesDropdown, setShowResourcesDropdown] = useState(false);
  const [showShopDropdown, setShowShopDropdown] = useState(false);
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);
  const [shopCloseTimeout, setShopCloseTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileResourcesDropdown, setShowMobileResourcesDropdown] = useState(false);
  const [showMobileShopDropdown, setShowMobileShopDropdown] = useState(false);
  const words = ['Superpower', 'Strength', 'Courage', 'Power'];

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

  // Handle hash anchor scrolling (for homepage section deep-links)
  useEffect(() => {
    // If navigating to homepage with hash, scroll to section
    if (location.pathname === '/' && location.hash) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const element = document.querySelector(location.hash);
        if (element) {
          // Calculate offset for fixed header (approximately 80px on desktop)
          const headerOffset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [location.hash, location.pathname]);

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

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    window.addEventListener('scroll', handleScroll);
    // Check initial scroll position
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.05, // Lower threshold for better mobile detection
      rootMargin: '0px 0px -20px 0px', // Adjusted for mobile
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Don't observe again once visible for performance
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe all sections except the hero section
    const sections = document.querySelectorAll('section:not(#hero)');
    sections.forEach((section) => {
      section.classList.add('fade-in-up');
      observer.observe(section);
    });

    // Also observe key content elements within sections for staggered animation
    const contentElements = document.querySelectorAll('.animate-fade-in, .animate-slide-up');
    contentElements.forEach((element) => {
      if (!element.closest('#hero')) {
        element.classList.add('fade-in-up');
        observer.observe(element);
      }
    });

    // Observe feature cards individually for staggered fade-in
    const featureCards = document.querySelectorAll('.fade-in-card');
    featureCards.forEach((card, index) => {
      const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Add visible class with staggered delay based on card index
            setTimeout(() => {
              entry.target.classList.add('visible');
            }, index * 150);
            cardObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
      cardObserver.observe(card);
    });

    return () => {
      sections.forEach((section) => {
        observer.unobserve(section);
      });
      contentElements.forEach((element) => {
        observer.unobserve(element);
      });
    };
  }, []);

  // Rotate words in the title
  useEffect(() => {
    const interval = setInterval(() => {
      setRotatingWord((prev) => (prev + 1) % words.length);
    }, 7000); // Change every 7 seconds (between 6-8 seconds)

    return () => clearInterval(interval);
  }, [words.length]);

  const handlePreorderClick = () => {
    const stripeUrl = getStripePreorderUrl();
    if (stripeUrl) return openExternalUrl(stripeUrl);
    setIsPreorderOpen(true);
  };

  const handleWaitlistClick = () => {
    const waitlistUrl = getWaitlistUrl();
    if (waitlistUrl) return openExternalUrl(waitlistUrl);
    setIsPreorderOpen(true);
  };

  const handleLogoClick = () => {
    if (location.pathname !== '/') {
      navigate('/');
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
                
                {/* Invisible hover bridge */}
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
              
              {/* Comic Book - Moved to right of Resources */}
                  <Link
                to="/comicbook" 
                className={`nav-link-underline font-semibold transition-all duration-300 hover:font-bold ${isScrolled ? 'text-white' : 'text-navy-500'}`}
                  >
                Comic Book
                  </Link>
            </nav>
            
            {/* Action Area - Contact (desktop only) + Join Waitlist Button */}
            <div className="flex items-center gap-4 lg:gap-6">
              {/* Contact Link - Desktop only */}
              <a 
                href="mailto:stills@caidenscourage.com" 
                className={`hidden lg:block nav-link-underline font-semibold transition-all duration-300 hover:font-bold ${isScrolled ? 'text-white' : 'text-navy-500'}`}
              >
                Contact
              </a>
              {/* Join Waitlist Button - All screens */}
              <Button
                variant="primary"
                size="sm"
                onClick={handleWaitlistClick}
              >
                Join the Courage Community
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
                  <Link
                    to="/#products"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setShowMobileShopDropdown(false);
                    }}
                    className="block px-12 py-4 text-navy-500 hover:bg-navy-50 transition-colors"
                  >
                    <div className="font-semibold text-lg">T-shirts</div>
                    <div className="text-sm text-navy-400 mt-0.5">Caiden's courage t-shirts</div>
                  </Link>
                  <div className="block px-12 py-4 text-navy-500 opacity-60 cursor-not-allowed">
                    <div className="font-semibold text-lg">Plushies <span className="text-base font-normal">(Coming soon)</span></div>
                    <div className="text-sm text-navy-400 mt-0.5">Soft companions for your journey</div>
                  </div>
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

      {/* Hero Section - White background */}
      <section
        id="hero"
        className="relative min-h-screen flex items-end sm:items-center bg-white pt-20 overflow-hidden"
      >
        {/* Animated circles - spread out across entire header, hidden on mobile */}
        <div className="absolute inset-0 z-0 hidden sm:block">
          {/* Yellow circles */}
          <div className="bubble w-20 h-20 top-12 left-[10%]" style={{ animation: 'float-slow 10s ease-in-out infinite', animationDelay: '0s' }} />
          <div className="bubble top-40 left-[25%]" style={{ width: '4.5rem', height: '4.5rem', animation: 'float-slow 12s ease-in-out infinite', animationDelay: '2.5s' }} />
          <div className="bubble w-16 h-16 top-68 left-[50%]" style={{ animation: 'float-slow 11s ease-in-out infinite', animationDelay: '1s' }} />
          <div className="bubble top-88 right-[30%]" style={{ width: '5.5rem', height: '5.5rem', animation: 'float-slow 13s ease-in-out infinite', animationDelay: '3.5s' }} />
          
          {/* Blue circles */}
          <div className="bubble-navy w-24 h-24 top-24 right-[15%]" style={{ animation: 'float-slow 12s ease-in-out infinite', animationDelay: '2s' }} />
          <div className="bubble-navy w-16 h-16 top-52 left-[35%]" style={{ animation: 'float-slow 9s ease-in-out infinite', animationDelay: '4s' }} />
          <div className="bubble-navy w-20 h-20 top-76 right-[45%]" style={{ animation: 'float-slow 10s ease-in-out infinite', animationDelay: '1.5s' }} />
          
          {/* Orange circles */}
          <div className="bubble-orange top-32 left-[60%]" style={{ width: '4.5rem', height: '4.5rem', animation: 'float-slow 11s ease-in-out infinite', animationDelay: '1s' }} />
          <div className="bubble-orange w-20 h-20 top-60 right-[20%]" style={{ animation: 'float-slow 13s ease-in-out infinite', animationDelay: '3s' }} />
          <div className="bubble-orange w-14 h-14 top-84 left-[75%]" style={{ animation: 'float-slow 9s ease-in-out infinite', animationDelay: '2s' }} />
        </div>
        
        {/* Small random circles in header - visible on all devices */}
        <div className="absolute inset-0 z-0">
          {/* Small yellow circles */}
          <div className="bubble" style={{ width: '8px', height: '8px', top: '15%', left: '20%', animation: 'float-slow 8s ease-in-out infinite', animationDelay: '0s', opacity: 0.3 }} />
          <div className="bubble" style={{ width: '10px', height: '10px', top: '45%', left: '75%', animation: 'float-slow 9s ease-in-out infinite', animationDelay: '1s', opacity: 0.25 }} />
          <div className="bubble" style={{ width: '6px', height: '6px', top: '70%', left: '15%', animation: 'float-slow 7s ease-in-out infinite', animationDelay: '2s', opacity: 0.3 }} />
          
          {/* Small blue circles */}
          <div className="bubble-navy" style={{ width: '9px', height: '9px', top: '30%', left: '60%', animation: 'float-slow 10s ease-in-out infinite', animationDelay: '0.5s', opacity: 0.25 }} />
          <div className="bubble-navy" style={{ width: '7px', height: '7px', top: '65%', left: '85%', animation: 'float-slow 8s ease-in-out infinite', animationDelay: '1.5s', opacity: 0.3 }} />
          
          {/* Small orange circles */}
          <div className="bubble-orange" style={{ width: '8px', height: '8px', top: '55%', left: '35%', animation: 'float-slow 9s ease-in-out infinite', animationDelay: '2.5s', opacity: 0.25 }} />
          <div className="bubble-orange" style={{ width: '6px', height: '6px', top: '25%', left: '90%', animation: 'float-slow 7s ease-in-out infinite', animationDelay: '3s', opacity: 0.3 }} />
        </div>
        
        {/* Mid-size circles in header to fill white space at top - visible on all devices */}
        <div className="absolute inset-0 z-0">
          {/* Mid-size yellow circle - top left white space */}
          <div className="bubble" style={{ width: '40px', height: '40px', top: '10%', left: '15%', animation: 'float-slow 12s ease-in-out infinite', animationDelay: '0s', opacity: 0.2 }} />
          {/* Mid-size blue circle - top right white space */}
          <div className="bubble-navy" style={{ width: '36px', height: '36px', top: '8%', right: '12%', animation: 'float-slow 11s ease-in-out infinite', animationDelay: '1.5s', opacity: 0.2 }} />
        </div>
        
        {/* Hero content + CTAs - bottom on mobile, centered on desktop */}
        <div className="relative z-10 w-full pb-28 sm:pb-0 sm:py-12" style={{ paddingTop: '70px' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Hero image - First on mobile, right side on desktop */}
              <div className="flex items-center justify-center lg:justify-end order-1 lg:order-2 w-full mb-[35px] lg:mb-0">
                <div className="relative w-full max-w-sm lg:max-w-xl xl:max-w-2xl scale-[1.08] lg:scale-[1.215]">
                  {/* Geometric shape behind image - blue and larger to cover body, visible on all devices */}
                  <div className="geometric-shape shape-blob-blue w-80 h-80 sm:w-96 sm:h-96 lg:w-[28rem] lg:h-[28rem] xl:w-[32rem] xl:h-[32rem] absolute -z-10 scale-[1.08] lg:scale-[1.215]" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
                  
                  <img
                    src="/Courageforeverykid_COMICBOOK.png"
                    alt="Caiden - The Boy Who Turned ADHD Into His Superpower"
                    className="w-full h-auto object-contain drop-shadow-lg relative z-10 image-geometric-mask mx-auto lg:mx-0"
                  />
                </div>
              </div>
              
              {/* Text content - Second on mobile, left side on desktop, centered on mobile */}
              <div className="max-w-xl animate-slide-up order-2 lg:order-1 text-center lg:text-left">
                {/* Title and subtitle */}
                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-500 leading-tight">
                  The Boy Who Turned ADHD Into His{' '}
                  <span className="text-golden-500 inline-block min-w-[200px] sm:min-w-[240px] lg:min-w-[280px]">
                    <span key={rotatingWord} className="rotating-word inline-block">
                      {words[rotatingWord]}
                    </span>
                  </span>
                </h1>
                <p className="mt-4 text-lg sm:text-xl text-navy-600">
                  Meet Caiden — an illustrated kids' universe about courage, creativity, and emotional growth. <span className="italic">A story for kids who think differently—and the adults who support them.</span>
                </p>
                
                {/* CTAs - right below text, centered on mobile */}
                <div className="flex flex-wrap gap-4 mt-8 justify-center lg:justify-start">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handlePreorderClick}
                  >
                    Pre-order Now
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    as="a"
                    href="/#about"
                  >
                    Learn More
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator - hidden on mobile, visible on desktop */}
        <div className="hidden md:flex absolute bottom-6 left-0 right-0 justify-center items-center animate-bounce">
          <svg className="w-10 h-10 text-navy-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Who Is Caiden Section */}
      <section id="about" className="py-20 sm:py-28 bg-navy-500 relative overflow-hidden" style={{ scrollMarginTop: '80px' }}>
        {/* Decorative elements - hidden on mobile */}
        <div className="hidden sm:block circle-accent circle-coral w-24 h-24 -top-12 left-1/4 opacity-50" style={{ animationDelay: '0s' }} />
        <div className="hidden sm:block circle-accent circle-coral w-16 h-16 bottom-20 left-8 opacity-40" style={{ animationDelay: '1.5s' }} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left content */}
            <div className="animate-fade-in text-center lg:text-left">
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">
                Who Is Caiden?
              </h2>
              <p className="mt-6 text-lg text-white/90 leading-relaxed">
                <strong className="text-golden-400">Caiden is an 11-year-old boy who discovers that the thing he struggles with the most — his ADHD — is actually the source of his greatest power.</strong>
              </p>
              <p className="mt-4 text-white/80 leading-relaxed">
                Through adventure, imagination, and everyday courage, Caiden learns to understand his emotions, trust himself, and show up bravely in a world that doesn't always see him clearly.
              </p>
              
              {/* Comic Book Callout */}
              <div className="mt-4 max-w-[420px] mx-auto lg:mx-0">
                <Link
                  to="/comicbook"
                  className="block bg-white/95 rounded-2xl p-4 sm:p-5 shadow-lg border border-white/20 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    {/* Comic Book Image - Circular with blue border */}
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-blue-500 shadow-md">
                        <img
                          src="/Comic5_Coverpage_header.jpg"
                          alt="Caiden's Courage Comic Book"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/logoCaiden.png';
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* Text Content */}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2 mb-1.5 justify-start">
                        <span className="text-xs font-semibold text-white uppercase tracking-wide bg-golden-500 px-2 py-0.5 rounded-md">New</span>
                      </div>
                      <h3 className="font-display font-bold text-lg sm:text-xl text-navy-500 mb-1.5 text-left">
                        The Comic Book
                      </h3>
                      <p className="text-sm sm:text-base text-navy-600 leading-relaxed mb-3 text-left">
                        Start Volume 1 and follow Caiden's first "Lock In" moment.
                      </p>
                      <span className="inline-flex items-center text-sm sm:text-base font-semibold text-navy-500 hover:text-navy-600 transition-colors text-left">
                        View Comic Book
                        <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Right - Feature cards optimized for performance */}
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="relative group h-full"
                >
                  {/* Card container - solid base */}
                  <div
                    className={`relative feature-card fade-in-card rounded-3xl p-6 sm:p-7 bg-white/85 border-2 ${feature.borderColor} shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer h-full flex flex-col`}
                  >
                    {/* Gradient background layer */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} rounded-3xl opacity-40`}></div>
                    
                    {/* Small glass overlay only on top section */}
                    <div 
                      className="absolute top-0 left-0 right-0 h-24 bg-white/20 backdrop-blur-[10px] rounded-t-3xl pointer-events-none"
                      style={{ 
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)'
                      }}
                    ></div>
                    <div className="absolute top-0 left-0 right-0 h-24 bg-white/20 rounded-t-3xl pointer-events-none supports-[backdrop-filter]:hidden"></div>
                    
                    {/* Content layer */}
                    <div className="relative z-10 flex flex-col flex-grow">
                      {/* Icon - simplified */}
                      <div className={`w-16 h-16 sm:w-20 sm:h-20 mb-4 transition-transform duration-300 group-hover:scale-105`}>
                        <feature.icon className={`w-full h-full ${feature.iconColor}`} />
                      </div>
                      
                      {/* Title */}
                      <h3 className="font-display font-bold text-lg sm:text-xl md:text-2xl mt-3 text-navy-600 leading-tight">
                        {feature.title}
                      </h3>
                      
                      {/* Description */}
                      <p className="mt-3 text-sm sm:text-base leading-relaxed text-navy-600/90 flex-grow">
                        {feature.description}
                      </p>
                    </div>
                    
                    {/* Decorative corner accent - static */}
                    <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${feature.bgGradient} rounded-bl-3xl opacity-15`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 sm:py-28 bg-cream relative overflow-hidden">
        <div className="hidden sm:block circle-accent circle-navy w-20 h-20 top-20 right-16 opacity-60" style={{ animationDelay: '0.5s' }} />
        <div className="hidden sm:block circle-accent circle-coral w-12 h-12 bottom-24 left-12 opacity-50" style={{ animationDelay: '3s' }} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative">
                <img
                  src="/Courageforeverykid.jpeg"
                  alt="Caiden celebrating - Courage for Every Kid"
                  className="w-full max-w-lg mx-auto rounded-3xl shadow-card"
                />
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-golden-500/20 rounded-full blur-2xl" />
              </div>
            </div>
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <span className="inline-block px-3 py-1 bg-golden-500 text-navy-500 font-semibold text-sm rounded-md">Our Mission:</span>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-500 mt-2">
                Courage for Every Kid
              </h2>
              <p className="mt-6 text-navy-600 leading-relaxed">
                Every child deserves to see their mind as powerful — especially the ones who feel different.
              </p>
              <p className="mt-4 text-navy-600 leading-relaxed">
                Caiden's Courage was created to help kids understand their emotions, celebrate neurodiversity, and discover the superhero that already lives inside them. Through stories, characters, and imaginative learning tools, we empower children to feel seen, confident, and brave in their everyday world.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  variant="primary"
                  size="md"
                  as="a"
                  href="/"
                >
                  Learn About the Mission
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  as="a"
                  href="/#characters"
                >
                  Meet the Characters
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Characters Section */}
      <section id="characters" className="py-20 sm:py-28 bg-navy-500 relative overflow-hidden" style={{ scrollMarginTop: '80px' }}>
        <div className="hidden sm:block circle-accent circle-coral w-28 h-28 top-12 left-8 opacity-40" style={{ animationDelay: '1s' }} />
        <div className="hidden sm:block circle-accent circle-coral w-20 h-20 bottom-16 right-12 opacity-50" style={{ animationDelay: '2s' }} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">
              Meet the Characters of
            </h2>
            <p className="text-golden-400 font-display text-2xl sm:text-3xl lg:text-4xl font-bold mt-2">
              Caiden's Courage
            </p>
            <p className="mt-6 text-white/80 max-w-2xl mx-auto">
              Discover the heroes, friends, and guides who help Caiden navigate courage, creativity, and everyday challenges.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {characters.map((character, index) => (
              <div
                key={character.name}
                className="character-card fade-in-card bg-navy-600/50 rounded-2xl p-5 text-center backdrop-blur-sm border border-white/10 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
              >
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-golden-400 to-golden-600 p-1 shadow-golden">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                      <img
                        src={character.image}
                        alt={character.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
                <h3 className="font-display text-xl font-bold text-white mt-4">
                  {character.name}
                </h3>
                <p className="text-golden-400 text-xs font-semibold mt-1 mb-2 min-h-[1.25rem]">
                  {character.microLabel}
                </p>
                <p className="mt-3 text-sm text-white/70 leading-snug px-2" style={{ wordBreak: 'break-word', hyphens: 'auto' }}>
                  {character.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shop Section */}
      <section id="products" className="py-20 sm:py-28 bg-cream relative overflow-hidden" style={{ scrollMarginTop: '80px' }}>
        <div className="hidden sm:block circle-accent circle-coral w-16 h-16 top-16 left-1/3 opacity-40" style={{ animationDelay: '2.5s' }} />
        <div className="hidden sm:block circle-accent circle-navy w-12 h-12 bottom-24 right-8 opacity-30" style={{ animationDelay: '4s' }} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-500">
              Shop
            </h2>
            <p className="text-gradient font-display text-2xl sm:text-3xl lg:text-4xl font-bold mt-2">
              Caiden's Courage
            </p>
            <p className="mt-4 text-navy-600/80 max-w-2xl mx-auto">
              Support courage, creativity, and neurodiverse kids—at home and beyond.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <div
                key={product.title}
                className={`feature-card fade-in-card bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-xl hover:scale-[1.02] transition-all duration-300 ${
                  product.available ? 'ring-2 ring-golden-500/50' : ''
                }`}
              >
                {/* Product Image */}
                {product.image && (
                  <div className="w-full h-48 sm:h-56 overflow-hidden bg-navy-50">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  {/* Badges */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-4 py-1.5 ${product.badgeColor} text-navy-500 text-sm font-semibold rounded-full`}>
                      {product.badge}
                    </span>
                    {product.available && (
                      <span className="px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-xl font-bold text-navy-500">
                    {product.title}
                  </h3>
                  <p className="mt-3 text-navy-600/80 text-sm leading-relaxed">
                    {product.description}
                  </p>
                  {product.available && product.purchaseUrl ? (
                    <button
                      onClick={() => openExternalUrl(product.purchaseUrl!)}
                      className="mt-5 w-full py-3 px-6 bg-golden-500 text-navy-500 font-bold rounded-full shadow-golden hover:bg-golden-600 hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
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
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Pre-order
                    </button>
                  ) : (
                    <button
                      onClick={handleWaitlistClick}
                      className="mt-5 w-full py-3 px-6 bg-navy-200 text-navy-500 font-semibold rounded-full hover:bg-navy-300 hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      Notify Me
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-navy-500 to-navy-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-golden-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-golden-400 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white">
            Ready to Join Caiden's Journey?
          </h2>
          <p className="mt-4 text-white/80 text-lg">
            Be the first to know when the book launches and get exclusive updates.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button
              variant="primary"
              size="md"
              onClick={handleWaitlistClick}
            >
              Join the Courage Community
            </Button>
            <a
              href="mailto:stills@caidenscourage.com"
              className="px-8 py-3 rounded-full bg-transparent text-white font-semibold border-2 border-white/40 transition-all duration-300 hover:bg-white/10"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

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
          <div className="mt-8 pt-8 border-t border-white/10">
            <div className="flex flex-wrap justify-center gap-4 text-sm mb-4">
              <Link to="/comicbook" className="text-white/70 hover:text-white transition-colors">Comic Book</Link>
              <Link to="/resources" className="text-white/70 hover:text-white transition-colors">Resources</Link>
              <Link to="/#about" className="text-white/70 hover:text-white transition-colors">About</Link>
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

      {/* Pre-order Modal */}
      {isPreorderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="relative w-full max-w-2xl animate-slide-up">
            <button
              className="absolute -top-3 -right-3 h-10 w-10 rounded-full bg-white text-navy-500 font-bold shadow-lg flex items-center justify-center hover:bg-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300 z-10"
              onClick={() => setIsPreorderOpen(false)}
              aria-label="Close pre-order"
            >
              ✕
            </button>
            <iframe
              src="https://beacons.ai/stillianoblack"
              title="Caiden's Courage Pre-order"
              className="w-full h-[70vh] rounded-2xl bg-white shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
