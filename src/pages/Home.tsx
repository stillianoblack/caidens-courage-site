import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getWaitlistUrl, openExternalUrl, productLinks } from '../config/externalLinks';
import { DISABLE_HEROES } from '../config/heroes';
import Button from '../components/ui/Button';
import Header from '../components/Header';
import Footer from '../components/Footer';

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
    {/* 8 colorful squares in a 2x4 grid - fully opaque, no transparency */}
    <rect x="28" y="38" width="10" height="10" fill="#4A90E2" opacity="1"/>
    <rect x="40" y="38" width="10" height="10" fill="#50C878" opacity="1"/>
    <rect x="52" y="38" width="10" height="10" fill="#FFD700" opacity="1"/>
    <rect x="64" y="38" width="10" height="10" fill="#FFA500" opacity="1"/>
    <rect x="28" y="50" width="10" height="10" fill="#4A90E2" opacity="1"/>
    <rect x="40" y="50" width="10" height="10" fill="#50C878" opacity="1"/>
    <rect x="52" y="50" width="10" height="10" fill="#FFD700" opacity="1"/>
    <rect x="64" y="50" width="10" height="10" fill="#FFA500" opacity="1"/>
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
    title: 'Different Minds Hold Hidden Power',
    description: "Caiden's story shows kids that ADHD isn't a flaw — it can be a source of creativity, energy, and unique strength.",
    bgGradient: 'from-yellow-400/20 via-orange-400/15 to-amber-400/20',
    glowColor: 'rgba(251, 191, 36, 0.4)',
    borderColor: 'border-yellow-300/30',
    iconColor: 'text-yellow-500',
  },
  {
    icon: PaletteIcon,
    title: 'Where Imagination Becomes Armor',
    description: "Creativity becomes more than play — it becomes confidence kids can carry into every challenge.",
    bgGradient: 'from-pink-400/20 via-purple-400/15 to-fuchsia-400/20',
    glowColor: 'rgba(236, 72, 153, 0.4)',
    borderColor: 'border-pink-300/30',
    iconColor: 'text-pink-500',
  },
  {
    icon: StrengthIcon,
    title: 'Courage Is a Skill You Learn',
    description: "By facing big feelings and uncertain moments, kids learn that bravery is something you practice.",
    bgGradient: 'from-brand-blue-400/20 via-brand-blue-400/15 to-brand-blue-500/20',
    glowColor: 'rgba(37, 99, 235, 0.4)',
    borderColor: 'border-brand-blue-400/30',
    iconColor: 'text-brand-blue-600',
  },
  {
    icon: StarIcon,
    title: 'Every Hero Deserves to Be Seen',
    description: "When children see themselves reflected in a hero, they begin to believe they belong in their own story.",
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
    image: '/images/Caiden@4x-100.webp',
  },
  {
    name: 'Genesis',
    microLabel: 'The Potential',
    description: "Caiden's heroic alter-ego, unlocked when he taps into courage and creativity. Genesis is everything Caiden is becoming.",
    image: '/images/Genesis@4x-100.webp',
  },
  {
    name: 'B-4',
    microLabel: 'The Mind in Motion',
    description: "A floating robotic companion who represents what's happening inside Caiden's mind. B-4 helps him understand his ADHD.",
    image: '/images/B-4@4x-100.webp',
  },
  {
    name: 'Ollie Buck',
    microLabel: 'Patience & Grounding',
    description: "Caiden's loyal companion who reminds him that slow and steady wins the race — patience is a superpower too.",
    image: '/images/Turtle@4x-100.webp',
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
    image: "/images/Comic5_Coverpage_header_Shop_smaller.webp",
  },
  {
    title: "Caiden's Courage T-Shirt",
    description: "Wear your courage! Show the world you support neurodiversity with our official Caiden's Courage t-shirt.",
    badge: "New",
    badgeColor: "bg-golden-500",
    purchaseUrl: productLinks.tShirt,
    available: false,
    comingSoon: true,
    image: "/images/Caiden'Courage_Tshirt_smaller.webp",
  },
  {
    title: "B-4 Plush Companions",
    description: "Floating robotic friends that represent different neurodivergent strengths — ADHD, Autism, Anxiety, Big Feelers, & more.",
    badge: "New",
    badgeColor: "bg-golden-500",
    purchaseUrl: productLinks.b4Plush,
    available: false,
    comingSoon: true,
    image: "/images/B-4plushcompanions_img.webp",
  },
];

