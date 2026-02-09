import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getWaitlistUrl, openExternalUrl } from '../config/externalLinks';
import Button from '../components/ui/Button';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface Character {
  name: string;
  role: string;
  bio: string;
  image: string;
}

/** Responsive srcSet for character profile images (192w/400w generated at build). */
function getProfileImageSet(src: string): { src: string; srcSet?: string; sizes?: string } {
  if (!src.includes('/characters/') || !src.endsWith('.webp') || !src.includes('_profile')) {
    return { src };
  }
  const base = src.replace(/\.webp$/, '');
  return {
    src,
    srcSet: `${base}_192w.webp 192w, ${base}_400w.webp 400w, ${src} 1024w`,
    sizes: '96px', // card portrait; promo section overrides with sizes="400px"
  };
}

const characters: Character[] = [
  {
    name: 'Caiden',
    role: 'Hero',
    bio: "Curious, creative, and brave in ways he doesn't always recognize yet. Caiden learns that what makes him different can also make him powerful—especially when others need help.",
    image: '/images/characters/Caiden_img_profile.webp'
  },
  {
    name: 'Genesis',
    role: 'Alter-Ego',
    bio: "When courage kicks in, Caiden becomes Genesis—focused, fearless, and ready to protect the vulnerable. Genesis is the 'mythic version' of Caiden's best self.",
    image: '/images/genesis_img_pic.webp'
  },
  {
    name: 'B-4',
    role: 'Companion',
    bio: 'Part guide, part gadget, part best friend. B-4 helps Caiden stay grounded, spot patterns, and make bold choices—especially when the world gets loud.',
    image: '/images/characters/b4_img_profile.webp'
  },
  {
    name: 'Ollis Buck',
    role: 'Ally',
    bio: 'Wise, steady, and unexpectedly funny. Ollis Buck reminds Caiden that slow thinking can be a superpower—and that every journey needs patience.',
    image: '/images/characters/ollie_img_profile.webp'
  },
  {
    name: 'Breath of Life',
    role: 'Mythic Force',
    bio: 'An ancient energy that awakens courage and clarity. The Breath of Life connects the ordinary world to the Otherworld—and chooses its moments carefully.',
    image: '/images/characters/breathoflife_img_profile.webp'
  },
  {
    name: 'Father Dragon',
    role: 'Guardian',
    bio: 'A legendary protector with a deep sense of purpose. Father Dragon watches the boundary between worlds—and tests Caiden\'s heart as much as his strength.',
    image: '/images/characters/dragon_img_profile.webp'
  },
  {
    name: 'Uncle T',
    role: 'Mentor',
    bio: 'Supportive, real, and always keeping it honest. Uncle T helps Caiden believe in himself, even when confidence feels out of reach.',
    image: '/images/characters/unclet_img_profile.webp'
  },
  {
    name: 'Maria',
    role: 'Anchor',
    bio: 'Smart, grounded, and fearless in her own way. Maria challenges Caiden to be accountable and brave—and never lets him forget who he is.',
    image: '/images/characters/maria_img_profile.webp'
  }
];

