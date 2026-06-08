import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { FOCUS_FLAME_LAB_PATH, PORTAL_PATH } from '../../config/courageNav';
import {
  getPortalPathTab,
  PORTAL_INCLUDED_BY_AUDIENCE,
  PORTAL_PATH_TABS,
  PORTAL_VALUE_ITEMS,
  type PortalAudienceTab,
  type PortalPathTheme,
} from '../../config/portalAudience';

type PathCard = {
  title: string;
  description: string;
  price?: string;
  cta: string;
  ctaTo: string;
  badges?: string[];
  note?: string;
  featured?: boolean;
  comingSoon?: boolean;
};

// TODO(checkout): Wire "Get Digital Access" to a dedicated digital-novel purchase route when checkout launches.
const DIGITAL_NOVEL_CTA_TO = PORTAL_PATH;

const FAMILY_PORTAL_CARD: PathCard = {
  title: 'Family Portal',
  description:
    'At-home Focus Flame tools, coloring pages, B-4 reset activities, and family conversation guides.',
  price: '$79/year',
  cta: 'Join the Family Portal',
  ctaTo: PORTAL_PATH,
  badges: ['Best for Families'],
};

const FAMILY_BUNDLE_CARD: PathCard = {
  title: 'Digital Book + Family Portal',
  description:
    'Includes digital access to the 139-page graphic novel plus one year of Family Portal resources.',
  price: '$129/year',
  cta: 'Get Digital Book + Family Portal',
  ctaTo: PORTAL_PATH,
  badges: ['Recommended', 'Best for Families'],
  note: 'Physical books are sold separately.',
  featured: true,
};

const CARDS_BY_AUDIENCE: Record<PortalAudienceTab, PathCard[]> = {
  kids: [
    {
      title: 'Focus Flame Lab',
      description: 'Interactive story moments to practice focus, feelings, and brave choices.',
      cta: 'Play Focus Flame Lab',
      ctaTo: FOCUS_FLAME_LAB_PATH,
      badges: ['Build Focus'],
    },
    {
      title: 'Coloring Pages',
      description: 'Print and color brave characters and story scenes from Brave Mind Club.',
      cta: 'Browse Coloring Pages',
      ctaTo: '/braveminds?type=coloring',
    },
    {
      title: 'Ask B-4',
      description: 'Chat with B-4 for a friendly focus and feelings reset anytime.',
      cta: 'Ask B-4',
      ctaTo: '/chat',
    },
    {
      title: 'Brave Missions',
      description: 'Short missions to practice brave choices in everyday moments.',
      cta: 'Coming Soon',
      ctaTo: PORTAL_PATH,
      comingSoon: true,
    },
    {
      title: 'Kid Activities',
      description: 'Games, printables, and courage-building activities from the Kids hub.',
      cta: 'Explore Kid Activities',
      ctaTo: '/kids',
    },
  ],
  parents: [
    {
      title: 'Digital Graphic Novel',
      description:
        'Digital access to the 139-page story-powered graphic novel that introduces Caiden, B-4, and the Focus Flame journey.',
      price: '$50',
      cta: 'Get Digital Access',
      ctaTo: DIGITAL_NOVEL_CTA_TO,
      badges: ['Digital Access'],
      note: 'Physical copies will be available separately through print-on-demand.',
    },
    { ...FAMILY_PORTAL_CARD },
    { ...FAMILY_BUNDLE_CARD },
    {
      title: 'Parent Resources',
      description:
        'Conversation guides, at-home SEL prompts, and printable tools for caregivers.',
      cta: 'Explore Parent Resources',
      ctaTo: '/braveminds#parents',
      badges: ['Build Confidence'],
    },
    {
      title: 'B-4 Reset Tools',
      description: 'Quick reset tools to help kids name feelings and refocus at home.',
      cta: 'Open B-4 Reset Tools',
      ctaTo: '/b4-tools',
    },
  ],
  educators: [
    {
      title: 'Teacher Portal',
      description:
        'Classroom-ready SEL prompts, worksheets, discussion guides, and Focus Flame activities.',
      price: '$99/year',
      cta: 'Join the Teacher Portal',
      ctaTo: PORTAL_PATH,
      badges: ['For Educators'],
    },
    {
      title: 'Digital Novel + Teacher Portal',
      description:
        'Includes digital access to the graphic novel plus one year of classroom-ready SEL resources for educators.',
      price: '$129',
      cta: 'Get the Teacher Bundle',
      ctaTo: PORTAL_PATH,
      badges: ['Digital Access', 'For Educators'],
      note: 'Physical books are sold separately.',
      featured: true,
    },
    {
      title: 'Worksheets',
      description: 'Printable SEL worksheets and classroom activity sheets.',
      cta: 'Browse Worksheets',
      ctaTo: '/braveminds?type=worksheet',
    },
    {
      title: 'Discussion Guides',
      description: 'Story-based SEL discussion prompts for guided classroom conversations.',
      cta: 'View Discussion Guides',
      ctaTo: '/schools#teacher-resources',
    },
    {
      title: 'Classroom Activities',
      description: 'Teacher-ready activities, reflection prompts, and group supports.',
      cta: 'Explore Classroom Activities',
      ctaTo: '/braveminds#teachers',
    },
  ],
  schools: [
    {
      title: 'Classroom License',
      description:
        'Designed for one classroom. Includes curriculum modules, Focus Flame Lab access, printable activities, educator resources, and digital story access for classroom use.',
      price: '$499/year',
      cta: 'Request Classroom Access',
      ctaTo: '/schools#pilot',
      badges: ['School Ready'],
    },
    {
      title: 'School License',
      description:
        'Designed for school-wide use. Includes implementation resources, facilitator tools, group activities, school access support, and digital story access for school programming.',
      price: '$999/year',
      cta: 'Request School Access',
      ctaTo: '/schools#pilot',
      badges: ['School Ready'],
    },
    {
      title: 'District / Pilot Partner',
      description:
        'For districts, camps, counseling groups, and pilot partners that need implementation support, outcomes tracking, custom rollout planning, and digital story access.',
      price: 'Starting at $1,999',
      cta: 'Request Pilot Information',
      ctaTo: '/schools#pilot',
      badges: ['Pilot Partner'],
      featured: true,
    },
    {
      title: 'Implementation Guide',
      description: "Step-by-step guidance for rolling out Caiden's Courage in schools and programs.",
      cta: 'View Implementation Guide',
      ctaTo: '/training-guides',
    },
    {
      title: 'Pilot Resources',
      description: 'Pilot materials, facilitator supports, and partnership resources for school programs.',
      cta: 'Explore Pilot Resources',
      ctaTo: '/schools#pilot',
    },
  ],
  camps: [
    {
      title: 'Camp Pilot',
      description: 'Digital SEL modules, facilitator guide, and group activities for camps and youth programs.',
      price: '$750',
      cta: 'Explore Camp Pilot',
      ctaTo: '/camps',
      badges: ['Camp Program'],
      featured: true,
    },
    {
      title: 'Focus Flame Lab',
      description: 'Interactive story-powered focus adventures for camp groups.',
      cta: 'Play Focus Flame Lab',
      ctaTo: '/focus-flame-lab',
    },
  ],
  districts: [
    {
      title: 'District / Pilot Partner',
      description: 'Multi-school rollout, outcomes tracking, and implementation consultation.',
      price: 'Starting at $1,999',
      cta: 'Schedule a Pilot Call',
      ctaTo: '/schools',
      badges: ['District Partner'],
      featured: true,
    },
    {
      title: 'School License',
      description: 'School-wide SEL materials, training video, and priority support.',
      cta: 'Request School Pilot',
      ctaTo: '/schools#pilot',
    },
  ],
};

