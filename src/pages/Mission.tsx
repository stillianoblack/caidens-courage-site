import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWaitlistUrl, openExternalUrl } from '../config/externalLinks';
import Button from '../components/ui/Button';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Reusable Mission Split Section Component
interface MissionSplitSectionProps {
  eyebrow?: string;
  title: string;
  highlightWord: string;
  body: string | React.ReactNode;
  bullets?: string[];
  cta?: {
    text: string;
    link: string;
    variant?: 'primary' | 'secondary';
  };
  imageSrc: string;
  imageAlt: string;
  imageSide: 'left' | 'right';
}

const MissionSplitSection: React.FC<MissionSplitSectionProps> = ({
  eyebrow,
  title,
  highlightWord,
  body,
  bullets,
  cta,
  imageSrc,
  imageAlt,
  imageSide,
}) => {
  const titleParts = title.split(highlightWord);
  const dotPosition = imageSide === 'left' ? 'left' : 'right';
  const pillLabel = eyebrow ?? `${title}:`;

  return (
    <div className="why-world-block mb-16 sm:mb-20 lg:mb-32 overflow-hidden md:overflow-visible w-full md:w-auto">
      <div className="w-full max-w-full md:max-w-6xl mx-auto pl-5 pr-5 sm:pl-6 sm:pr-6 box-border overflow-x-hidden">
        {/* Mobile: vertical stack — image on top, then content card (reference layout) */}
        <div className="mission-block-stack flex flex-col lg:grid lg:grid-cols-12 items-stretch gap-0 lg:gap-x-12 lg:gap-y-0 relative w-full min-w-0 max-w-full">
          {/* Accent Dot — desktop only */}
          <div className={`why-world-block__dot why-world-block__dot--${dotPosition} hidden lg:block`} aria-hidden="true"></div>

          {/* Image — mobile: full-width top; desktop: grid column */}
          <div
            className={`w-full min-w-0 overflow-hidden order-1 lg:col-span-6 flex justify-center ${imageSide === 'left' ? 'lg:order-1 lg:justify-start' : 'lg:order-2 lg:justify-end'}`}
          >
            <div
              className="min-w-0 w-full max-w-full overflow-hidden rounded-[2.5rem] aspect-[2/3] md:aspect-[4/3] md:rounded-[16%] md:box-border md:border-[6px] md:border-[#E9C46A] lg:aspect-square lg:rounded-full lg:max-w-[520px] lg:w-[40vw]"
            >
              <div className="h-full w-full p-0">
                <img
                  src={imageSrc}
                  alt={imageAlt}
                  className="block w-full max-w-full h-full object-cover object-top rounded-[2.5rem] md:rounded-none lg:rounded-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/Caiden@4x-100.jpeg';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Content — mobile: light card below image; desktop: grid column */}
          <div
            className={`order-2 lg:col-span-6 min-w-0 max-w-full flex flex-col text-left ${imageSide === 'left' ? 'lg:order-2' : 'lg:order-1'}`}
            style={{ maxWidth: 'min(100%, 560px)' }}
          >
            <div className="mission-block-card bg-[#F8F8F8] rounded-b-2xl lg:rounded-2xl lg:bg-transparent lg:rounded-none pt-0 pb-8 px-6 lg:pt-0 lg:pb-0 lg:px-0">
              {/* Pill label (reference: "Our Mission:" style) — block to avoid inline line-height gap */}
              <span
                className="block w-fit text-sm font-medium text-navy-700 bg-[#F7DF79] px-4 py-1.5 rounded-full mb-5"
                aria-hidden="true"
              >
                {pillLabel}
              </span>
              <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-navy-500 mb-4 sm:mb-6 break-words">
                {titleParts[0]}
                <span className="text-golden-500">{highlightWord}</span>
                {titleParts[1]}
              </h3>
              <div className="text-navy-600 text-base sm:text-lg leading-relaxed space-y-4 break-words max-w-full text-left">
                {typeof body === 'string' ? <p>{body}</p> : body}
              </div>
              {bullets && bullets.length > 0 && (
                <ul className="mt-6 space-y-2 text-navy-600 text-base sm:text-lg break-words max-w-full">
                  {bullets.map((bullet, index) => (
                    <li key={index} className="flex items-start min-w-0">
                      <span className="text-navy-700 mr-2 flex-shrink-0">•</span>
                      <span className="min-w-0 break-words">{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
              {cta && (
                <div className="mt-8">
                  <Link
                    to={cta.link}
                    className={`inline-block px-8 py-3.5 font-semibold rounded-full hover:shadow-lg transition-all duration-300 text-navy-700 ${
                      cta.variant === 'primary'
                        ? 'bg-[#F7DF79] hover:bg-[#F0D66B]'
                        : 'bg-transparent border-2 border-golden-500 text-golden-500 hover:bg-golden-500 hover:text-navy-500'
                    }`}
                  >
                    {cta.text}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Mission: React.FC = () => {
  const [isPreorderOpen, setIsPreorderOpen] = useState(false);
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Set page title
  useEffect(() => {
    document.title = "Our Mission | Caiden's Courage";
    
    // Check if mobile on mount and resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleWaitlistClick = () => {
    const waitlistUrl = getWaitlistUrl();
    if (waitlistUrl) return openExternalUrl(waitlistUrl);
    setIsPreorderOpen(true);
  };

  const handleComingSoonClick = () => {
    setIsComingSoonModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-cream font-body">
      <Header onComingSoonClick={handleComingSoonClick} />

      {/* Cinematic Hero Section */}
      <header 
        className="relative overflow-hidden"
        style={{
          paddingTop: isMobile ? '70px' : 'clamp(67px, 10vh, 112px)',
          paddingBottom: isMobile ? '40px' : '160px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          minHeight: isMobile ? '100vh' : '92vh',
          backgroundImage: isMobile 
            ? `linear-gradient(
                180deg,
                rgba(8, 18, 38, 0.92) 0%,
                rgba(8, 18, 38, 0.85) 30%,
                rgba(8, 18, 38, 0.65) 50%,
                rgba(8, 18, 38, 0.35) 70%,
                rgba(8, 18, 38, 0.15) 85%,
                rgba(8, 18, 38, 0) 100%
              ),
              url('/background_ourstory_mobile_img.jpg')`
            : `linear-gradient(
                90deg,
                rgba(8, 15, 35, 0.72) 0%,
                rgba(8, 15, 35, 0.55) 35%,
                rgba(8, 15, 35, 0.25) 60%,
                rgba(8, 15, 35, 0.08) 80%,
                rgba(8, 15, 35, 0) 100%
              ),
              url(/background_ourstory_img.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: isMobile ? 'center bottom' : '70% center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Content - Aligned to Global Grid */}
        <div 
          className="w-full" 
          style={{ 
            position: 'relative',
            paddingTop: '0',
            marginTop: '0',
            paddingLeft: isMobile ? '20px' : '0',
            paddingRight: isMobile ? '20px' : '0',
            maxWidth: isMobile ? '100%' : '1200px',
            marginLeft: isMobile ? '0' : 'auto',
            marginRight: isMobile ? '0' : 'auto',
            zIndex: 10
          }}
        >
          <div 
            className="text-left w-full" 
            style={{ 
              maxWidth: isMobile ? '100%' : '540px',
              paddingTop: '50px',
              marginTop: '0',
              paddingLeft: '0',
              paddingRight: '0'
            }}
          >
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
              Our Story
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
            
            {/* Subtext */}
            <p 
              className="text-white font-medium"
              style={{ 
                fontSize: '22px',
                lineHeight: '1.4',
                marginBottom: '32px',
                opacity: 0.92
              }}
            >
              Caiden's Courage was created to help kids see their differences as strengths — and discover the courage already inside them.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="primary"
                size="md"
                as={Link}
                to="/comicbook"
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
                Enter Caiden's World
              </Button>
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
              fill="#faf9f7"
            />
          </svg>
        </div>
      </header>

      {/* Spacing after hero */}
      <div className="h-20 sm:h-24 lg:h-28 bg-cream" />

      {/* Main Content */}
      <main className="pb-12 sm:pb-16 lg:pb-20" style={{ 
        paddingTop: 'calc(3rem - 60px)',
        marginTop: '-60px'
      }}>
        {/* Origin Section — "Why This World Was Created" (reference: light bg, pill labels, rounded image) */}
        <section className="why-world-blocks overflow-x-hidden bg-[#F8F8F8] lg:bg-transparent py-10 lg:py-0">
          <div className="max-w-7xl mx-auto pl-5 pr-5 sm:pl-6 sm:pr-6 lg:pl-8 lg:pr-8 w-full overflow-x-hidden box-border">
            {/* Section Header */}
            <div className="mb-12 sm:mb-16 lg:mb-20 text-center">
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-navy-500 mb-4 sm:mb-6">
                Why This World Was Created
              </h2>
              <p className="text-lg sm:text-xl text-navy-600/80 font-medium max-w-3xl mx-auto why-world-subheader">
                Every child deserves to see their mind as powerful — especially the ones who feel different.
              </p>
            </div>

            {/* Block A: Our History */}
            <MissionSplitSection
              title="Our History"
              highlightWord="History"
              body={
                <>
                  <p>
                    Caiden's Courage was created to help kids understand their emotions, celebrate neurodiversity, and discover the superhero that already lives inside them. Through stories, characters, and imaginative learning tools, we empower children to feel seen, confident, and brave in their everyday world.
                  </p>
                  <p>
                    This isn't about fixing kids. It's about helping them recognize their strengths. When kids understand themselves, confidence follows.
                  </p>
                </>
              }
              bullets={[
                'Created to celebrate neurodiversity as strength',
                'Built with emotional intelligence at the core',
                'Designed to help kids feel seen and powerful'
              ]}
              imageSrc="/ourhistory_img.png"
              imageAlt="Our History - The origin story of Caiden's Courage"
              imageSide="right"
            />

            {/* Block B: Our Promise */}
            <MissionSplitSection
              title="Our Promise"
              highlightWord="Promise"
              body={
                <>
                  <p>
                    We promise to create stories, tools, and experiences that help every child see their differences as strengths. We're committed to building a world where neurodiversity is celebrated, emotional intelligence is nurtured, and courage is discovered through understanding.
                  </p>
                  <p>
                    Our promise extends to parents, educators, and partners who share our vision of empowering kids to feel confident, capable, and never alone in their journey.
                  </p>
                </>
              }
              cta={{
                text: 'Partner With Us',
                link: '/contact',
                variant: 'primary'
              }}
              imageSrc="/OurPromise_img.png"
              imageAlt="Our Promise - Children engaging with Caiden's Courage tools and activities"
              imageSide="left"
            />
          </div>
        </section>

        {/* Section Separator */}
        <div className="border-t border-navy-200 my-20 sm:my-24 lg:my-28"></div>

        {/* Premium Meet the Creator Section - Cinematic Hero Style */}
        <section 
          className="creator-section"
          style={{
            backgroundImage: 'url(/meetthecreator_bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Darkened Blue Tint Overlay - Matching Hero */}
          <div className="creator-overlay"></div>
          
          {/* Content Container */}
          <div className="creator-content">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
                {/* LEFT: Creator Portrait with Organic Blob Mask */}
                <div className="creator-portrait-wrapper">
                  <div className="creator-portrait-glow"></div>
                  <div className="creator-portrait-blob">
                    <img 
                      src="/creator-photo.png" 
                      alt="Tarus D. Stills - Creator of Caiden's Courage"
                      className="creator-portrait-image"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/logoCaiden.png';
                      }}
                    />
                  </div>
                </div>
                
                {/* RIGHT: Creator Content */}
                <div className="creator-text-content">
                  <span className="creator-eyebrow">
                    MEET THE CREATOR
                  </span>
                  <h2 className="creator-title">
                    Tarus D. Stills
                  </h2>
                  <div className="creator-copy">
                    <p>
                      Tarus D. Stills is an illustrator, filmmaker, writer, and creative entrepreneur whose work is rooted in creativity, imagination, and the power of neurodivergent thinking. With a background in visual design and years of experience spanning illustration, storytelling, and digital media, he creates worlds that invite children to see themselves with confidence and possibility.
                    </p>
                    <p>
                      Inspired by his own creative journey and a deep belief in art as a tool for focus, expression, and emotional growth, Tarus created <em>Caiden's Courage</em> to celebrate kids who think differently and imagine boldly. His work blends expressive illustration with heartfelt storytelling, encouraging young readers to recognize their minds as strengths rather than limitations.
                    </p>
                    <p>
                      Beyond the page, Tarus is a passionate advocate for creative education and representation. Through his stories, he hopes to remind every child that what makes them different may also be what makes them extraordinary.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Separator */}
        <div className="border-t border-navy-200 my-20 sm:my-24 lg:my-28"></div>

        {/* What Makes This World Different Section */}
        <section className="world-different-section mb-20 sm:mb-24 lg:mb-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-navy-500 mb-6 text-center">
              A World Built for Courage
            </h2>
            
            <p className="world-different-subheader">
              We don't just tell stories — we help children discover the strength already inside them.
            </p>
            
            <p className="world-different-positioning">
              Trusted by parents. Embraced by educators. Loved by young readers.
            </p>
            
            {/* The Four Pillars of the Caiden's Courage World */}
            <div className="world-different-grid">
              <div className="world-different-card">
                <div className="world-different-blob">
                  <img 
                    src="/Emotionallearningthroughstory_img.png" 
                    alt="Emotional learning through story"
                    className="world-different-blob-image"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/logoCaiden.png';
                    }}
                  />
                </div>
                <div className="world-different-card-content">
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-navy-500 mb-3">
                    Emotional learning through story
                  </h3>
                  <p className="text-navy-600 leading-relaxed text-base">
                    Kids learn to understand and name their feelings through character-driven adventures, not lectures.
                  </p>
                </div>
              </div>
              
              <div className="world-different-card">
                <div className="world-different-blob">
                  <img 
                    src="/Neurodiversity-positiveheroes_img.png" 
                    alt="Neurodiversity-positive heroes"
                    className="world-different-blob-image"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/logoCaiden.png';
                    }}
                  />
                </div>
                <div className="world-different-card-content">
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-navy-500 mb-3">
                    Neurodiversity-positive heroes
                  </h3>
                  <p className="text-navy-600 leading-relaxed text-base">
                    Characters like Caiden show that differences are sources of strength, creativity, and unique power.
                  </p>
                </div>
              </div>
              
              <div className="world-different-card">
                <div className="world-different-blob">
                  <img 
                    src="/Character-drivengrowth_img.png" 
                    alt="Character-driven growth"
                    className="world-different-blob-image"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/logoCaiden.png';
                    }}
                  />
                </div>
                <div className="world-different-card-content">
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-navy-500 mb-3">
                    Character-driven growth
                  </h3>
                  <p className="text-navy-600 leading-relaxed text-base">
                    Every story centers on real emotional challenges kids face, with heroes who grow through courage and self-awareness.
                  </p>
                </div>
              </div>
              
              <div className="world-different-card">
                <div className="world-different-blob">
                  <img 
                    src="/Toolsthatsupportkidsbeyondthepage_img.png" 
                    alt="Tools that support kids beyond the page"
                    className="world-different-blob-image"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/logoCaiden.png';
                    }}
                  />
                </div>
                <div className="world-different-card-content">
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-navy-500 mb-3">
                    Tools that support kids beyond the page
                  </h3>
                  <p className="text-navy-600 leading-relaxed text-base">
                    Interactive B-4 tools, printable resources, and classroom guides extend the story into real-world practice.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Separator */}
        <div className="border-t border-navy-200 my-20 sm:my-24 lg:my-28"></div>

        {/* Expansion Section */}
        <section className="world-beginning-section mb-16 sm:mb-20 lg:mb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="world-beginning-grid">
              {/* Left Column: Text Content */}
              <div className="world-beginning-content">
                <div className="world-beginning-header-group">
                  <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-navy-500">
                    The World Is Just Beginning…
                  </h2>
                  <p className="world-beginning-subheader">
                    Caiden's Courage is more than a single story. It's a growing world that includes:
                  </p>
                </div>
                <div className="world-beginning-text">
                  <ul className="world-beginning-list">
                    <li>graphic novels</li>
                    <li>characters and companions</li>
                    <li>future learning tools</li>
                    <li>digital experiences (coming later), including interactive storytelling and streaming/animated content</li>
                  </ul>
                  <p>
                    We're building this slowly and intentionally — alongside the families and kids who believe in it.
                  </p>
                </div>
              </div>
              
              {/* Right Column: Bloop Image */}
              <div className="world-beginning-image">
                <div className="world-beginning-bloop">
                  <img 
                    src="/TheWorldIsJustBeginning_img.jpg" 
                    alt="Caiden's Courage world exploration and discovery"
                    className="world-beginning-bloop-image"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/hero-bg.jpg';
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Separator */}
        <div className="border-t border-navy-200 my-16 sm:my-20 lg:my-24"></div>
      </main>

      {/* Featured Comic Book Section - Blue Backdrop */}
      <section className="bg-navy-500 py-10 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* White Featured Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 lg:p-10 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-start md:gap-10 gap-6">
              {/* Left Side - Circular Image */}
              <div className="flex justify-start md:flex-shrink-0">
                <div 
                  className="rounded-full overflow-hidden border-4 border-blue-500 shadow-sm ring-1 ring-blue-500/15 md:ring-blue-500/10 w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36"
                >
                  <img
                    src="/Comic5_Coverpage_header.png"
                    alt="Caiden's Courage Comic Book"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/logoCaiden.png';
                    }}
                  />
                </div>
              </div>
              
              {/* Right Side - Content */}
              <div className="flex-1 text-left min-w-0">
                {/* NEW Pill */}
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 bg-golden-500 text-navy-500 font-semibold text-xs sm:text-sm rounded-full">
                    NEW
                  </span>
                </div>
                
                {/* Headline */}
                <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-navy-500 mb-3">
                  The Comic Book
                </h3>
                
                {/* Primary Description */}
                <p className="text-base sm:text-lg text-navy-600 leading-relaxed mb-3">
                  Start Volume 1 and follow Caiden's first "Lock In" moment.
                </p>
                
                {/* Sub-paragraph */}
                <p className="text-sm sm:text-base text-navy-500 leading-relaxed mb-6">
                  A story about focus, courage, and learning how your mind works — told through adventure and imagination.
                </p>
                
                {/* CTA Text Link */}
                <Link
                  to="/comicbook"
                  className="inline-flex items-center text-base sm:text-lg font-semibold text-navy-500 hover:text-navy-600 transition-colors group w-fit"
                >
                  <span className="group-hover:underline">View Comic Book</span>
                  <svg 
                    className="w-5 h-5 ml-2 transition-transform duration-200 group-hover:translate-x-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
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
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Mission;

