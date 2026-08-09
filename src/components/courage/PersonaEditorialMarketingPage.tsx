import React from 'react';
import { Link } from 'react-router-dom';
import type { PersonaPageConfig } from '../../config/personaPages';
import { trackCtaClick } from '../../lib/analytics';
import Button from '../ui/Button';
import CourageFooter from './CourageFooter';
import CourageHeader from './CourageHeader';
import { EditorialPricingTierCard, PersonaContainer } from './PersonaMarketingPrimitives';
import RelatedPathCards from './RelatedPathCards';
import SectionHero from './SectionHero';
import './persona-editorial.css';

type Props = { config: PersonaPageConfig; children?: React.ReactNode };

const AUDIENCE_COPY: Record<string, string> = {
  'Parents and caregivers': 'Turn everyday moments into calmer conversations and stronger connection.',
  'Homeschool families': 'Flexible story-led learning that fits naturally into your family rhythm.',
  'Kids ages 7–12': 'Age-appropriate adventures that make focus and feelings easier to talk about.',
  'Neurodivergent-friendly home learning': 'Welcoming tools designed for different ways of thinking, feeling, and learning.',
  'Classroom teachers': 'Ready-to-use experiences for SEL blocks, reading time, and classroom community.',
  'Counselors and advisors': 'Story moments that open meaningful small-group and one-to-one conversations.',
  'Reading specialists': 'A visual narrative that supports engagement, reflection, and comprehension.',
  'One classroom, up to 35 students': 'One clear toolkit for guiding a whole classroom without adding heavy prep.',
};

const EXPERIENCE_CARDS = {
  parents: [
    { title: 'Talk It Through', copy: 'Conversation guides and brave affirmation prompts help feelings become words.', image: '/images/caidenscourage/How_It_Works/reflectcard_cc.webp' },
    { title: 'Reset & Refocus', copy: 'B-4 focus exercises and printable tools make calm-down practice feel playful.', image: '/images/caidenscourage/backgrounds/caidenandme.webp' },
    { title: 'Read & Explore', copy: 'Kid-friendly story access, coloring pages, and activities extend Caiden’s world.', image: '/images/caidenscourage/How_It_Works/read_card_.webp' },
  ],
  teachers: [
    { title: 'Guide the Conversation', copy: 'Discussion guides help students name feelings, choices, and courage together.', image: '/images/caidenscourage/schooldistrict/teacher.webp' },
    { title: 'Teach Through Story', copy: 'Digital story access and lesson plans bring SEL ideas into a world kids remember.', image: '/images/caidenscourage/backgrounds/classroom-story-bg.webp' },
    { title: 'Practice & Create', copy: 'Printable activities and focused reflection tools turn ideas into action.', image: '/images/caidenscourage/How_It_Works/reflectcard_cc.webp' },
  ],
} as const;

