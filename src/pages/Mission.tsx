import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getWaitlistUrl, openExternalUrl } from '../config/externalLinks';
import { DISABLE_HEROES } from '../config/heroes';
import Button from '../components/ui/Button';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SplitStorySection from '../components/sections/SplitStorySection';

const Mission: React.FC = () => {
  const [isPreorderOpen, setIsPreorderOpen] = useState(false);
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => (typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)').matches : false)
  );

  // Set page title; hero loads with page (no preload — only homepage preloads hero for performance).
  useEffect(() => {
    document.title = "Our Mission | Caiden's Courage";
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const m = window.matchMedia('(max-width: 768px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    m.addEventListener('change', handler);
    return () => m.removeEventListener('change', handler);
  }, []);

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

      {/* Cinematic Hero Section — LCP image as <picture> (WebP), not lazy-loaded */}
      <header
        className="cv-hero relative overflow-hidden"
        style={{
          paddingBottom: isMobile ? '40px' : '160px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          minHeight: isMobile ? '100vh' : '92vh',
        }}
      >
        {/* Hero image layer — or solid when REACT_APP_DISABLE_HEROES */}
        <div className="absolute inset-0 z-0">
          {DISABLE_HEROES ? (
            <div className="w-full h-full cv-cinematic-section" aria-hidden="true" />
          ) : (
            <picture>
              <source
                media="(max-width: 768px)"
                type="image/webp"
                srcSet="/images/heroes/mission_hero_mobile_400w.webp 400w, /images/heroes/mission_hero_mobile_600w.webp 600w, /images/heroes/mission_hero_mobile_800w.webp 800w"
                sizes="100vw"
              />
              <source
                media="(min-width: 769px)"
                type="image/webp"
                srcSet="/images/heroes/mission_hero_desktop_640w.webp 640w, /images/heroes/mission_hero_desktop_960w.webp 960w, /images/heroes/mission_hero_desktop_1280w.webp 1280w, /images/heroes/mission_hero_desktop_1600w.webp 1600w"
                sizes="100vw"
              />
              <img
                src={isMobile ? '/images/backgrounds/background_ourstory_mobile_img.webp' : '/images/backgrounds/background_ourstory_img.webp'}
                alt=""
                width={1600}
                height={900}
                className="w-full h-full object-cover"
                style={{ objectPosition: isMobile ? 'center bottom' : '70% center' }}
                loading="eager"
                decoding="async"
              />
            </picture>
          )}
        </div>
        {/* Gradient overlay */}
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background: isMobile
              ? 'linear-gradient(180deg, rgba(8,18,38,0.92) 0%, rgba(8,18,38,0.85) 30%, rgba(8,18,38,0.65) 50%, rgba(8,18,38,0.35) 70%, rgba(8,18,38,0.15) 85%, transparent 100%)'
              : 'linear-gradient(90deg, rgba(8,15,35,0.72) 0%, rgba(8,15,35,0.55) 35%, rgba(8,15,35,0.25) 60%, rgba(8,15,35,0.08) 80%, transparent 100%)',
          }}
        />
        {/* Content - within site width; desktop: vertically centered */}
        <div 
          className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 min-h-[50vh] md:min-h-[calc(92vh-200px)] flex flex-col md:justify-center"
          style={{ 
            paddingTop: isMobile ? '0' : '0',
            marginTop: '0',
            paddingLeft: isMobile ? '20px' : undefined,
            paddingRight: isMobile ? '20px' : undefined,
          }}
        >
          <div 
            className="text-left w-full max-w-full"
            style={{ 
              maxWidth: isMobile ? '100%' : '540px',
              paddingTop: isMobile ? '50px' : '0',
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
        {/* Origin Section — "Why This World Was Created" (reference: light bg, pill labels, rounded-rectangle image) */}
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
            <SplitStorySection
              label="Our History:"
              title="Our History"
              body={
                <>
                  <p>
                    Caiden&apos;s Courage was created to help kids understand their emotions, celebrate neurodiversity, and
                    discover the superhero that already lives inside them. Through stories, characters, and imaginative learning
                    tools, we empower children to feel seen, confident, and brave in their everyday world.
                  </p>
                  <p>
                    This isn&apos;t about fixing kids. It&apos;s about helping them recognize their strengths. When kids understand
                    themselves, confidence follows.
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Created to celebrate neurodiversity as strength</li>
                    <li>Built with emotional intelligence at the core</li>
                    <li>Designed to help kids feel seen and powerful</li>
                  </ul>
                </>
              }
              cta={{ label: 'Learn About the Mission', href: '/mission' }}
              imageSrc="/images/ourhistory_img.webp"
              imageAlt="Our History - The origin story of Caiden&apos;s Courage"
              radiusClass="rounded-[16%]"
              imageFrameClassName="story-image-mask"
            />

            {/* Block B: Our Promise */}
            <SplitStorySection
              label="Our Promise:"
              title="Our Promise"
              body={
                <>
                  <p>
                    We promise to create stories, tools, and experiences that help every child see their differences as strengths.
                    We&apos;re committed to building a world where neurodiversity is celebrated, emotional intelligence is
                    nurtured, and courage is discovered through understanding.
                  </p>
                  <p>
                    Our promise extends to parents, educators, and partners who share our vision of empowering kids to feel
                    confident, capable, and never alone in their journey.
                  </p>
                </>
              }
              cta={{ label: 'Partner With Us', href: '/contact' }}
              imageSrc="/images/OurPromise_img.webp"
              imageAlt="Our Promise - Children engaging with Caiden&apos;s Courage tools and activities"
              reverse
              radiusClass="rounded-[16%]"
              imageFrameClassName="story-image-mask"
            />
          </div>
        </section>

        {/* Section Separator */}
        <div className="border-t border-navy-200 my-20 sm:my-24 lg:my-28"></div>

        {/* Meet the Creator — global two-column component over background image */}
        <section
          className="creator-split-section relative overflow-hidden"
          style={{
            backgroundImage: 'url(/images/backgrounds/meetthecreator_bg_dragpn.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 z-0" style={{ backgroundColor: 'rgba(27, 42, 68, 0.78)' }} aria-hidden="true" />
          <SplitStorySection
            label="MEET THE CREATOR"
            title="Tarus D. Stills"
            body={
              <>
                <p>
                  Tarus D. Stills is an illustrator, filmmaker, writer, and creative entrepreneur whose work is rooted in creativity, imagination, and the power of neurodivergent thinking. With a background in visual design and years of experience spanning illustration, storytelling, and digital media, he creates worlds that invite children to see themselves with confidence and possibility.
                </p>
                <p>
                  Inspired by his own creative journey and a deep belief in art as a tool for focus, expression, and emotional growth, Tarus created <em>Caiden&apos;s Courage</em> to celebrate kids who think differently and imagine boldly. His work blends expressive illustration with heartfelt storytelling, encouraging young readers to recognize their minds as strengths rather than limitations.
                </p>
                <p>
                  Beyond the page, Tarus is a passionate advocate for creative education and representation. Through his stories, he hopes to remind every child that what makes them different may also be what makes them extraordinary.
                </p>
              </>
            }
            imageSrc="/images/Profile%20Picture/meetthecreator_tarus.jpg"
            imageAlt="Meet the Creator - Tarus D. Stills"
            radiusClass="rounded-[16%]"
            wrapClassName="creator-split-dark relative z-10"
          />
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
                <div className="world-different-blob overflow-hidden grid place-items-center">
                  <img
                    src="/images/Emotionallearningthroughstory_img.webp"
                    alt="Emotional learning through story"
                    width={80}
                    height={80}
                    className="world-different-blob-image w-full h-full object-cover object-center block scale-[1.18]"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/ui/logoCaiden_480w.webp';
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
                <div className="world-different-blob overflow-hidden grid place-items-center">
                  <img
                    src="/images/heroes/Neurodiversity-positiveheroes_img.webp"
                    alt="Neurodiversity-positive heroes"
                    width={80}
                    height={80}
                    className="world-different-blob-image w-full h-full object-cover object-center block scale-[1.18]"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/ui/logoCaiden_480w.webp';
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
                <div className="world-different-blob overflow-hidden grid place-items-center">
                  <img
                    src="/images/characters/Character-drivengrowth_img.webp"
                    alt="Character-driven growth"
                    width={80}
                    height={80}
                    className="world-different-blob-image w-full h-full object-cover object-center block scale-[1.18]"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/ui/logoCaiden_480w.webp';
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
                <div className="world-different-blob overflow-hidden grid place-items-center">
                  <img
                    src="/images/Toolsthatsupportkidsbeyondthepage_img.webp"
                    alt="Tools beyond the page"
                    width={80}
                    height={80}
                    className="world-different-blob-image w-full h-full object-cover object-center block scale-[1.18]"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/ui/logoCaiden_480w.webp';
                    }}
                  />
                </div>
                <div className="world-different-card-content">
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-navy-500 mb-3">
                    Tools beyond the page
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

        {/* Expansion Section — two-column grid via global SplitStorySection */}
        <SplitStorySection
          label="Our World:"
          title="The World Is Just Beginning…"
          body={
            <>
              <p>
                Caiden&apos;s Courage is more than a single story. It&apos;s a growing world that includes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>graphic novels</li>
                <li>characters and companions</li>
                <li>future learning tools</li>
                <li>digital experiences (coming later), including interactive storytelling and streaming/animated content</li>
              </ul>
              <p>
                We&apos;re building this slowly and intentionally — alongside the families and kids who believe in it.
              </p>
            </>
          }
          imageSrc="/images/TheWorldIsJustBeginning_img.jpg"
          imageAlt="Caiden's Courage world exploration and discovery"
          radiusClass="rounded-[16%]"
          wrapClassName="mb-16 sm:mb-20 lg:mb-24"
        />

        {/* Section Separator */}
        <div className="border-t border-navy-200 my-16 sm:my-20 lg:my-24"></div>
      </main>

      {/* Featured Comic Book Section - Blue Backdrop */}
      <section className="cv-cinematic-section py-10 sm:py-12 lg:py-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* White Featured Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 lg:p-10 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-start md:gap-10 gap-6">
              {/* Left Side - Circular Image */}
              <div className="flex justify-start md:flex-shrink-0">
                <div 
                  className="rounded-full overflow-hidden border-4 shadow-sm w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 shrink-0"
                  style={{ borderColor: '#E5C06A', boxShadow: '0 0 0 1px rgba(229, 192, 106, 0.2)' }}
                >
                  <picture>
                    <source
                      type="image/webp"
                      srcSet="/images/Comic5_Coverpage_header_smaller-900.webp 900w, /images/Comic5_Coverpage_header_smaller-1600.webp 1600w"
                      sizes="(max-width: 768px) 92vw, 742px"
                    />
                    <img
                      src="/images/Comic5_Coverpage_header_smaller-1600.webp"
                      alt="Caiden's Courage Comic Book"
                      width={144}
                      height={144}
                      className="w-full h-full object-cover object-center scale-110"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/ui/logoCaiden_480w.webp';
                      }}
                    />
                  </picture>
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
              loading="lazy"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Mission;