const Characters: React.FC = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    document.title = "Meet the Characters | Caiden's Courage";
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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
        className="hero-cinematic relative flex items-center overflow-hidden"
        style={{
          minHeight: isMobile ? '100vh' : '92vh',
          paddingTop: isMobile ? '130px' : '120px',
          paddingBottom: isMobile ? '40px' : '120px',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: isMobile ? 'flex-start' : 'center',
        }}
      >
        {/* Hero image layer — full bleed, LCP */}
        <div className="absolute inset-0 z-0">
          <picture>
            <source
              media="(max-width: 768px)"
              type="image/webp"
              srcSet="/images/heroes/characters_hero_mobile_400w.webp 400w, /images/heroes/characters_hero_mobile_600w.webp 600w, /images/heroes/characters_hero_mobile_800w.webp 800w"
              sizes="100vw"
            />
            <source
              media="(min-width: 769px)"
              type="image/webp"
              srcSet="/images/heroes/characters_hero_desktop_640w.webp 640w, /images/heroes/characters_hero_desktop_960w.webp 960w, /images/heroes/characters_hero_desktop_1280w.webp 1280w, /images/heroes/characters_hero_desktop_1600w.webp 1600w"
              sizes="100vw"
            />
            <img
              src={isMobile ? '/images/backgrounds/background_caidenscharacter_mobile_img.webp' : '/images/backgrounds/background_caidenscharacter_img.webp'}
              alt=""
              width={1600}
              height={900}
              className="w-full h-full object-cover"
              style={{ objectPosition: isMobile ? 'center bottom' : '72% center' }}
              loading="eager"
              decoding="async"
            />
          </picture>
        </div>
        {/* Gradient overlay */}
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background: isMobile
              ? 'linear-gradient(180deg, rgba(8,18,38,0.92) 0%, rgba(8,18,38,0.85) 30%, rgba(8,18,38,0.65) 50%, rgba(8,18,38,0.35) 70%, rgba(8,18,38,0.15) 85%, transparent 100%)'
              : 'linear-gradient(90deg, rgba(8,18,38,0.92) 0%, rgba(8,18,38,0.82) 35%, rgba(8,18,38,0.45) 55%, rgba(8,18,38,0.15) 70%, transparent 85%)',
          }}
        />
        {/* Content - Aligned to Global Grid */}
        <div className="hero-container relative z-10 w-full flex flex-col md:block">
          <div className="hero-text text-left md:max-w-[520px] w-full md:w-auto" style={{ maxWidth: '520px', marginBottom: '0' }}>
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
              MEET THE HEROES
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
              The World of Caiden
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
              A mythic children's universe where courage protects the misunderstood.
            </p>

            {/* Paragraph */}
            <p 
              className="text-white"
              style={{ 
                fontSize: '17px',
                lineHeight: '1.65',
                maxWidth: '460px',
                opacity: 0.75,
                marginBottom: '0'
              }}
            >
              From Caiden and B-4 to the creatures of the Otherworld—every character has a purpose.
            </p>

            {/* CTAs - Proper spacing */}
            <div className="flex flex-col sm:flex-row" style={{ marginTop: '28px', gap: '16px' }}>
              <Button
                variant="primary"
                size="md"
                as={Link}
                to="/world"
                className="!h-12 !px-6 !w-auto !min-w-0"
              >
                Explore the World
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={handlePreorderClick}
                className="!h-12 !px-6 !w-auto !min-w-0 !bg-transparent !border-2 !border-white !text-white hover:!bg-white/10"
              >
                Pre-Order Volume 1
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

      {/* Character Grid Section */}
      <section className="pb-16 sm:pb-20 lg:pb-24 bg-cream" style={{ marginTop: '0', paddingTop: '72px' }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="mb-12 sm:mb-16" style={{
            textAlign: 'center',
            maxWidth: '900px',
            marginLeft: 'auto',
            marginRight: 'auto',
            paddingBottom: '40px'
          }}>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-600" style={{ marginBottom: '14px' }}>
              Meet the Characters
            </h2>
            <p className="text-lg sm:text-xl text-navy-700/80 leading-relaxed">
              Heroes, companions, and legendary beings—each with a role in Caiden's journey.
            </p>
          </div>

          {/* Character Grid */}
          <div className="character-grid">
            {characters.map((character, index) => {
              const imgSet = getProfileImageSet(character.image);
              return (
              <div
                key={index}
                className="character-card bg-white border border-navy-200/30 transition-all duration-300 hover:-translate-y-1 w-full"
                style={{
                  maxWidth: isMobile ? '100%' : '420px',
                  padding: '28px',
                  borderRadius: '28px',
                  boxShadow: '0 20px 50px rgba(10, 30, 80, 0.08)'
                }}
              >
                <div style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: '20px',
                  alignItems: 'flex-start'
                }}>
                  {/* Bloop Portrait - Left */}
                  <div className="character-bloop flex-shrink-0" style={{
                    width: '96px',
                    height: '96px'
                  }}>
                    <div className="w-full h-full overflow-hidden" style={{
                      borderRadius: '58% 42% 35% 65% / 55% 48% 52% 45%',
                      border: '3px solid rgba(236, 185, 76, 0.85)',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
                    }}>
                      <img
                        src={character.image}
                        srcSet={imgSet.srcSet}
                        sizes={imgSet.sizes}
                        alt={character.name}
                        className="w-full h-full object-cover transition-transform duration-300"
                        loading="lazy"
                        decoding="async"
                        width={96}
                        height={96}
                        style={{
                          objectPosition: character.name === 'Uncle T' 
                            ? 'center 30%' 
                            : character.name === 'Maria' 
                            ? 'center 25%' 
                            : character.name === 'B-4' 
                            ? 'center 20%' 
                            : 'center center'
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/ui/logoCaiden.webp';
                        }}
                      />
                    </div>
                  </div>

                  {/* Name, pill, and bio - Right */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    flex: 1,
                    minWidth: 0
                  }}>
                    <h3 
                      className="font-display font-bold text-navy-600" 
                      style={{
                        fontSize: '1.6rem',
                        fontWeight: 700,
                        marginBottom: '0',
                        textAlign: 'left',
                        width: '100%'
                      }}
                    >
                      {character.name}
                    </h3>

                    <span 
                      className="inline-flex items-center px-3 py-1 text-xs sm:text-sm font-semibold text-navy-700 bg-golden-100 rounded-full whitespace-nowrap w-fit"
                    >
                      {character.role}
                    </span>

                    <p 
                      className="text-navy-700/80" 
                      style={{
                        width: '100%',
                        fontSize: '16px',
                        lineHeight: '1.6',
                        letterSpacing: '0.2px',
                        textAlign: 'left',
                        maxWidth: '38ch',
                        marginTop: '0',
                        marginBottom: '0'
                      }}
                    >
                      {character.bio}
                    </p>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        </div>
      </section>

      {/* Promotional Comic Book Section */}
      <section 
        className="py-20 sm:py-28 relative overflow-hidden"
        style={{
          backgroundImage: 'url(/images/backgrounds/background_img.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Dark Blue Gradient Overlay - Matching Creator Section */}
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(
              180deg,
              rgba(8, 20, 45, 0.82) 0%,
              rgba(18, 48, 92, 0.78) 60%,
              rgba(18, 48, 92, 0.70) 100%
            )`,
            zIndex: 1
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column: Text Content — on mobile appears below image (order-2) */}
            <div className="text-left order-2 lg:order-1">
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
                Do you have the courage to discover your strength?
              </h2>
              <p className="text-lg sm:text-xl text-white/90 mb-8 leading-relaxed" style={{ maxWidth: '52ch' }}>
                Step into Caiden's world through interactive SEL adventures that help you think bravely, feel deeply, and grow with confidence.
                <br />
                <br />
                Because what makes you different… is your superpower.
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  navigate('/b4-tools');
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }, 100);
                }}
                className="!h-14 !px-8 !text-lg"
              >
                Enter Caiden's World
              </Button>
            </div>

            {/* Right Column: Dragon in Bloop — on mobile appears above heading (order-1) */}
            <div className="flex justify-center lg:justify-end order-1 lg:order-2">
              <div className="relative" style={{ maxWidth: '400px' }}>
                <div className="w-full overflow-hidden" style={{
                  borderRadius: '58% 42% 35% 65% / 55% 48% 52% 45%',
                  border: '3px solid rgba(236, 185, 76, 0.85)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                  aspectRatio: '3/4',
                  transform: 'translateY(-6px)',
                  backgroundColor: '#ffffff'
                }}>
                  <img
                    src="/images/characters/dragon_img_profile.webp"
                    srcSet="/images/characters/dragon_img_profile_192w.webp 192w, /images/characters/dragon_img_profile_400w.webp 400w, /images/characters/dragon_img_profile.webp 1024w"
                    sizes="(max-width: 1023px) 100vw, 400px"
                    alt="Father Dragon - Guardian of Caiden's Courage"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    width={400}
                    height={533}
                    style={{ objectPosition: 'center' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/ui/logoCaiden.webp';
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Characters;