export default function PersonaEditorialMarketingPage({ config, children }: Props) {
  const family = config.slug === 'parents';
  const tone = family ? 'family' : 'teacher';
  const experiences = EXPERIENCE_CARDS[config.slug as 'parents' | 'teachers'];
  const b4Src = family
    ? '/images/Choose-Your-Guide/b-4facilitator-hover.webp'
    : '/images/Choose-Your-Guide/B-4orange-hover.webp';
  const howItems = config.howItWorks ?? config.faq ?? [];

  return (
    <div className={`personaEditorial personaEditorial--${tone} min-h-screen overflow-x-clip bg-cream font-body`}>
      <CourageHeader />
      <SectionHero
        className={`persona-marketingHero persona-marketingHero--${tone}`}
        variant="compact"
        eyebrow={config.eyebrow}
        title={config.heroTitle}
        description={config.heroSubtitle}
        supportingText={config.intro}
        visual={<div className="persona-marketingHeroGuide"><div className="persona-marketingHeroGuideGlow" /><img className="persona-marketingHeroB4" src={b4Src} alt={family ? 'Parent and guardian B-4 guide' : 'Facilitator and teacher B-4 guide'} /></div>}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button variant="primary" size="lg" as={Link} to={config.primaryCta.href} leftIconSrc={null} className="w-full sm:w-auto" onClick={() => trackCtaClick(config.primaryCta.label, config.primaryCta.href)}>{config.primaryCta.label}</Button>
          <Button variant="secondary" size="lg" as={Link} to={config.secondaryCta.href} className="cc-schools-hero-secondary w-full border-white/40 text-white hover:bg-white/10 hover:text-white sm:w-auto" onClick={() => trackCtaClick(config.secondaryCta.label, config.secondaryCta.href)}>{config.secondaryCta.label}</Button>
        </div>
      </SectionHero>

      <section className="personaEditorial__audience">
        <PersonaContainer>
          <div className="personaEditorial__heading">
            <p>{family ? 'Together, at your pace' : 'Flexible by design'}</p>
            <h2>{family ? 'Made for the way your family learns' : 'Built for the way you teach'}</h2>
            <span>{family ? 'Story-powered support for confidence, focus, emotional language, and meaningful time together.' : 'Classroom-ready support for emotional awareness, focus, discussion, reflection, and creative response.'}</span>
          </div>
          <div className="personaEditorial__audienceGrid">
            {config.whoItsFor.map((item) => <article key={item}><i aria-hidden>✦</i><h3>{item}</h3><p>{AUDIENCE_COPY[item]}</p></article>)}
          </div>
          <ul className="personaEditorial__benefitRibbon" aria-label="Key benefits">
            {config.benefits.map((benefit) => <li key={benefit}>✓ {benefit}</li>)}
          </ul>
        </PersonaContainer>
      </section>

      <section className="personaEditorial__experiences">
        <PersonaContainer>
          <div className="personaEditorial__heading"><p>{family ? 'Everyday courage tools' : 'Ready when you are'}</p><h2>{family ? 'Tools you can use together' : 'Story-powered tools for your classroom'}</h2></div>
          <div className="personaEditorial__experienceGrid">
            {experiences.map((card) => <article key={card.title}><div className="personaEditorial__experienceArt"><img src={card.image} alt="" loading="lazy" /></div><div><h3>{card.title}</h3><p>{card.copy}</p></div></article>)}
          </div>
        </PersonaContainer>
      </section>

      {!family ? <section className="personaEditorial__sequence"><PersonaContainer><div className="personaEditorial__heading personaEditorial__heading--light"><p>A simple learning rhythm</p><h2>From story to discussion to reflection</h2></div><ol><li><span>01</span><h3>Read / Experience</h3><p>Enter a vivid story moment students can see themselves in.</p></li><li><span>02</span><h3>Discuss</h3><p>Use guided prompts to explore feelings, choices, and courage.</p></li><li><span>03</span><h3>Practice / Reflect</h3><p>Turn insight into a creative response or Focus Flame practice.</p></li></ol></PersonaContainer></section> : null}

      <section className="personaEditorial__portal">
        <PersonaContainer>
          <div className="personaEditorial__portalGrid">
            <div><p className="personaEditorial__eyebrow">{family ? 'Inside the Family Portal' : 'Inside the Teacher Portal'}</p><h2>{family ? 'One place to keep the journey going.' : 'Everything you need to guide the next brave step.'}</h2><p>{family ? 'Move from story to conversation to playful practice with family activities, B-4 reset tools, printables, and kid-friendly adventures.' : 'Open discussion guides, lesson plans, printables, student activities, and digital story experiences from one classroom-ready home.'}</p><ul>{config.whatsIncluded.map((item) => <li key={item}>✓ {item}</li>)}</ul></div>
            <figure><img className="personaEditorial__portalImage" src={family ? '/images/caidenscourage/backgrounds/PhotoCollageMockup.webp' : '/images/caidenscourage/schooldistrict/interactive.webp'} alt={family ? 'A preview of the family learning experience' : 'A preview of the teacher learning experience'} loading="lazy" /><img className="personaEditorial__portalB4" src={b4Src} alt="" aria-hidden="true" /></figure>
          </div>
        </PersonaContainer>
      </section>

      <section id="pricing" className="personaEditorial__pricing"><PersonaContainer><div className="personaEditorial__heading"><p>Choose your path</p><h2>Pricing</h2></div><div className="personaEditorial__pricingGrid">{config.pricing.map((tier) => <EditorialPricingTierCard key={tier.title} tier={tier} family={family} />)}</div>{config.pricingFooterNotes?.map((note) => <p className="personaEditorial__pricingNote" key={note}>{note}</p>)}</PersonaContainer></section>

      {howItems.length ? <section id="how-it-works" className="personaEditorial__how"><PersonaContainer><div className="personaEditorial__heading"><p>Start simply</p><h2>{config.howItWorksTitle}</h2></div><div>{howItems.map((item) => <details key={item.question}><summary><span>{item.question}</span><b aria-hidden>+</b></summary><p>{item.answer}</p></details>)}</div></PersonaContainer></section> : null}

      {family ? <section className="personaEditorial__world"><PersonaContainer><div><p className="personaEditorial__eyebrow">Explore the world together</p><h2>The tools begin with a story kids want to enter.</h2><p>Meet Caiden, follow the Focus Flame, and discover a world where the qualities that make kids different can become their greatest strengths.</p><Button variant="primary" size="lg" as={Link} to="/the-story" leftIconSrc={null}>Discover the Story</Button></div><img src="/images/backgrounds/caidenvale_book_hero.webp" alt="Caiden Vale and the Focus Flame book" loading="lazy" /></PersonaContainer></section> : null}

      {children}
      <section className="personaEditorial__final"><PersonaContainer><div><p>{family ? 'A braver next step starts at home.' : 'Bring the story into your classroom.'}</p><h2>{family ? 'Build focus, confidence, and courage—together.' : 'Give students a story they can carry into real life.'}</h2><Button variant="primary" size="lg" as={Link} to={config.primaryCta.href} leftIconSrc={null}>{config.primaryCta.label}</Button></div></PersonaContainer></section>
      <RelatedPathCards excludeSlug={config.slug} />
      <CourageFooter />
    </div>
  );
}