// Coming soon products - uncomment when ready
// const comingSoonProducts = [
//   {
//     title: "The Courage Journal",
//     description: "A kid-friendly guided journal that helps children express feelings, track creative ideas, and build emotional strength.",
//     badge: "Coming Soon",
//     badgeColor: "bg-navy-400",
//     image: '/images/balance.webp',
//     purchaseUrl: null,
//     available: false,
//   },
// ];

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isPreorderOpen, setIsPreorderOpen] = useState(false);
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => (typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)').matches : false)
  );

  // Handle hash anchor scrolling (for homepage section deep-links)
  useEffect(() => {
    // If navigating to homepage with hash, scroll to section
    if (location.pathname === '/' && location.hash) {
      // Use a slightly longer delay to ensure DOM is fully ready after navigation
      const scrollTimeout = setTimeout(() => {
        const element = document.querySelector(location.hash);
        if (element) {
          // Calculate offset for fixed header (approximately 80px on desktop, 64px on mobile)
          const headerOffset = window.innerWidth < 768 ? 64 : 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 200);
      
      return () => clearTimeout(scrollTimeout);
    }
  }, [location.hash, location.pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const m = window.matchMedia('(max-width: 768px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    m.addEventListener('change', handler);
    return () => m.removeEventListener('change', handler);
  }, []);

  const handlePreorderClick = () => {
    navigate('/comicbook');
    window.scrollTo(0, 0);
  };

  const handleWaitlistClick = () => {
    const waitlistUrl = getWaitlistUrl();
    if (waitlistUrl) return openExternalUrl(waitlistUrl);
    setIsPreorderOpen(true);
  };

  const handleComingSoonClick = useCallback(() => {
    setIsComingSoonModalOpen(true);
  }, []);

  return (
    <div className="min-h-screen bg-cream font-body">
      <Header onComingSoonClick={handleComingSoonClick} />

      {/* Hero Section - Major Publisher Quality */}
      <section
        id="hero"
        className="major-publisher-hero relative overflow-hidden"
        style={{ 
          paddingTop: isMobile ? '130px' : '120px',
          minHeight: isMobile ? '100vh' : '92vh',
          alignItems: isMobile ? 'flex-start' : undefined
        }}
      >
        {/* Background — image or solid when REACT_APP_DISABLE_HEROES */}
        <div className="major-publisher-hero-bg absolute inset-0 z-0">
          {DISABLE_HEROES ? (
            <div className="w-full h-full bg-navy-500" aria-hidden="true" />
          ) : (
            <picture>
              <source
                media="(max-width: 768px)"
                type="image/webp"
                srcSet="/images/heroes/hero-bg_mobile_400w.webp 400w, /images/heroes/hero-bg_mobile_600w.webp 600w, /images/heroes/hero-bg_mobile_800w.webp 800w"
                sizes="100vw"
              />
              <source
                media="(min-width: 769px)"
                type="image/webp"
                srcSet="/images/heroes/hero-bg_desktop_640w.webp 640w, /images/heroes/hero-bg_desktop_960w.webp 960w, /images/heroes/hero-bg_desktop_1280w.webp 1280w, /images/heroes/hero-bg_desktop_1600w.webp 1600w"
                sizes="100vw"
              />
              <img
                src={isMobile ? '/images/heroes/hero-bg_mobile_800w.webp' : '/images/heroes/hero-bg_desktop_1600w.webp'}
                alt="Caiden falling through a fantastical sky"
                width={1600}
                height={817}
                className="w-full h-full object-cover"
                style={{ objectPosition: isMobile ? 'center 35%' : 'center 30%' }}
                loading="eager"
                decoding="async"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = isMobile ? '/images/heroes/hero-bg_mobile_800w.webp' : '/images/heroes/hero-bg_desktop_1600w.webp';
                }}
              />
            </picture>
          )}
        </div>
        
        {/* Gradient Overlay */}
        <div className="major-publisher-hero-overlay absolute inset-0" style={{ zIndex: 1 }}></div>
        
        {/* Star Dust Animation */}
        <div className="major-publisher-stardust absolute inset-0" style={{ zIndex: 1 }} aria-hidden="true"></div>
        
        {/* Mythic Silhouettes */}
        <div className="major-publisher-silhouettes absolute inset-0" style={{ zIndex: 1 }} aria-hidden="true">
          {/* Dragon Silhouette */}
          <svg className="major-publisher-silhouette major-publisher-dragon" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 20 C120 40, 140 60, 160 80 C170 90, 175 100, 180 110 C185 120, 180 130, 175 140 C170 150, 160 155, 150 160 C140 165, 130 165, 120 160 C110 155, 100 150, 90 145 C80 140, 70 135, 60 130 C50 125, 40 120, 30 115 C20 110, 15 100, 20 90 C25 80, 35 70, 45 60 C55 50, 65 40, 75 30 C85 25, 95 20, 100 20 Z" fill="currentColor" opacity="0.1"/>
            <path d="M100 40 L110 60 L120 80 L130 100 L125 120 L115 130 L105 125 L95 115 L85 100 L80 80 L85 60 L95 50 Z" fill="currentColor" opacity="0.08"/>
          </svg>
          
          {/* Spider Glyph */}
          <svg className="major-publisher-silhouette major-publisher-spider" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="75" cy="50" r="20" fill="currentColor" opacity="0.1"/>
            <path d="M75 70 L75 90 M55 60 L45 70 M95 60 L105 70 M55 80 L45 90 M95 80 L105 90 M55 100 L45 110 M95 100 L105 110" stroke="currentColor" strokeWidth="3" opacity="0.1" strokeLinecap="round"/>
          </svg>
          
          {/* Portal Swirl */}
          <svg className="major-publisher-silhouette major-publisher-portal" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M90 90 m-60,0 a60,60 0 1,1 120,0 a60,60 0 1,1 -120,0" stroke="currentColor" strokeWidth="2" opacity="0.12" fill="none"/>
            <path d="M90 90 m-40,0 a40,40 0 1,1 80,0 a40,40 0 1,1 -80,0" stroke="currentColor" strokeWidth="2" opacity="0.1" fill="none"/>
            <path d="M90 90 m-20,0 a20,20 0 1,1 40,0 a20,20 0 1,1 -40,0" stroke="currentColor" strokeWidth="2" opacity="0.08" fill="none"/>
          </svg>
        </div>
        
        {/* Content - aligned to global nav grid; vertically centered on desktop only */}
        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex md:items-center md:min-h-[calc(92vh-120px)]">
              <div className="text-left w-full md:max-w-[520px]" style={{ maxWidth: '520px', marginBottom: '0' }}>
            {/* Eyebrow */}
            <div 
              className="text-xs sm:text-sm font-semibold uppercase"
              style={{ 
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                opacity: 0.8,
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: '12px'
              }}
            >
              INTRODUCING THE WORLD OF CAIDEN
            </div>
            
                {/* Headline */}
                <h1 
                  className="font-display font-extrabold text-white"
                  style={{ 
                    fontSize: 'clamp(44px, 5vw, 64px)',
                    lineHeight: '1.05',
                    letterSpacing: '-1px',
                    marginBottom: '16px'
                  }}
                >
                  Every Hero Starts Somewhere.
                </h1>
            
                {/* Subheader */}
                <p 
                  className="text-white font-medium"
                  style={{ 
                    fontSize: '22px',
                    lineHeight: '1.4',
                    marginBottom: '12px',
                    opacity: 0.92
                  }}
                >
                  An illustrated adventure where imagination, courage, and ancient mysteries collide.
                </p>

                {/* CTA Row */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handlePreorderClick}
                    className="w-full sm:w-auto"
                  >
                    Pre-Order Volume 1
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    as={Link}
                    to="/world"
                    className="w-full sm:w-auto !bg-transparent !border-2 !border-white !text-white hover:!bg-white/10"
                  >
                    Explore the World
                  </Button>
                </div>

                {/* Trust Line */}
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-golden-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 0 L12.5 7.5 L20 10 L12.5 12.5 L10 20 L7.5 12.5 L0 10 L7.5 7.5 Z" fill="currentColor"/>
                  </svg>
                  <span className="text-sm text-white/80">Built for ages 6–12 • Loved by parents & educators</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slanted Wave Transition */}
        <div className="absolute bottom-0 left-0 right-0 z-10" style={{ height: '150px', lineHeight: 0, overflow: 'hidden' }}>
          <svg 
            className="w-full h-full" 
            viewBox="0 0 1440 150" 
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M0,60 C360,140 1080,0 1440,80 L1440,150 L0,150 Z"
              fill="#ffffff"
            />
          </svg>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="bg-white border-b border-navy-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12 lg:gap-16">
            {/* Trust Item 1 */}
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-golden-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
              <span className="text-navy-600 font-medium text-base sm:text-lg">Loved by parents and educators</span>
            </div>
            
            {/* Trust Item 2 */}
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-golden-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
              <span className="text-navy-600 font-medium text-base sm:text-lg">Built for growing readers</span>
            </div>
            
            {/* Trust Item 3 */}
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-golden-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
              <span className="text-navy-600 font-medium text-base sm:text-lg">Designed to strengthen emotional confidence</span>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Hero Section */}
      <section className="bg-cream relative overflow-hidden meet-hero-section pt-20 md:pt-0">
        <div className="hero-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-start md:items-center meet-hero-grid">
            {/* Left Column - Image - Below text on mobile */}
            <div className="order-2 md:order-1">
              <div 
                className="w-full mb-6 relative overflow-hidden cinematic-hero-image"
                style={{ 
                  width: '100%',
                  height: 'clamp(320px, 42vw, 560px)',
                  borderRadius: '20px',
                  margin: 0,
                  padding: 0,
                }}
              >
                <img
                  src="/images/characters/Caiden_img_profile.webp"
                  srcSet="/images/characters/Caiden_img_profile_192w.webp 192w, /images/characters/Caiden_img_profile_400w.webp 400w, /images/characters/Caiden_img_profile.webp 1024w"
                  sizes="(max-width: 768px) 100vw, 42vw"
                  width={560}
                  height={560}
                  alt="Caiden - The Hero"
                  className="w-full h-full object-cover"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    display: 'block',
                    margin: 0,
                    padding: 0,
                    border: 'none',
                    outline: 'none',
                  }}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              
              {/* Comic Book Callout */}
              <div className="w-full">
                <Link
                  to="/comicbook"
                  className="block bg-transparent rounded-2xl p-4 sm:p-5 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    {/* Comic Book Image - Circular with blue border */}
                    <div className="flex-shrink-0">
                      <div className="rounded-full overflow-hidden" style={{ width: '80px', height: '80px', minWidth: '80px', minHeight: '80px', flexShrink: 0 }}>
                        <picture>
                          <source
                            type="image/webp"
                            srcSet="/images/Comic5_Coverpage_header_smaller-900.webp 900w, /images/Comic5_Coverpage_header_smaller-1600.webp 1600w"
                            sizes="160px"
                          />
                          <img
                            src="/images/Comic5_Coverpage_header_smaller-1600.webp"
                            alt="Caiden's Courage Comic Book"
                            width={80}
                            height={80}
                            className="object-cover"
                            loading="lazy"
                            decoding="async"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block', margin: 0, padding: 0 }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/ui/logoCaiden_480w.webp';
                            }}
                          />
                        </picture>
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

            {/* Right Column - Copy - Above image on mobile; center-aligned on mobile only */}
            <div className="order-1 md:order-2 hero-text text-center md:text-left">
              {/* Eyebrow */}
              <div 
                className="text-xs sm:text-sm font-semibold uppercase mb-4"
                style={{ 
                  letterSpacing: '0.12em',
                  color: 'rgba(36, 62, 112, 0.8)'
                }}
              >
                MEET CAIDEN
              </div>

              {/* Headline */}
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-500 mb-6">
                Not Every Hero Looks Fearless.
              </h2>

              {/* Body Paragraphs */}
              <div className="space-y-4 mb-8">
                <p className="text-lg sm:text-xl text-navy-600 leading-relaxed">
                  Caiden is an 11-year-old boy who discovers that the thing he struggles with most… may also be the source of his greatest strength.
                </p>
                <p className="text-lg sm:text-xl text-navy-600 leading-relaxed">
                  Through imagination, friendship, and everyday bravery, Caiden learns to understand himself — and show up with courage in a world that doesn't always see him clearly.
                </p>
              </div>

              {/* Power Line */}
              <div className="mb-0">
                <p className="text-navy-500 leading-relaxed meet-hero-thesis" style={{ fontWeight: 600 }}>
                  Being different isn't a weakness.
                  <br />
                  It's where courage begins.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who Is Caiden Section */}
      <section id="about" className="py-20 sm:py-28 bg-navy-500 relative overflow-hidden" style={{ scrollMarginTop: '80px' }}>
        {/* Anchor for "What is Caiden's Courage?" navigation */}
        <span id="who-is-caiden" style={{ position: 'absolute', top: '-80px', visibility: 'hidden' }} aria-hidden="true"></span>
        {/* Decorative elements - hidden on mobile */}
        <div className="hidden sm:block circle-accent circle-coral w-24 h-24 -top-12 left-1/4 opacity-50" style={{ animationDelay: '0s' }} />
        <div className="hidden sm:block circle-accent circle-coral w-16 h-16 bottom-20 left-8 opacity-40" style={{ animationDelay: '1.5s' }} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left content */}
            <div className="animate-fade-in text-center lg:text-left">
              {/* Eyebrow */}
              <div 
                className="text-xs sm:text-sm font-semibold uppercase mb-4"
                style={{ 
                  letterSpacing: '0.12em',
                  color: 'rgba(255, 255, 255, 0.8)'
                }}
              >
                HERO'S PATHS
              </div>
              
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6">
                Kids Learn This In The Universe?
              </h2>
              
              <p className="mt-4 text-lg sm:text-xl text-white font-semibold leading-relaxed mb-6">
                Not just a story world — a courage practice. Kids learn to name big feelings, trust their minds, and take brave next steps.
              </p>
              
              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Button
                  variant="primary"
                  size="md"
                  as={Link}
                  to="/characters"
                  className="w-full sm:w-auto"
                >
                  Meet the Characters
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  as={Link}
                  to="/world"
                  className="w-full sm:w-auto !bg-transparent !border-2 !border-white !text-white hover:!bg-white/10"
                >
                  Enter Caiden's World
                </Button>
              </div>

              {/* Helper Line */}
              <p className="text-sm text-white/60">
                For readers ages 6–12 — and anyone discovering their courage.
              </p>
            </div>

            {/* Right - Feature cards optimized for performance */}
            <div className="grid sm:grid-cols-2 gap-6 relative z-10">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="relative group h-full"
                >
                  {/* Card container with cinematic styling */}
                  <div
                    className="relative cinematic-pillar-card rounded-3xl p-6 sm:p-7 transition-all duration-300 cursor-pointer h-full flex flex-col"
                    style={{
                      borderRadius: '26px',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
                    }}
                  >
                    {/* Dark cinematic gradient background */}
                    <div 
                      className="absolute inset-0 rounded-3xl z-0 cinematic-card-bg"
                      style={{
                        background: index === 0 
                          ? 'linear-gradient(135deg, rgba(36, 62, 112, 0.95) 0%, rgba(55, 48, 163, 0.85) 100%)'
                          : index === 1
                          ? 'linear-gradient(135deg, rgba(55, 48, 163, 0.95) 0%, rgba(79, 70, 229, 0.85) 100%)'
                          : index === 2
                          ? 'linear-gradient(135deg, rgba(30, 58, 138, 0.95) 0%, rgba(37, 99, 235, 0.85) 100%)'
                          : 'linear-gradient(135deg, rgba(36, 62, 112, 0.95) 0%, rgba(55, 48, 163, 0.85) 100%)',
                        transition: 'transform 0.3s ease',
                      }}
                    ></div>
                    
                    {/* Vignette overlay */}
                    <div 
                      className="absolute inset-0 rounded-3xl z-0"
                      style={{
                        background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.15) 100%)',
                      }}
                    ></div>
                    
                    {/* Grain texture */}
                    <div 
                      className="absolute inset-0 rounded-3xl z-0 opacity-[0.04]"
                      style={{
                        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 255, 255, 0.1) 2px, rgba(255, 255, 255, 0.1) 4px)',
                      }}
                    ></div>
                    
                    {/* Content layer */}
                    <div className="relative z-20 flex flex-col flex-grow">
                      {/* Icon badge with scene glow */}
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 mb-4">
                        <div 
                          className="absolute inset-0 rounded-full z-0"
                          style={{
                            background: 'radial-gradient(circle, rgba(251, 191, 36, 0.15) 0%, transparent 70%)',
                            transform: 'scale(1.5)',
                          }}
                        ></div>
                        <div 
                          className="relative z-10 transition-transform duration-200 group-hover:scale-105"
                          style={{ 
                            filter: 'brightness(1.2) saturate(1.1)',
                            color: index === 0 ? '#F0CE6E' : index === 1 ? '#E879F9' : index === 2 ? '#60A5FA' : '#34D399'
                          }}
                        >
                          <feature.icon className="w-full h-full" />
                        </div>
                      </div>
                      
                      {/* Title - reduced size and weight */}
                      <h3 className="font-display font-semibold text-white leading-tight mb-3" style={{ fontWeight: 600, fontSize: '20px' }}>
                        {feature.title}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-white/90 flex-grow leading-relaxed" style={{ fontSize: '15px', lineHeight: '1.65' }}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-12 sm:py-20 md:py-28 bg-cream relative overflow-hidden pb-16">
        <div className="hidden sm:block circle-accent circle-navy w-20 h-20 top-20 right-16 opacity-60" style={{ animationDelay: '0.5s' }} />
        <div className="hidden sm:block circle-accent circle-coral w-12 h-12 bottom-24 left-12 opacity-50" style={{ animationDelay: '3s' }} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-20 items-center min-w-0" style={{ gridTemplateColumns: '1fr 1.2fr' }}>
            {/* Image Column - First on mobile */}
            <div className="order-1 lg:order-1 w-full min-w-0">
              <div 
                className="mx-auto overflow-hidden w-full max-w-full lg:max-w-[440px] rounded-[16%]"
                style={{ aspectRatio: '1/1' }}
              >
                <img
                  src="/images/Courageforeverykid.webp"
                  alt="Caiden celebrating - Courage for Every Kid"
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/Courageforeverykid.webp';
                  }}
                />
              </div>
            </div>
            {/* Text Column - Second on mobile */}
            <div className="order-2 lg:order-2 w-full text-left min-w-0">
              <div className="mx-auto lg:mx-0 max-w-full break-words px-2 sm:px-4 md:px-5" style={{ maxWidth: '560px' }}>
                <span className="inline-block px-3 py-1 bg-golden-500 text-navy-500 font-semibold text-sm rounded-md">Our Mission:</span>
                <h2 
                  className="font-display font-extrabold text-navy-500 mt-2 break-words"
                  style={{ fontSize: 'clamp(32px, 4vw, 40px)' }}
                >
                  Courage for Every Kid
                </h2>
                <p 
                  className="mt-6 text-navy-600 leading-relaxed break-words"
                  style={{ fontSize: '16px', lineHeight: '1.6' }}
                >
                  Every child deserves to see their mind as powerful — especially the ones who feel different.
                </p>
                <p 
                  className="mt-4 text-navy-600 leading-relaxed break-words"
                  style={{ fontSize: '16px', lineHeight: '1.6' }}
                >
                  Caiden's Courage was created to help kids understand their emotions, celebrate neurodiversity, and discover the superhero that already lives inside them. Through stories, characters, and imaginative learning tools, we empower children to feel seen, confident, and brave in their everyday world.
                </p>
                <div className="mt-8">
                  <div className="w-full max-w-[360px] mx-auto lg:mx-0">
                    <Button
                      variant="primary"
                      size="md"
                      as={Link}
                      to="/mission"
                      className="w-full"
                    >
                      Learn About the Mission
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enter the World / SEL Section */}
      <section className="py-12 sm:py-16 md:py-24 bg-cream relative overflow-hidden pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-w-0" style={{ gridTemplateColumns: '1fr 1.2fr' }}>
            {/* Image Column - First on mobile */}
            <div className="order-1 lg:order-2 relative w-full min-w-0">
              <div 
                className="mx-auto overflow-hidden w-full max-w-full lg:max-w-[440px] rounded-[16%]"
                style={{ aspectRatio: '1/1' }}
              >
                <img
                  src="/images/SEL_Caidenshield_img.webp"
                  alt="Caiden deflecting the dragon's energy with his courage shield — Interactive SEL Adventures"
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
            
            {/* Text Column - Second on mobile */}
            <div className="order-2 lg:order-1 w-full min-w-0">
              <div className="mx-auto lg:mx-0 max-w-full break-words px-2 sm:px-4 md:px-5" style={{ maxWidth: '560px' }}>
                <h2 
                  className="font-display font-extrabold text-navy-500 mb-6 text-left break-words"
                  style={{ fontSize: 'clamp(32px, 4vw, 40px)' }}
                >
                  Discover the Courage Inside You
                </h2>
                <p 
                  className="text-navy-600 leading-relaxed mb-8 text-left break-words"
                  style={{ fontSize: '16px', lineHeight: '1.6' }}
                >
                  Step into Caiden's world with interactive social-emotional adventures that help kids think bravely, feel deeply, and grow with confidence.
                </p>
                <div className="w-full max-w-[360px] mx-auto lg:mx-0">
                  <Button
                    variant="primary"
                    size="lg"
                    as={Link}
                    to="/b4-tools"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="w-full"
                  >
                    Start Your Brave Journey
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Characters Section */}
      <section id="characters" className="py-20 sm:py-28 bg-navy-500 relative overflow-hidden" style={{ scrollMarginTop: '80px' }}>
        <div className="hidden sm:block circle-accent circle-coral w-28 h-28 top-12 left-8 opacity-40" style={{ animationDelay: '0.2s' }} />
        <div className="hidden sm:block circle-accent circle-coral w-20 h-20 bottom-16 right-12 opacity-50" style={{ animationDelay: '0.4s' }} />
        
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
                className="character-card fade-in-card bg-navy-600/50 rounded-2xl p-5 text-center backdrop-blur-sm border border-white/10 hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
              >
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-golden-400 to-golden-600 p-1 shadow-golden">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                      <img
                        src={character.image}
                        alt={character.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
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
          
          {/* Navigation Button */}
          <div className="mt-12 sm:mt-16 text-center">
            <Button
              variant="primary"
              size="lg"
              as={Link}
              to="/characters"
              className="w-full sm:w-auto"
            >
              Meet the Characters
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-20 bg-cream relative overflow-hidden">
        {/* 3D Animated Bubbles - Organic placement near content */}
        <div className="absolute rounded-full pointer-events-none animate-float opacity-100" style={{ 
          top: '20%',
          left: '18%',
          width: '22px',
          height: '22px',
          background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), #f97316, #ea580c)',
          boxShadow: '0 8px 16px rgba(249, 115, 22, 0.4), inset -3px -3px 8px rgba(0,0,0,0.2), inset 3px 3px 8px rgba(255,255,255,0.3)',
          animationDelay: '1s'
        }}></div>
        <div className="absolute rounded-full pointer-events-none animate-float opacity-100" style={{ 
          bottom: '24%',
          right: '20%',
          width: '18px',
          height: '18px',
          background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), #a855f7, #9333ea)',
          boxShadow: '0 8px 16px rgba(168, 85, 247, 0.4), inset -3px -3px 8px rgba(0,0,0,0.2), inset 3px 3px 8px rgba(255,255,255,0.3)',
          animationDelay: '2.5s'
        }}></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Eyebrow */}
          <div className="text-center mb-3">
            <p className="text-xs sm:text-sm font-semibold text-navy-400 uppercase tracking-[0.2em]">
              FROM PARENTS, CAREGIVERS & EDUCATORS
            </p>
          </div>

          {/* Main Headline */}
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-500 mb-2 text-center">
            What Families Are Saying
          </h2>

          {/* Subhead */}
          <p className="text-sm sm:text-base text-navy-400 text-center mb-10 sm:mb-12">
            Real words from parents, educators, and creators discovering Caiden's Courage.
          </p>

          {/* Testimonials Grid */}
          <div className="space-y-5 sm:space-y-6">
            {/* Testimonial 1 - Slightly left-aligned on desktop */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden md:mr-auto md:max-w-[95%]">
              {/* Quote Icon Badge - Top Right */}
              <div className="absolute top-4 right-4 opacity-[0.08]">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                  <path d="M3 21C3 17.4 5.4 15 9 15C10.2 15 11.4 15.3 12.6 15.9C13.2 16.2 13.5 16.8 13.2 17.4C12.9 18 12.3 18.3 11.7 18C10.8 17.4 9.9 17.1 9 17.1C7.2 17.1 6 18.3 6 20.1V21H3Z" fill="#243E70"/>
                  <path d="M14.4 21C14.4 17.4 16.8 15 20.4 15C21.6 15 22.8 15.3 24 15.9C24.6 16.2 24.9 16.8 24.6 17.4C24.3 18 23.7 18.3 23.1 18C22.2 17.4 21.3 17.1 20.4 17.1C18.6 17.1 17.4 18.3 17.4 20.1V21H14.4Z" fill="#243E70"/>
                </svg>
              </div>
              
              <div className="relative z-10">
                <div className="text-yellow-500 text-xl sm:text-2xl mb-3">★★★★★</div>
                <p className="text-navy-600 text-base sm:text-lg leading-relaxed max-w-[85ch]">
                  "My child finally saw themselves in a character. That alone made this worth it."
                </p>
                <p className="text-navy-400 text-sm mt-3">
                  — Parent of a 9-year-old
                </p>
              </div>
            </div>

            {/* Testimonial 2 - Slightly right-aligned on desktop */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden md:ml-auto md:max-w-[95%]">
              {/* Quote Icon Badge - Top Right */}
              <div className="absolute top-4 right-4 opacity-[0.08]">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                  <path d="M3 21C3 17.4 5.4 15 9 15C10.2 15 11.4 15.3 12.6 15.9C13.2 16.2 13.5 16.8 13.2 17.4C12.9 18 12.3 18.3 11.7 18C10.8 17.4 9.9 17.1 9 17.1C7.2 17.1 6 18.3 6 20.1V21H3Z" fill="#243E70"/>
                  <path d="M14.4 21C14.4 17.4 16.8 15 20.4 15C21.6 15 22.8 15.3 24 15.9C24.6 16.2 24.9 16.8 24.6 17.4C24.3 18 23.7 18.3 23.1 18C22.2 17.4 21.3 17.1 20.4 17.1C18.6 17.1 17.4 18.3 17.4 20.1V21H14.4Z" fill="#243E70"/>
                </svg>
              </div>
              
              <div className="relative z-10">
                <div className="text-yellow-500 text-xl sm:text-2xl mb-3">★★★★★</div>
                <p className="text-navy-600 text-base sm:text-lg leading-relaxed max-w-[85ch]">
                  "This opened up conversations about focus and feelings we couldn't have before."
                </p>
                <p className="text-navy-400 text-sm mt-3">
                  — 3rd Grade Teacher
                </p>
              </div>
            </div>

            {/* Testimonial 3 - Centered as soft closing moment */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
              {/* Quote Icon Badge - Top Right */}
              <div className="absolute top-4 right-4 opacity-[0.08]">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                  <path d="M3 21C3 17.4 5.4 15 9 15C10.2 15 11.4 15.3 12.6 15.9C13.2 16.2 13.5 16.8 13.2 17.4C12.9 18 12.3 18.3 11.7 18C10.8 17.4 9.9 17.1 9 17.1C7.2 17.1 6 18.3 6 20.1V21H3Z" fill="#243E70"/>
                  <path d="M14.4 21C14.4 17.4 16.8 15 20.4 15C21.6 15 22.8 15.3 24 15.9C24.6 16.2 24.9 16.8 24.6 17.4C24.3 18 23.7 18.3 23.1 18C22.2 17.4 21.3 17.1 20.4 17.1C18.6 17.1 17.4 18.3 17.4 20.1V21H14.4Z" fill="#243E70"/>
                </svg>
              </div>
              
              <div className="relative z-10">
                <div className="text-yellow-500 text-xl sm:text-2xl mb-3">★★★★★</div>
                <p className="text-navy-600 text-base sm:text-lg leading-relaxed max-w-[85ch]">
                  "I met a kid at Barnes & Noble who couldn't wait to read this. He picked it up on his own and asked if he could start right there."
                </p>
                <p className="text-navy-400/70 text-xs sm:text-sm mt-3">
                  — From a Barnes & Noble moment
                </p>
              </div>
            </div>

            {/* Testimonial 4 - New testimonial */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden md:mr-auto md:max-w-[95%]">
              {/* Quote Icon Badge - Top Right */}
              <div className="absolute top-4 right-4 opacity-[0.08]">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                  <path d="M3 21C3 17.4 5.4 15 9 15C10.2 15 11.4 15.3 12.6 15.9C13.2 16.2 13.5 16.8 13.2 17.4C12.9 18 12.3 18.3 11.7 18C10.8 17.4 9.9 17.1 9 17.1C7.2 17.1 6 18.3 6 20.1V21H3Z" fill="#243E70"/>
                  <path d="M14.4 21C14.4 17.4 16.8 15 20.4 15C21.6 15 22.8 15.3 24 15.9C24.6 16.2 24.9 16.8 24.6 17.4C24.3 18 23.7 18.3 23.1 18C22.2 17.4 21.3 17.1 20.4 17.1C18.6 17.1 17.4 18.3 17.4 20.1V21H14.4Z" fill="#243E70"/>
                </svg>
              </div>
              
              <div className="relative z-10">
                <div className="text-yellow-500 text-xl sm:text-2xl mb-3">★★★★★</div>
                <p className="text-navy-600 text-base sm:text-lg leading-relaxed max-w-[85ch]">
                  "My son is self-taught and loves to draw, and seeing your work made him light up. He immediately wanted to know how it was made and couldn't stop asking questions. It's rare to find something that sparks both creativity and confidence like this."
                </p>
                <p className="text-navy-400 text-sm mt-3">
                  — Parent of a 10-year-old
                </p>
              </div>
            </div>

            <p className="text-center text-navy-400 text-sm italic pt-2">
              (More reviews coming as the Courage community grows.)
            </p>
          </div>
        </div>
      </section>

      {/* Shop Section */}
      <section id="products" className="py-20 sm:py-28 bg-cream relative overflow-hidden" style={{ scrollMarginTop: '80px' }}>
        <div className="hidden sm:block circle-accent circle-coral w-16 h-16 top-16 left-1/3 opacity-40" style={{ animationDelay: '0.3s' }} />
        <div className="hidden sm:block circle-accent circle-navy w-12 h-12 bottom-24 right-8 opacity-30" style={{ animationDelay: '0.5s' }} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-500">
              Begin the First Adventure
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
                className={`feature-card fade-in-card bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-xl hover:scale-[1.02] transition-all duration-200 ${
                  product.available && !product.comingSoon ? 'ring-2 ring-golden-500/50' : ''
                }`}
              >
                {/* Product Image */}
                {product.image && (
                  <div className="w-full h-48 sm:h-56 overflow-hidden bg-navy-50">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                )}
                <div className="p-6">
                  {/* Badges */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-4 py-1.5 ${product.badgeColor} text-navy-500 text-sm font-semibold rounded-full`}>
                      {product.badge}
                    </span>
                    {product.comingSoon && (
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
                      onClick={() => {
                        navigate('/comicbook');
                        window.scrollTo(0, 0);
                      }}
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
                  ) : product.comingSoon ? (
                    <button
                      onClick={handleComingSoonClick}
                      className="mt-5 w-full py-3 px-6 bg-transparent border-2 border-navy-300 text-navy-600 font-semibold rounded-full hover:bg-navy-50 hover:border-navy-400 hover:shadow-md transition-all duration-300"
                    >
                      {product.title.includes('T-Shirt') ? 'T-Shirts — Coming Soon' : product.title.includes('Plush') ? 'Plushies — Coming Soon' : 'Coming Soon'}
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
          <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center items-center">
            <Button
              variant="primary"
              size="md"
              onClick={handleWaitlistClick}
            >
              Join the Courage Community
            </Button>
            <Button
              variant="secondary"
              size="md"
              as="a"
              href="mailto:stills@caidenscourage.com"
              className="!bg-transparent !border-2 !border-white/40 !text-white hover:!bg-white/10 focus:!ring-white/50 hover:!border-white/60"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      <Footer />

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
              aria-label="Close pre-order"
            >
              ✕
            </button>
            <iframe
              src="https://beacons.ai/stillianoblack"
              title="Caiden's Courage Pre-order"
              className="w-full h-[70vh] rounded-2xl bg-white shadow-2xl"
              loading="lazy"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
