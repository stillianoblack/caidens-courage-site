import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getWaitlistUrl, openExternalUrl, productLinks } from '../config/externalLinks';
import { DISABLE_HEROES } from '../config/heroes';
import Button from '../components/ui/Button';
import Header from '../components/Header';
import Footer from '../components/Footer';
import GlobalNotification from '../components/GlobalNotification';

// Reusable InsideCard Component for "What's Inside" section
interface InsideCardProps {
  title: string;
  bullets: string[];
  iconType: 'adventure' | 'feelings' | 'confidence' | 'read';
  helpView: 'kids' | 'parents' | 'teachers';
}

const InsideCard: React.FC<InsideCardProps> = ({ title, bullets, iconType, helpView }) => {
  // Color system based on active role
  const getIconStyles = () => {
    if (helpView === 'kids') {
      return {
        background: 'rgba(37, 99, 235, 0.15)', // brand-blue-600 at 15% opacity (darker for accessibility)
        iconColor: '#2563eb' // brand-blue-600 (darker for accessibility)
      };
    } else if (helpView === 'parents') {
      return {
        background: 'rgba(168, 85, 247, 0.15)', // purple-500 at 15% opacity
        iconColor: '#a855f7' // purple-500
      };
    } else if (helpView === 'teachers') {
      return {
        background: 'rgba(249, 115, 22, 0.15)', // orange-500 at 15% opacity
        iconColor: '#f97316' // orange-500
      };
    }
    
    // Fallback
    return {
      background: 'transparent',
      iconColor: '#6b7280'
    };
  };

  const iconStyles = getIconStyles();

  // Render symbolic SVG icon based on card type
  const renderIcon = () => {
    const iconColor = iconStyles.iconColor;
    
    switch (iconType) {
      case 'adventure':
        // Adventure/Journey symbol - compass or map
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[65%] h-[65%]">
            <circle cx="12" cy="12" r="9" stroke={iconColor} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <path d="M12 3 L12 12 L16 16" stroke={iconColor} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="12" r="2" fill={iconColor}/>
          </svg>
        );
      case 'feelings':
        // Emotion/Communication symbol - heart or speech bubble
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[65%] h-[65%]">
            <path d="M12 21 C16.5 17 20 13.5 20 9.5 C20 7 18 5 15.5 5 C14 5 12.5 5.5 12 6.5 C11.5 5.5 10 5 8.5 5 C6 5 4 7 4 9.5 C4 13.5 7.5 17 12 21 Z" 
                  stroke={iconColor} strokeWidth="1.5" fill={iconColor} fillOpacity="0.1" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 10 C8 10.5 8.5 11 9 11 C9.5 11 10 10.5 10 10" stroke={iconColor} strokeWidth="1.2" fill="none" strokeLinecap="round"/>
            <path d="M14 10 C14 10.5 14.5 11 15 11 C15.5 11 16 10.5 16 10" stroke={iconColor} strokeWidth="1.2" fill="none" strokeLinecap="round"/>
            <path d="M9 14 C9.5 14.5 10.5 14.5 11 14" stroke={iconColor} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'confidence':
        // Strength/Shield symbol
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[65%] h-[65%]">
            <path d="M12 2 L4 5 L4 11 C4 16 7 20 12 22 C17 20 20 16 20 11 L20 5 Z" 
                  stroke={iconColor} strokeWidth="1.5" fill={iconColor} fillOpacity="0.1" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 8 L10 10 L12 12 L14 10 Z" stroke={iconColor} strokeWidth="1.5" fill={iconColor} fillOpacity="0.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 12 L12 16" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        );
      case 'read':
        // Book/Backpack symbol
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[65%] h-[65%]">
            <path d="M4 19.5 C4 19.5 5.5 19 7 19 C10.5 19 11.5 20 12 20 C12.5 20 13.5 19 17 19 C18.5 19 20 19.5 20 19.5 L20 4.5 C20 4.5 18.5 5 17 5 C13.5 5 12.5 4 12 4 C11.5 4 10.5 5 7 5 C5.5 5 4 4.5 4 4.5 Z" 
                  stroke={iconColor} strokeWidth="1.5" fill={iconColor} fillOpacity="0.1" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 4.5 L4 19.5" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M20 4.5 L20 19.5" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M12 4 L12 20" stroke={iconColor} strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2 2"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-[18px] sm:rounded-[20px] p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] relative overflow-hidden">
      {/* Circular Icon Badge - Top Right with role-based colors */}
      <div 
        className="absolute top-3 right-3 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300"
        style={{
          backgroundColor: iconStyles.background
        }}
      >
        {renderIcon()}
      </div>
      
      <div className="relative z-10 pr-20 sm:pr-22">
        {/* Card Title */}
        <h3 className="font-display text-xl sm:text-[26px] font-bold text-navy-500 mb-3">
          {title}
        </h3>
        
        {/* Bullet List */}
        <ul className="space-y-2.5 sm:space-y-3 text-navy-600 text-base sm:text-lg leading-[1.5]">
          {bullets.map((bullet, index) => (
            <li key={index} className="flex items-start">
              <span className="text-navy-400/60 mr-2.5 text-[14px] mt-0.5 flex-shrink-0">•</span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const Product: React.FC = () => {
  const location = useLocation();
  const [isPreorderOpen, setIsPreorderOpen] = useState(false);
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState(false);
  const [showDigitalNotice, setShowDigitalNotice] = useState(false);

  const handleDigitalClick = () => {
    setShowDigitalNotice(true);
  };

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [helpView, setHelpView] = useState<'kids' | 'parents' | 'teachers'>('kids');

  // Gallery images: responsive comic cover (900/1600w); thumb = small for strip.
  const galleryImages: { src: string; thumb?: string; alt: string; heroSrcSet?: string; heroSizes?: string }[] = [
    {
      src: "/images/comic-book/Comic5_Coverpage_header_2.jpg",
      thumb: "/images/comic-book/Comic5_Coverpage_header_2.jpg",
      alt: "Caiden's Courage and the Dragon's Nest: The Graphic Novel Cover",
    },
    {
      src: "/images/comic-book/Comic5_Coverpage_header_Shop_2.jpg",
      thumb: "/images/comic-book/Comic5_Coverpage_header_Shop_2.jpg",
      alt: "Caiden's Courage and the Dragon's Nest: Interior spread",
    },
    {
      src: "/images/comic-book/zThirdpage_Comic5_Coverpage_header_Shop.jpg",
      thumb: "/images/comic-book/zThirdpage_Comic5_Coverpage_header_Shop.jpg",
      alt: "Caiden's Courage: Third page",
    },
  ];

  // Set page title
  useEffect(() => {
    document.title = "Caiden's Courage and the Dragon's Nest: The Graphic Novel | Caiden's Courage";
  }, []);

  // Page-local scroll reset: only when there's no hash (preserve anchor navigation). Use router location, not window.location.
  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [location.pathname, location.hash]);


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

      {/* Section 1: Hero Product Area */}
      <section className="pb-16 sm:pb-24 bg-white relative overflow-hidden" style={{ paddingTop: '150px' }}>
        {/* 3D Animated Bubbles - Organic placement near content */}
        <div className="absolute rounded-full pointer-events-none animate-float opacity-100" style={{ 
          top: '25%',
          right: '15%',
          width: '24px',
          height: '24px',
          background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), #f97316, #ea580c)',
          boxShadow: '0 8px 16px rgba(249, 115, 22, 0.4), inset -3px -3px 8px rgba(0,0,0,0.2), inset 3px 3px 8px rgba(255,255,255,0.3)',
          animationDelay: '0s'
        }}></div>
        <div className="absolute rounded-full pointer-events-none animate-float opacity-100" style={{ 
          bottom: '30%',
          left: '18%',
          width: '20px',
          height: '20px',
          background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), #3b82f6, #2563eb)',
          boxShadow: '0 8px 16px rgba(59, 130, 246, 0.4), inset -3px -3px 8px rgba(0,0,0,0.2), inset 3px 3px 8px rgba(255,255,255,0.3)',
          animationDelay: '2s'
        }}></div>
        
        <div className="max-w-7xl mx-auto px-[5%] sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* LEFT COLUMN: Interactive Image Gallery */}
            <div className="order-1 md:order-1 flex flex-col">
              {/* Main Image - First on both mobile and desktop */}
              <div 
                className="bg-white rounded-2xl overflow-hidden mb-4 cursor-default md:cursor-zoom-in relative flex justify-center order-1"
                onMouseMove={(e) => {
                  // Only enable on desktop (md and up)
                  if (window.innerWidth >= 768) {
                    const img = e.currentTarget.querySelector('img') as HTMLImageElement;
                    if (img && img.style.transform.includes('scale(2.25)')) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = ((e.clientX - rect.left) / rect.width) * 100;
                      const y = ((e.clientY - rect.top) / rect.height) * 100;
                      img.style.transformOrigin = `${x}% ${y}%`;
                    }
                  }
                }}
              >
                {/* First Edition Badge - subtle, near cover */}
                <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-navy-600 text-xs font-semibold border border-navy-100 shadow-sm">
                  First Edition Print
                </div>
                {DISABLE_HEROES ? (
                  <div
                    className="w-full mx-auto bg-navy-500"
                    style={{ aspectRatio: '742/494', maxWidth: 742 }}
                    aria-hidden="true"
                  />
                ) : galleryImages[selectedImageIndex].heroSrcSet ? (
                  <picture>
                    <source
                      type="image/webp"
                      srcSet={galleryImages[selectedImageIndex].heroSrcSet}
                      sizes={galleryImages[selectedImageIndex].heroSizes}
                    />
                    <img
                      src={galleryImages[selectedImageIndex].src}
                      alt={galleryImages[selectedImageIndex].alt}
                      width={742}
                      height={494}
                      className="w-full h-auto object-cover mx-auto"
                      loading="eager"
                      style={{
                        transformOrigin: 'center center',
                        transform: 'scale(1)',
                        transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                        willChange: 'transform',
                      }}
                      decoding="async"
                      onMouseEnter={(e) => {
                        if (window.innerWidth >= 768) {
                          e.currentTarget.style.transform = 'scale(2.25)';
                          e.currentTarget.style.transformOrigin = 'center center';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (window.innerWidth >= 768) {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.transformOrigin = 'center center';
                        }
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/ui/logoCaiden_480w.webp';
                      }}
                    />
                  </picture>
                ) : (
                  <img
                    src={galleryImages[selectedImageIndex].src}
                    alt={galleryImages[selectedImageIndex].alt}
                    width={600}
                    height={600}
                    className="w-full h-auto object-cover mx-auto"
                    loading="eager"
                    style={{
                      transformOrigin: 'center center',
                      transform: 'scale(1)',
                      transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                      willChange: 'transform',
                    }}
                    decoding="async"
                    onMouseEnter={(e) => {
                      if (window.innerWidth >= 768) {
                        e.currentTarget.style.transform = 'scale(2.25)';
                        e.currentTarget.style.transformOrigin = 'center center';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (window.innerWidth >= 768) {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.transformOrigin = 'center center';
                      }
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/ui/logoCaiden_480w.webp';
                    }}
                  />
                )}
              </div>
              
              {/* Thumbnail Gallery - Below main image on both mobile and desktop */}
              <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start overflow-x-auto pb-2 -mx-2 px-2 md:mx-0 md:px-0 md:overflow-visible order-2">
                {galleryImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative rounded-lg overflow-hidden border-2 transition-all duration-200 flex-shrink-0 ${
                      selectedImageIndex === index
                        ? 'border-navy-500 shadow-md scale-105'
                        : 'border-gray-200 hover:border-navy-300 opacity-70 hover:opacity-100'
                    }`}
                    aria-label={`View ${image.alt}`}
                  >
                    <img
                      src={image.thumb ?? image.src}
                      alt={image.alt}
                      width={96}
                      height={96}
                      sizes="96px"
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = image.src;
                      }}
                    />
                  </button>
                ))}
                <Link
                  to="/preview"
                  className="flex-shrink-0 text-navy-500 text-sm font-medium hover:text-navy-600 transition-colors"
                >
                  <div>Inside the Book</div>
                  <div className="text-xs text-navy-400 mt-0.5">Explore sample pages from Caiden's Courage</div>
                </Link>
              </div>
            </div>

            {/* RIGHT COLUMN: Product Info */}
            <div className="order-2 md:order-2">
              {/* Eyebrow */}
              <div className="mb-3 text-left">
                <p className="text-xs sm:text-sm font-semibold text-navy-400 uppercase tracking-[0.2em]">
                  THE GRAPHIC NOVEL — FIRST EDITION
                </p>
              </div>
              
              {/* Title */}
              <h1 className="font-display text-4xl sm:text-4xl lg:text-5xl font-extrabold text-navy-500 mb-4 text-left">
                Caiden's Courage and the Dragon's Nest
              </h1>
              
              {/* Tagline - Secondary */}
              <div className="mb-4 text-left">
                <p className="text-base text-navy-500 font-normal leading-relaxed">
                  When the world feels loud, Caiden learns how to lock in. Pulled into a hidden realm of ancient guardians and powerful forces, he must face the noise in his mind and discover what makes him different is also what makes him brave. Originally created as a 54-page story, now expanded into a 120-page hardcover graphic novel.
                </p>
              </div>

              {/* Metadata Pills - Smaller, Softer */}
              <div className="flex flex-wrap gap-2 mb-8 justify-start">
                <span className="px-3 py-1.5 bg-gray-50 text-navy-600 rounded-full text-xs font-medium border border-gray-200">
                  Ages 7–12
                </span>
                <span className="px-3 py-1.5 bg-gray-50 text-navy-600 rounded-full text-xs font-medium border border-gray-200">
                  Full-Color Graphic Novel
                </span>
                <span className="px-3 py-1.5 bg-gray-50 text-navy-600 rounded-full text-xs font-medium border border-gray-200">
                  120 Pages
                </span>
                <span className="px-3 py-1.5 bg-gray-50 text-navy-600 rounded-full text-xs font-medium border border-gray-200">
                  Print & Digital Friendly
                </span>
              </div>

              {/* Pricing Blocks - Stacked */}
              <div className="flex flex-col gap-4 mb-6">
                {/* Block 1: Founder's Edition - Sold Out */}
                <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-4 sm:p-5 opacity-75">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                    <h3 className="font-display font-bold text-navy-500 text-lg">Founder's Edition</h3>
                    <span className="text-navy-400">
                      <span className="line-through">$24</span>
                      <span className="ml-2 text-sm font-medium text-navy-500">Sold Out</span>
                    </span>
                  </div>
                  <p className="text-sm text-navy-600 leading-relaxed">
                    Early supporters locked in the first print of Caiden's Courage. All Founder copies will receive the upgraded hardcover edition.
                  </p>
                </div>

                {/* Block 2: Hardcover + Companion Workbook - Primary */}
                <div className="rounded-2xl border-2 border-navy-200 bg-white p-4 sm:p-5 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                    <h3 className="font-display font-bold text-navy-500 text-lg">Hardcover + Companion Workbook</h3>
                    <span className="font-bold text-navy-600 text-xl">$50</span>
                  </div>
                  <ul className="space-y-1.5 mb-3 text-sm text-navy-600">
                    <li className="flex items-start">
                      <span className="text-navy-400/60 mr-2 mt-0.5 flex-shrink-0">•</span>
                      120-page hardcover graphic novel
                    </li>
                    <li className="flex items-start">
                      <span className="text-navy-400/60 mr-2 mt-0.5 flex-shrink-0">•</span>
                      Courage Companion activity workbook
                    </li>
                    <li className="flex items-start">
                      <span className="text-navy-400/60 mr-2 mt-0.5 flex-shrink-0">•</span>
                      <span className="font-semibold">Signed first edition copy (limited)</span>
                    </li>
                  </ul>
                  <p className="text-xs text-navy-400 mb-4">Limited first print run</p>
                  <button
                    type="button"
                    onClick={() => productLinks.hardcoverBundle && openExternalUrl(productLinks.hardcoverBundle)}
                    className="w-full md:w-auto inline-flex items-center justify-center rounded-full border-2 border-transparent px-7 py-4 text-[16px] font-semibold text-navy-600 shadow-[0_10px_24px_rgba(245,210,107,0.35)] transition hover:-translate-y-[1px] hover:shadow-[0_16px_34px_rgba(245,210,107,0.45)] active:translate-y-0 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2"
                    style={{ backgroundColor: '#F2D06B' }}
                  >
                    Pre-order Hardcover Bundle
                  </button>
                </div>

                {/* Block 3: Paperback Edition */}
                <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                    <h3 className="font-display font-bold text-navy-500 text-lg">Paperback Edition</h3>
                    <span className="font-bold text-navy-600 text-xl">$30</span>
                  </div>
                  <ul className="space-y-1.5 mb-4 text-sm text-navy-600">
                    <li className="flex items-start">
                      <span className="text-navy-400/60 mr-2 mt-0.5 flex-shrink-0">•</span>
                      120-page full-color paperback
                    </li>
                    <li className="flex items-start">
                      <span className="text-navy-400/60 mr-2 mt-0.5 flex-shrink-0">•</span>
                      Perfect for young readers & classrooms
                    </li>
                  </ul>
                  <button
                    type="button"
                    onClick={() => productLinks.paperback && openExternalUrl(productLinks.paperback)}
                    className="w-full md:w-auto inline-flex items-center justify-center rounded-full border-2 border-navy-500 bg-transparent px-7 py-4 text-[16px] font-semibold text-navy-600 transition hover:bg-navy-50 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-300 focus-visible:ring-offset-2"
                  >
                    Pre-order Paperback
                  </button>
                </div>

                {/* Digital - Secondary */}
                <button
                  type="button"
                  onClick={handleDigitalClick}
                  aria-describedby="digital-download-notice"
                  className="w-full md:w-auto inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-6 py-3 text-[15px] font-medium text-navy-600 transition hover:bg-gray-50 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-300 focus-visible:ring-offset-2"
                >
                  Download Digital Edition
                </button>
              </div>

              {/* Trust Line */}
              <p className="text-xs text-navy-400 mb-6">
                First print copies are part of the official launch edition of Caiden's Courage.
              </p>
              <GlobalNotification
                show={showDigitalNotice}
                title="Digital edition coming soon"
                message="Digital downloads aren't available for pre-order yet — please grab your physical copy while supplies last."
                tone="info"
                durationMs={4000}
                autoClose
                onClose={() => setShowDigitalNotice(false)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: This Story Helps With - NOW THE ONLY STORY SECTION */}
      <section className="py-16 sm:py-24 bg-cream relative overflow-hidden">
        {/* 3D Animated Bubbles - Organic placement near content */}
        <div className="absolute rounded-full pointer-events-none animate-float opacity-100" style={{ 
          top: '12%',
          left: '12%',
          width: '22px',
          height: '22px',
          background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), #f97316, #ea580c)',
          boxShadow: '0 8px 16px rgba(249, 115, 22, 0.4), inset -3px -3px 8px rgba(0,0,0,0.2), inset 3px 3px 8px rgba(255,255,255,0.3)',
          animationDelay: '0s'
        }}></div>
        <div className="absolute rounded-full pointer-events-none animate-float opacity-100" style={{ 
          top: '28%',
          right: '18%',
          width: '26px',
          height: '26px',
          background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), #3b82f6, #2563eb)',
          boxShadow: '0 8px 16px rgba(59, 130, 246, 0.4), inset -3px -3px 8px rgba(0,0,0,0.2), inset 3px 3px 8px rgba(255,255,255,0.3)',
          animationDelay: '1.5s'
        }}></div>
        <div className="absolute rounded-full pointer-events-none animate-float opacity-100" style={{ 
          bottom: '20%',
          left: '15%',
          width: '20px',
          height: '20px',
          background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5), #facc15, #eab308)',
          boxShadow: '0 8px 16px rgba(250, 204, 21, 0.4), inset -3px -3px 8px rgba(0,0,0,0.2), inset 3px 3px 8px rgba(255,255,255,0.3)',
          animationDelay: '3s'
        }}></div>
        <div className="absolute rounded-full pointer-events-none animate-float opacity-100" style={{ 
          top: '52%',
          right: '14%',
          width: '18px',
          height: '18px',
          background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), #a855f7, #9333ea)',
          boxShadow: '0 8px 16px rgba(168, 85, 247, 0.4), inset -3px -3px 8px rgba(0,0,0,0.2), inset 3px 3px 8px rgba(255,255,255,0.3)',
          animationDelay: '2s'
        }}></div>
        <div className="absolute rounded-full pointer-events-none animate-float opacity-100" style={{ 
          bottom: '16%',
          right: '20%',
          width: '24px',
          height: '24px',
          background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), #f97316, #ea580c)',
          boxShadow: '0 8px 16px rgba(249, 115, 22, 0.4), inset -3px -3px 8px rgba(0,0,0,0.2), inset 3px 3px 8px rgba(255,255,255,0.3)',
          animationDelay: '4s'
        }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Eyebrow - Small, uppercase, letter-spaced, muted color */}
          <div className="text-center mb-3">
            <p className="text-xs sm:text-sm font-semibold text-navy-400 uppercase tracking-[0.2em]">
              A STORY FOR KIDS WHO THINK DIFFERENTLY
            </p>
          </div>

          {/* Main Headline */}
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-500 mb-8 text-center">
            This Story Helps With…
          </h2>

          {/* Toggle */}
          <div className="flex justify-center mb-8 md:mb-12 overflow-x-auto">
            <div className="pill-toggle is-scroll">
              <button
                onClick={() => setHelpView('kids')}
                className="pill"
                data-persona="kids"
                data-selected={helpView === 'kids'}
              >
                For Kids
              </button>
              <button
                onClick={() => setHelpView('parents')}
                className="pill"
                data-persona="parents"
                data-selected={helpView === 'parents'}
              >
                For Parents
              </button>
              <button
                onClick={() => setHelpView('teachers')}
                className="pill"
                data-persona="teachers"
                data-selected={helpView === 'teachers'}
              >
                For Teachers
              </button>
            </div>
          </div>

          {/* Content Layout: Desktop - Image Left, Content Right | Mobile - Stack (toggle -> image -> bullets) */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
            {/* Image - Mobile: Below toggle, Desktop: Left */}
            <div className="order-1 md:order-1 flex justify-center">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <img
                  src="/images/Caiden'sCourage_SocialImage_smaller.webp"
                  alt="Caiden from Caiden's Courage"
                  className="w-full h-auto object-cover"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/ui/logoCaiden_480w.webp';
                  }}
                />
              </div>
            </div>

            {/* Content - Mobile: Below image, Desktop: Right */}
            <div className="order-2 md:order-2">
              {/* FOR KIDS Content (Blue) */}
              {helpView === 'kids' && (
                <div className="space-y-4 text-left">
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-navy-500 mb-4 text-left">
                    What Kids Learn From This Story
                  </h3>
                  <ul className="list-none space-y-3">
                    <li>
                      <span className="inline-block px-4 py-2 rounded-full bg-brand-blue-100 text-brand-blue-700 text-base font-medium border border-brand-blue-300">
                        Understanding big feelings
                      </span>
                    </li>
                    <li>
                      <span className="inline-block px-4 py-2 rounded-full bg-brand-blue-100 text-brand-blue-700 text-base font-medium border border-brand-blue-300">
                        How my brain works
                      </span>
                    </li>
                    <li>
                      <span className="inline-block px-4 py-2 rounded-full bg-brand-blue-100 text-brand-blue-700 text-base font-medium border border-brand-blue-300">
                        Finding focus my way
                      </span>
                    </li>
                    <li>
                      <span className="inline-block px-4 py-2 rounded-full bg-brand-blue-100 text-brand-blue-700 text-base font-medium border border-brand-blue-300">
                        Believing in myself
                      </span>
                    </li>
                    <li>
                      <span className="inline-block px-4 py-2 rounded-full bg-brand-blue-100 text-brand-blue-700 text-base font-medium border border-brand-blue-300">
                        Being brave when things feel hard
                      </span>
                    </li>
                  </ul>
                </div>
              )}

              {/* FOR PARENTS Content (Purple) */}
              {helpView === 'parents' && (
                <div className="space-y-4 text-left">
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-navy-500 mb-4 text-left">
                    What Kids Learn From This Story
                  </h3>
                  <ul className="list-none space-y-3">
                    <li>
                      <span className="inline-block px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-base font-medium border border-purple-200">
                        Emotional awareness and self-regulation
                      </span>
                    </li>
                    <li>
                      <span className="inline-block px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-base font-medium border border-purple-200">
                        Confidence for children with ADHD
                      </span>
                    </li>
                    <li>
                      <span className="inline-block px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-base font-medium border border-purple-200">
                        Positive representation of neurodiversity
                      </span>
                    </li>
                    <li>
                      <span className="inline-block px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-base font-medium border border-purple-200">
                        Language to talk about focus and overwhelm
                      </span>
                    </li>
                    <li>
                      <span className="inline-block px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-base font-medium border border-purple-200">
                        A story kids actually want to read
                      </span>
                    </li>
                  </ul>
                </div>
              )}

              {/* FOR TEACHERS Content (Orange) */}
              {helpView === 'teachers' && (
                <div className="space-y-4 text-left">
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-navy-500 mb-4 text-left">
                    How This Book Supports Learning
                  </h3>
                  <ul className="list-none space-y-3">
                    <li>
                      <span className="inline-block px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-base font-medium border border-orange-200">
                        Social-emotional learning (SEL) support
                      </span>
                    </li>
                    <li>
                      <span className="inline-block px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-base font-medium border border-orange-200">
                        Classroom discussion starter
                      </span>
                    </li>
                    <li>
                      <span className="inline-block px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-base font-medium border border-orange-200">
                        Neurodiversity-affirming content
                      </span>
                    </li>
                    <li>
                      <span className="inline-block px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-base font-medium border border-orange-200">
                        Suitable for grades 2–6
                      </span>
                    </li>
                    <li>
                      <span className="inline-block px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-base font-medium border border-orange-200">
                        Works for independent or group reading
                      </span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: What's Inside */}
      <section className="py-12 sm:py-20 bg-cream relative overflow-hidden">
        {/* 3D Animated Bubbles - Organic placement near content */}
        <div className="absolute rounded-full pointer-events-none animate-float opacity-100" style={{ 
          top: '18%',
          right: '20%',
          width: '24px',
          height: '24px',
          background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), #facc15, #eab308)',
          boxShadow: '0 8px 16px rgba(250, 204, 21, 0.4), inset -3px -3px 8px rgba(0,0,0,0.2), inset 3px 3px 8px rgba(255,255,255,0.3)',
          animationDelay: '0.5s'
        }}></div>
        <div className="absolute rounded-full pointer-events-none animate-float opacity-100" style={{ 
          bottom: '22%',
          left: '22%',
          width: '20px',
          height: '20px',
          background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), #3b82f6, #2563eb)',
          boxShadow: '0 8px 16px rgba(59, 130, 246, 0.4), inset -3px -3px 8px rgba(0,0,0,0.2), inset 3px 3px 8px rgba(255,255,255,0.3)',
          animationDelay: '2.5s'
        }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Eyebrow */}
          <div className="text-center mb-3">
            <p className="text-xs sm:text-sm font-semibold text-navy-400 uppercase tracking-[0.2em]">
              WHAT YOU'LL FIND INSIDE
            </p>
          </div>

          {/* Main Headline */}
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-500 mb-2 text-center">
            What's Inside the Book
          </h2>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-navy-400 text-center mb-10 sm:mb-12">
            A quick peek at what kids will experience.
          </p>

          {/* Feature Cards Grid - 2x2 on desktop, stack on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <InsideCard
              title="A Big Adventure"
              bullets={[
                "Full-color graphic novel (30+ pages)",
                "Fantasy, friendship, and courage",
                "A story kids actually want to finish"
              ]}
              iconType="adventure"
              helpView={helpView}
            />
            <InsideCard
              title="Big Feelings, Explained"
              bullets={[
                "Emotions kids recognize",
                "Language for focus and overwhelm",
                "Gentle moments that help kids feel seen"
              ]}
              iconType="feelings"
              helpView={helpView}
            />
            <InsideCard
              title="Built for Confidence"
              bullets={[
                "Celebrates neurodiverse minds",
                "Shows strength in being different",
                "Encourages kids to trust how they work"
              ]}
              iconType="confidence"
              helpView={helpView}
            />
            <InsideCard
              title="Read It Anywhere"
              bullets={[
                "Great for home reading",
                "Perfect for classrooms",
                "Works solo or together"
              ]}
              iconType="read"
              helpView={helpView}
            />
          </div>
        </div>
      </section>

      {/* Section 4: Reviews */}
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

          {/* CTA Block */}
          <div className="mt-10 sm:mt-12 mb-8 sm:mb-10">
            <h3 className="font-display text-xl sm:text-2xl font-semibold text-navy-500 mb-3 text-center">
              Want to share your experience?
            </h3>
            <p className="text-sm sm:text-base text-navy-400 text-center mb-6 max-w-2xl mx-auto">
              Parents, caregivers, and educators — your words help other families discover Caiden's Courage.
            </p>
            
            {/* Prompt Container */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm max-w-2xl mx-auto mb-6">
              <ul className="space-y-3 text-navy-600 text-sm sm:text-base leading-relaxed">
            <li className="flex items-start">
                  <span className="text-navy-400/60 mr-3 mt-0.5 flex-shrink-0">•</span>
                  <span>What moment made your child or student feel seen or understood?</span>
            </li>
            <li className="flex items-start">
                  <span className="text-navy-400/60 mr-3 mt-0.5 flex-shrink-0">•</span>
                  <span>Did this story open up new conversations about feelings or focus?</span>
            </li>
            <li className="flex items-start">
                  <span className="text-navy-400/60 mr-3 mt-0.5 flex-shrink-0">•</span>
                  <span>How did it inspire creativity or confidence?</span>
            </li>
            <li className="flex items-start">
                  <span className="text-navy-400/60 mr-3 mt-0.5 flex-shrink-0">•</span>
                  <span>Where do you imagine this being used most? (home, classroom, library, etc.)</span>
            </li>
            <li className="flex items-start">
                  <span className="text-navy-400/60 mr-3 mt-0.5 flex-shrink-0">•</span>
                  <span>Who would you recommend this for?</span>
            </li>
          </ul>
        </div>

            {/* Primary Email CTA Block */}
            <div className="max-w-2xl mx-auto">
              <a 
                href="mailto:hello@caidenscourage.com"
                className="flex items-center justify-center gap-3 bg-white/80 rounded-full px-6 py-4 sm:px-8 sm:py-5 shadow-sm hover:shadow-md transition-all duration-200 group"
              >
                {/* Envelope Icon */}
                <svg 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="w-5 h-5 sm:w-6 sm:h-6 text-navy-500 group-hover:text-navy-600 transition-colors"
                >
                  <path 
                    d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <path 
                    d="M22 6L12 13L2 6" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-navy-600 font-medium text-lg sm:text-xl group-hover:text-navy-700 transition-colors">
                  hello@caidenscourage.com
                </span>
              </a>
              <p className="text-navy-400 text-xs sm:text-sm mt-3 text-center">
                Short notes are perfect — even one sentence helps.
              </p>
            </div>
            </div>

          {/* Soft Divider */}
          <div className="mt-12 sm:mt-16 mb-8 sm:mb-10">
            <div className="h-px bg-navy-200/40 max-w-2xl mx-auto"></div>
          </div>
        </div>
      </section>

      {/* Section 5: Related Items */}
      <section className="py-16 sm:py-24 bg-white relative overflow-hidden">
        {/* 3D Animated Bubbles - Organic placement near content */}
        <div className="absolute rounded-full pointer-events-none animate-float opacity-100" style={{ 
          top: '22%',
          left: '16%',
          width: '24px',
          height: '24px',
          background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), #a855f7, #9333ea)',
          boxShadow: '0 8px 16px rgba(168, 85, 247, 0.4), inset -3px -3px 8px rgba(0,0,0,0.2), inset 3px 3px 8px rgba(255,255,255,0.3)',
          animationDelay: '0.5s'
        }}></div>
        <div className="absolute rounded-full pointer-events-none animate-float opacity-100" style={{ 
          bottom: '26%',
          right: '18%',
          width: '20px',
          height: '20px',
          background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), #f97316, #ea580c)',
          boxShadow: '0 8px 16px rgba(249, 115, 22, 0.4), inset -3px -3px 8px rgba(0,0,0,0.2), inset 3px 3px 8px rgba(255,255,255,0.3)',
          animationDelay: '2.5s'
        }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-500 mb-2 text-center">
            You May Also Like
          </h2>
          <p className="text-sm sm:text-base text-navy-400/75 text-center mb-10 sm:mb-12">
            Free activities and resources to keep the story going.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Caiden Coloring Pages */}
            <Link
              to="/braveminds?type=coloring&audience=kids"
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-navy-100 flex flex-col focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2"
            >
              <div className="aspect-square bg-navy-100 relative overflow-hidden">
                <img
                  src="/images/coloringpage_Caiden.jpg"
                  alt="Caiden Coloring Pages"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/ui/logoCaiden_480w.webp';
                  }}
                />
              </div>
              <div className="px-5 pt-5 pb-6 flex flex-col flex-grow min-h-[140px]">
                <h3 className="font-display font-bold text-lg text-navy-500 mb-3 line-clamp-2">
                  Caiden Coloring Pages
                </h3>
                <span className="mt-auto px-4 py-2.5 bg-navy-500 text-white rounded-full font-semibold text-sm text-center min-h-[44px] flex items-center justify-center">
                  Explore
                </span>
              </div>
            </Link>

            {/* Caiden Desktop Wallpaper */}
            <Link
              to="/braveminds?type=wallpaper&audience=kids"
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-navy-100 flex flex-col focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2"
            >
              <div className="aspect-square bg-navy-100 relative overflow-hidden">
                <img
                  src="/images/CoolCaiden_header.webp"
                  alt="Caiden Desktop Wallpaper"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/ui/logoCaiden_480w.webp';
                  }}
                />
              </div>
              <div className="px-5 pt-5 pb-6 flex flex-col flex-grow min-h-[140px]">
                <h3 className="font-display font-bold text-lg text-navy-500 mb-3 line-clamp-2">
                  Caiden Desktop Wallpaper
                </h3>
                <span className="mt-auto px-4 py-2.5 bg-navy-500 text-white rounded-full font-semibold text-sm text-center min-h-[44px] flex items-center justify-center">
                  Explore
                </span>
              </div>
            </Link>

            {/* Emotional Awareness Worksheet */}
            <Link
              to="/braveminds?type=worksheet&audience=teachers"
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-navy-100 flex flex-col focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2"
            >
              <div className="aspect-square bg-navy-100 relative overflow-hidden">
                <img
                  src="/images/SELThubmails.webp"
                  alt="Emotional Awareness Worksheet"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/ui/logoCaiden_480w.webp';
                  }}
                />
              </div>
              <div className="px-5 pt-5 pb-6 flex flex-col flex-grow min-h-[140px]">
                <h3 className="font-display font-bold text-lg text-navy-500 mb-3 line-clamp-2">
                  Emotional Awareness Worksheet
                </h3>
                <span className="mt-auto px-4 py-2.5 bg-navy-500 text-white rounded-full font-semibold text-sm text-center min-h-[44px] flex items-center justify-center">
                  Explore
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
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
              loading="lazy"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Product;