const PATH_TAB_ACTIVE: Record<PortalPathTheme, string> = {
  blue: 'cc-portal-path-tab--active-blue',
  gold: 'cc-portal-path-tab--active-gold',
  orange: 'cc-portal-path-tab--active-orange',
  teal: 'cc-portal-path-tab--active-teal',
};

function PathBadge({ label }: { label: string }) {
  return (
    <span className="cc-portal-pricing-badge inline-flex rounded-full bg-golden-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-golden-800 sm:text-[11px]">
      {label}
    </span>
  );
}

function PathCardArticle({ card }: { card: PathCard }) {
  const isDisabled = card.comingSoon;

  return (
    <article
      className={[
        'cc-portal-pricing-card flex h-full flex-col rounded-2xl border p-6 sm:p-7',
        card.featured
          ? 'border-golden-500/40 bg-gradient-to-br from-[#F3F8FF] via-white to-[#FAF9F3] shadow-[0_10px_32px_-18px_rgba(36,62,112,0.2)]'
          : 'border-navy-100/90 bg-[#FAF9F7] shadow-[0_6px_24px_-14px_rgba(36,62,112,0.12)]',
        isDisabled ? 'opacity-90' : '',
      ].join(' ')}
    >
      {card.badges?.length ? (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {card.badges.map((badge) => (
            <PathBadge key={badge} label={badge} />
          ))}
        </div>
      ) : null}

      <h3 className="font-display text-xl font-extrabold text-navy-600">{card.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-navy-600/90 sm:text-base">{card.description}</p>

      {card.price ? (
        <p className="mt-5 font-display text-2xl font-extrabold text-golden-700">{card.price}</p>
      ) : null}

      {card.note ? (
        <p className="mt-3 text-xs leading-relaxed text-navy-500/80 sm:text-sm">{card.note}</p>
      ) : null}

      <div className="mt-5">
        {isDisabled ? (
          <Button variant="secondary" size="lg" leftIconSrc={null} fullWidth className="!w-full" disabled>
            Coming Soon
          </Button>
        ) : (
          <Button
            variant={card.featured ? 'primary' : 'secondary'}
            size="lg"
            as={Link}
            to={card.ctaTo}
            leftIconSrc={null}
            fullWidth
            className="!w-full"
          >
            {card.cta}
          </Button>
        )}
      </div>
    </article>
  );
}

type PortalPricingSectionProps = {
  audience: PortalAudienceTab;
  onAudienceChange: (audience: PortalAudienceTab) => void;
};

export default function PortalPricingSection({ audience, onAudienceChange }: PortalPricingSectionProps) {
  const included = PORTAL_INCLUDED_BY_AUDIENCE[audience];
  const cards = CARDS_BY_AUDIENCE[audience];
  const activeTab = getPortalPathTab(audience);

  const handleTabKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      const tabCount = PORTAL_PATH_TABS.length;
      let nextIndex: number | null = null;

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        nextIndex = (index + 1) % tabCount;
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        nextIndex = (index - 1 + tabCount) % tabCount;
      } else if (event.key === 'Home') {
        nextIndex = 0;
      } else if (event.key === 'End') {
        nextIndex = tabCount - 1;
      }

      if (nextIndex !== null) {
        event.preventDefault();
        onAudienceChange(PORTAL_PATH_TABS[nextIndex].id);
        document.getElementById(`portal-tab-${PORTAL_PATH_TABS[nextIndex].id}`)?.focus();
      }
    },
    [onAudienceChange]
  );

  return (
    <section className="cc-portal-pricing border-t border-navy-100/80 bg-white px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
      <div className="cc-site-container mx-auto">
        <div className="cc-portal-pricing-intro mx-auto max-w-3xl text-center">
          <h2 className="font-display text-2xl font-extrabold text-navy-500 sm:text-3xl">Choose Your Path</h2>
          <p className="mt-2 text-base text-navy-600 sm:text-lg">
            Select the path that best matches how you&apos;ll use Caiden&apos;s Courage.
          </p>

          <ul className="cc-portal-value-row mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:mt-6 sm:gap-x-6">
            {PORTAL_VALUE_ITEMS.map((item) => (
              <li key={item} className="flex items-center gap-2 text-xs font-semibold text-navy-600 sm:text-sm">
                <span className="text-golden-600" aria-hidden>
                  •
                </span>
                {item}
              </li>
            ))}
          </ul>

          <p className="mt-4 text-xs leading-relaxed text-navy-500/75 sm:text-sm">
            Digital access is included in select bundles. Physical books are sold separately through print-on-demand.
          </p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-navy-400 sm:text-xs">
            Checkout is coming soon. Current access codes are used for pilot testing.
          </p>
        </div>

        <div
          className="cc-portal-path-tabs mx-auto mt-8 w-full max-w-5xl sm:mt-9"
          role="tablist"
          aria-label="Choose your path"
        >
          <div className="cc-portal-path-tabs-grid grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            {PORTAL_PATH_TABS.map((tab, index) => {
              const isActive = audience === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`portal-tab-${tab.id}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`portal-tabpanel-${tab.id}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => onAudienceChange(tab.id)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                  className={[
                    'cc-portal-path-tab flex min-h-[3.25rem] items-center justify-center rounded-2xl border px-4 py-3.5 text-center transition-all duration-200 sm:min-h-[3.5rem] sm:px-5 sm:py-4',
                    isActive
                      ? PATH_TAB_ACTIVE[tab.theme]
                      : 'cc-portal-path-tab--inactive border-navy-100/90 bg-[#FAF9F7] text-navy-600',
                  ].join(' ')}
                >
                  <span className="font-display text-base font-extrabold leading-tight sm:text-lg lg:text-xl">
                    {tab.audienceLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div
          id={`portal-tabpanel-${audience}`}
          role="tabpanel"
          aria-labelledby={`portal-tab-${audience}`}
          className="mt-8 sm:mt-10"
        >
          {activeTab ? (
            <div className="cc-portal-path-content-header mx-auto mb-8 max-w-2xl text-center sm:mb-10">
              <h3 className="font-display text-2xl font-extrabold text-navy-600 sm:text-3xl">
                {activeTab.audienceLabel}
              </h3>
              <p className="mt-2 text-base text-navy-600/90 sm:text-lg">{activeTab.description}</p>
            </div>
          ) : null}

          <div className="cc-portal-pricing-grid grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {cards.map((card) => (
              <PathCardArticle key={`${audience}-${card.title}`} card={card} />
            ))}
          </div>

          <div className="cc-portal-included mx-auto mt-10 max-w-3xl rounded-2xl border border-navy-100/90 bg-gradient-to-br from-[#F3F8FF] to-[#FAF9F3] p-6 sm:p-8">
            <h3 className="font-display text-lg font-extrabold text-navy-600 sm:text-xl">{included.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {included.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3 text-sm text-navy-600 sm:text-base">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-golden-500" aria-hidden />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
