import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getWaitlistUrl, openExternalUrl } from '../config/externalLinks';
import { DISABLE_HEROES } from '../config/heroes';
import Button from '../components/ui/Button';
import Header from '../components/Header';
import Footer from '../components/Footer';

const World: React.FC = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(
    () => (typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)').matches : false)
  );

  useEffect(() => {
    document.title = "Explore Caiden's World | Caiden's Courage";
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const m = window.matchMedia('(max-width: 768px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    m.addEventListener('change', handler);
    return () => m.removeEventListener('change', handler);
  }, []);

  const handlePreorderClick = () => {
    const waitlistUrl = getWaitlistUrl();
    if (waitlistUrl) {
      openExternalUrl(waitlistUrl);
    } else {
      navigate('/comicbook');
    }
  };

  return (
    <div className="min-h-screen bg-cream font-body">
      <Header />

      {/* Cinematic Hero Section — LCP image as <picture> (WebP), not lazy-loaded */}
      <header
        className="hero-cinematic relative flex items-start overflow-hidden"
        style={{
          minHeight: isMobile ? '100vh' : '92vh',
          paddingTop: isMobile ? '130px' : 'clamp(96px, 14vh, 160px)',
          paddingBottom: isMobile ? '40px' : '160px',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'flex-start',
        }}
      >
        {/* Hero image layer — background_caidensworld_img.jpg */}
        <div className="absolute inset-0 z-0">
          {DISABLE_HEROES ? (
            <div className="w-full h-full bg-navy-500" aria-hidden="true" />
          ) : (
            <img
              src={isMobile ? '/images/Headers_world_mobile.webp' : '/images/backgrounds/background_caidensworld_img.jpg'}
              alt=""
              width={1600}
              height={900}
              className="w-full h-full object-cover"
              style={{ objectPosition: isMobile ? 'center top' : 'right center' }}
              loading="eager"
              decoding="async"
            />
          )}
        </div>
        {/* Top Gradient Overlay */}
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(5, 18, 48, 0.75) 0%, rgba(5, 18, 48, 0.35) 35%, rgba(5, 18, 48, 0.1) 60%, transparent 80%)',
          }}
        />
        {/* Content - within site width; desktop: vertically centered */}
        <div 
          className="hero-container relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col min-h-[50vh] md:min-h-[calc(92vh-200px)] md:justify-center"
          style={{ paddingTop: '0' }}
        >
          <div className="hero-text text-left max-w-full" style={{ maxWidth: '640px', marginTop: '0', paddingTop: '0' }}>
            {/* Eyebrow */}
            <div 
              className="text-xs sm:text-sm font-semibold uppercase"
              style={{ 
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                opacity: 0.8,
                color: 'rgba(255, 255, 255, 0.9)',
                marginTop: '0',
                marginBottom: '12px'
              }}
            >
              MEET THE WORLD
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
              Enter Caiden's World
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
              A mythic universe layered with hidden creatures, ancient forces, and heroes discovering who they are meant to become.
            </p>

            {/* Paragraph */}
            <p 
              className="text-white"
              style={{ 
                fontSize: '17px',
                lineHeight: '1.65',
                maxWidth: '620px',
                opacity: 0.75,
                marginBottom: '0'
              }}
            >
              Some worlds are escaped into. This one helps you discover who you are inside.
            </p>

            {/* CTAs - Proper spacing */}
            <div className="flex flex-col sm:flex-row" style={{ marginTop: '28px', gap: '16px' }}>
              <Button
                variant="primary"
                size="md"
                onClick={handlePreorderClick}
                className="!h-12 !px-7 !w-auto !min-w-0 hover:!shadow-[0_0_20px_rgba(251,191,36,0.5)]"
                style={{
                  padding: '14px 28px',
                  borderRadius: '999px',
                  boxShadow: '0 4px 14px rgba(251, 191, 36, 0.3)',
                  transition: 'box-shadow 0.3s ease'
                }}
              >
                Pre-Order Volume 1
              </Button>
              <Button
                variant="secondary"
                size="md"
                as={Link}
                to="/characters"
                className="!h-12 !px-7 !w-auto !min-w-0 !bg-transparent !border-2 !border-white !text-white hover:!bg-white/10"
                style={{
                  borderRadius: '999px'
                }}
              >
                Explore Caiden's Characters
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

      {/* The Two Worlds Section */}
      <section className="bg-cream relative overflow-hidden" id="two-worlds" style={{ paddingTop: '120px', paddingBottom: '140px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-500 mb-4">
              Explore Caiden's World
            </h2>
            <p className="text-lg sm:text-xl text-navy-600/80 font-medium max-w-2xl mx-auto">
              Two worlds. One hero. Your courage decides the path.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Card - Where Courage Begins */}
            <Link
              to="/characters"
              className="world-card bg-white rounded-3xl overflow-hidden shadow-lg block"
              style={{
                borderRadius: '24px',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 249, 247, 0.98) 100%)',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div className="w-full h-64 overflow-hidden" style={{ aspectRatio: '16/10' }}>
                <picture>
                  <source
                    type="image/webp"
                    srcSet="/images/world_card_know_640w.webp 640w, /images/world_card_know_960w.webp 960w, /images/world_card_know_1280w.webp 1280w"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <img
                    src="/images/theknowworld_img.webp"
                    alt="Where Courage Begins"
                    width={640}
                    height={400}
                    className="world-card-image w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
              </div>
              <div className="p-8 lg:p-10">
                <h3 
                  className="font-display text-navy-500"
                  style={{
                    fontSize: 'clamp(24px, 2vw, 28px)',
                    fontWeight: 600,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2,
                    marginTop: '20px',
                    marginBottom: '12px',
                  }}
                >
                  Where Courage Begins
                </h3>
                <p 
                  className="text-lg text-navy-600 leading-relaxed mb-6"
                  style={{ maxWidth: '38ch' }}
                >
                  In the familiar halls of school, the warmth of family, and the bonds of friendship, Caiden's journey starts. Here, courage isn't about facing monsters—it's about being true to yourself when the world expects you to be someone else.
                </p>
                <div
                  className="inline-flex items-center font-semibold text-base transition-colors duration-200 world-card-link"
                  style={{ 
                    color: 'var(--navy-500)',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  Start Where You Are
                  <svg 
                    className="ml-2 w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Right Card - Where Courage Is Tested */}
            <Link
              to="/world"
              className="world-card bg-white rounded-3xl overflow-hidden shadow-lg block"
              style={{
                borderRadius: '24px',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 249, 247, 0.98) 100%)',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div className="w-full h-64 overflow-hidden" style={{ aspectRatio: '16/10' }}>
                <picture>
                  <source
                    type="image/webp"
                    srcSet="/images/world_card_other_640w.webp 640w, /images/world_card_other_960w.webp 960w, /images/world_card_other_1280w.webp 1280w"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <img
                    src="/images/TheOtherworld_genesis_img.webp"
                    alt="Where Courage Is Tested"
                    width={640}
                    height={400}
                    className="world-card-image w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
              </div>
              <div className="p-8 lg:p-10">
                <h3 
                  className="font-display text-navy-500"
                  style={{
                    fontSize: 'clamp(24px, 2vw, 28px)',
                    fontWeight: 600,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2,
                    marginTop: '20px',
                    marginBottom: '12px',
                  }}
                >
                  Where Courage Is Tested
                </h3>
                <p 
                  className="text-lg text-navy-600 leading-relaxed mb-6"
                  style={{ maxWidth: '38ch' }}
                >
                  Beyond the veil lie ancient creatures, hidden realms, and forces that have stirred for millennia. Here, every choice echoes through dimensions, and the line between hero and guardian blurs in the face of truths older than memory.
                </p>
                <div
                  className="inline-flex items-center font-semibold text-base transition-colors duration-200 world-card-link"
                  style={{ 
                    color: 'var(--navy-500)',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  Step Into the Unknown
                  <svg 
                    className="ml-2 w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Creature Tease Section */}
      <section className="bg-navy-500 relative overflow-hidden" style={{ paddingTop: '140px', paddingBottom: '140px' }}>
        {/* Subtle fog texture overlay */}
        <div 
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.08) 0%, transparent 50%)',
            backgroundSize: '200% 200%',
          }}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Text Block */}
          <div className="text-center mb-16 lg:mb-20">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
              Not Everything That Exists Can Be Seen.
            </h2>
            <p className="text-lg sm:text-xl text-white/90 font-medium max-w-3xl mx-auto mb-6">
              Beyond the familiar lies a world waiting to awaken.
            </p>
            <p className="text-base sm:text-lg text-white/80 leading-relaxed max-w-3xl mx-auto">
              Across the veil live beings both wondrous and dangerous — some waiting to be saved, others guarding truths older than memory.
            </p>
          </div>

          {/* Cinematic Image */}
          <div className="mb-12 lg:mb-16">
            <div 
              className="w-full overflow-hidden rounded-2xl"
              style={{ 
                height: 'clamp(400px, 50vh, 650px)',
                minHeight: '500px',
                maxHeight: '650px'
              }}
            >
              <img
                src="/images/TheOtherworld_img.webp"
                alt="The Otherworld - A world beyond the veil"
                width={1280}
                height={720}
                className="w-full h-full object-cover"
                style={{ objectPosition: 'center' }}
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>

          {/* Narrative Sentence */}
          <div className="text-center mb-10">
            <p className="text-lg sm:text-xl text-white/90 font-medium leading-relaxed max-w-2xl mx-auto">
              Some are guardians. Some are lost. Some are waiting for a hero brave enough to see them.
            </p>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <Button
              variant="primary"
              size="lg"
              as={Link}
              to="/characters"
              className="w-full sm:w-auto"
            >
              Meet the Creatures
            </Button>
          </div>
        </div>
      </section>

      {/* Courage Positioning Section */}
      <section className="py-20 sm:py-28 bg-cream relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-500 mb-6">
              Courage is not something Caiden finds. It is something he becomes.
            </h2>
            <p className="text-lg sm:text-xl text-navy-600/80 leading-relaxed max-w-3xl mx-auto">
              Every creature he saves reflects a strength waiting to awaken within him.
            </p>
          </div>
        </div>
      </section>

      {/* Visual Map Section */}
      <section className="py-20 sm:py-28 bg-navy-500 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            {/* World map image */}
            <div className="w-full overflow-hidden rounded-3xl" style={{ aspectRatio: '16/9' }}>
              <img
                src="/images/map.webp"
                alt="Caiden's World Map - The Veil, Ember Mountains, Whisper Forest, Sky Passage, Forgotten Gate"
                width={1280}
                height={720}
                className="w-full h-auto object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 sm:py-32 bg-cream relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-500 mb-12">
              And this is only the beginning…
            </h2>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                variant="primary"
                size="lg"
                as={Link}
                to="/b4-tools"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="w-full sm:w-auto"
              >
                Start Your Brave Journey
              </Button>
              <Button
                variant="secondary"
                size="lg"
                as={Link}
                to="/characters"
                className="w-full sm:w-auto"
              >
                Meet the Heroes
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default World;
