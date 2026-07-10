import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { STORY_BOOKS_PATH } from '../config/courageRoutes';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BluePageHeader from '../components/sections/BluePageHeader';
import Button from '../components/ui/Button';

type JourneyStatus =
  | 'LIVE'
  | 'COMMUNITY'
  | 'NOW OPEN'
  | 'IN DEVELOPMENT'
  | 'SOLD OUT'
  | 'CREATIVE UPDATE'
  | 'NEW EXPERIENCE'
  | 'READER STORIES'
  | 'INDUSTRY EVENT';

type JourneyEntry = {
  title: string;
  date: string;
  status: JourneyStatus;
  body: string;
  thumbnail?: string;
  thumbnailAlt?: string;
};

const STATUS_STYLES: Record<JourneyStatus, string> = {
  LIVE: 'bg-golden-500/15 text-navy-600 border-golden-500/35',
  'NOW OPEN': 'bg-golden-500/20 text-navy-600 border-golden-500/40',
  COMMUNITY: 'bg-[#E8F0FA] text-[#2B4A73] border-[#C7D6EA]',
  'IN DEVELOPMENT': 'bg-navy-50 text-navy-500 border-navy-200',
  'SOLD OUT': 'bg-[#F6F1E8] text-navy-500 border-navy-200',
  'CREATIVE UPDATE': 'bg-[#F3EDE4] text-navy-600 border-navy-100',
  'NEW EXPERIENCE': 'bg-golden-500/12 text-navy-600 border-golden-500/30',
  'READER STORIES': 'bg-[#EDE8F4] text-navy-600 border-[#D4C8E8]',
  'INDUSTRY EVENT': 'bg-navy-500/8 text-navy-600 border-navy-300/60',
};

const JOURNEY_ENTRIES: JourneyEntry[] = [
  {
    date: 'MAY 2026',
    status: 'NOW OPEN',
    title: 'Camp Courage Opened',
    body: 'Camp Courage officially opened its first pilot experience for kids ages 7–12. The experience combines storytelling, SEL activities, creativity, and interactive moments inspired by the world of Caiden Vale.',
    thumbnail: '/images/camp-courage/stackworksheets.webp',
    thumbnailAlt: 'Camp Courage printable tools and worksheets',
  },
  {
    date: 'MAY 2026',
    status: 'INDUSTRY EVENT',
    title: 'Caiden Vale Arrived at Licensing Expo',
    body: 'The world of Caiden Vale was showcased during Licensing Expo 2026 in Las Vegas — where conversations began around publishing, interactive storytelling, educational experiences, and future franchise opportunities inspired by the universe.',
    thumbnail: '/images/gallery/expo_td.webp',
    thumbnailAlt: 'Caiden Vale at Licensing Expo 2026',
  },
  {
    date: 'MAY 2026',
    status: 'COMMUNITY',
    title: 'Kids Started Submitting Artwork',
    body: 'Young readers have started submitting their own character drawings, Focus Flames, and world concepts to the Caiden\'s Courage gallery — turning the story into a shared creative universe.',
    thumbnail: '/images/gallery/marina_bre.webp',
    thumbnailAlt: 'Kid-submitted artwork from the gallery',
  },
  {
    date: 'MAY 2026',
    status: 'IN DEVELOPMENT',
    title: 'Focus Flame Lab Entered Development',
    body: 'Development officially began on the Focus Flame Lab — an interactive story experience where kids help Caiden navigate emotions, bravery, and focus through gameplay and creative choices.',
    thumbnail: '/images/focus-flame-lab/thepath.webp',
    thumbnailAlt: 'Focus Flame Lab development preview',
  },
  {
    date: 'APRIL 2026',
    status: 'READER STORIES',
    title: 'First Reader Feedback Arrived',
    body: 'Parents began sharing stories about reluctant readers connecting with the visuals, humor, and emotional storytelling. Some kids even started creating their own characters after reading.',
    thumbnail: '/images/focus-flame-lab/themove_intro_image.webp',
    thumbnailAlt: 'Reader connecting with Caiden\'s story',
  },
  {
    date: 'MARCH 2026',
    status: 'CREATIVE UPDATE',
    title: 'The Story Expanded',
    body: 'Caiden’s world expanded into a 132-page hardcover graphic novel — a larger fantasy adventure filled with hidden realms, ancient guardians, and adventures still unfolding.',
    thumbnail: '/images/Comic5_Coverpage_header_2_smaller.webp',
    thumbnailAlt: 'Expanded graphic novel preview',
  },
  {
    date: 'MARCH 2026',
    status: 'SOLD OUT',
    title: "Founder's Edition Sold Out",
    body: 'All 45 Founder\'s Edition copies found their homes. Early supporters helped bring the first hardcover printing to life — and showed that this universe already had a community ready to grow with it.',
  },
  {
    date: 'MARCH 2026',
    status: 'NEW EXPERIENCE',
    title: 'The Courage Companion',
    body: 'The Courage Companion joined the growing ecosystem — an activity workbook where kids explore focus, creativity, and storytelling alongside Caiden\'s world, not just within its pages.',
  },
];

function StatusPill({ status }: { status: JourneyStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

function JourneyCard({ entry }: { entry: JourneyEntry }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-navy-100 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-4 flex flex-wrap items-center gap-2 sm:gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-navy-400 sm:text-sm">
          {entry.date}
        </p>
        <StatusPill status={entry.status} />
      </div>

      <div className="flex flex-col gap-5 sm:flex-row sm:gap-6">
        <div className="shrink-0 sm:w-[140px]">
          {entry.thumbnail ? (
            <div className="overflow-hidden rounded-xl border border-navy-100/80 bg-[#F6F1E8]">
              <img
                src={entry.thumbnail}
                alt={entry.thumbnailAlt ?? ''}
                className="aspect-[4/3] h-auto w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          ) : (
            <div
              className="flex aspect-[4/3] items-center justify-center rounded-xl border border-dashed border-navy-200/80 bg-[#FAF9F7]"
              aria-hidden="true"
            >
              <svg className="h-8 w-8 text-navy-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="1.5" />
                <circle cx="8.5" cy="10" r="1.5" fill="currentColor" stroke="none" />
                <path d="M3 15l5-4 4 3 4-5 5 6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl font-bold text-navy-500 sm:text-2xl">{entry.title}</h2>
          <p className="mt-3 text-base leading-relaxed text-navy-600 sm:text-lg">{entry.body}</p>
        </div>
      </div>
    </article>
  );
}

const Journey: React.FC = () => {
  const [, setIsComingSoonModalOpen] = useState(false);

  const handleComingSoonClick = useCallback(() => {
    setIsComingSoonModalOpen(true);
  }, []);

  useEffect(() => {
    document.title = "World Updates | Caiden's Courage";
  }, []);

  return (
    <div className="min-h-screen bg-cream font-body">
      <Header onComingSoonClick={handleComingSoonClick} />

      <BluePageHeader
        eyebrow="CAIDEN VALE"
        title="World Updates"
        description="Follow the evolution of Caiden Vale — from early sketches and first printings to interactive experiences, community creativity, and new adventures."
        badge="Living timeline"
      />

      <div className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8" style={{ marginTop: '70px' }}>
        <div className="relative mx-auto max-w-3xl">
          <div
            className="pointer-events-none absolute bottom-6 left-[11px] top-3 w-px bg-gradient-to-b from-golden-500/50 via-navy-200 to-navy-100 sm:left-[13px]"
            aria-hidden="true"
          />

          <ul className="relative space-y-8 sm:space-y-10">
            {JOURNEY_ENTRIES.map((entry) => (
              <li key={`${entry.date}-${entry.title}`} className="relative pl-8 sm:pl-10">
                <div
                  className="absolute left-0 top-7 flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-golden-500/70 bg-cream shadow-[0_0_0_3px_#FAF9F7]"
                  aria-hidden="true"
                >
                  <span className="h-2 w-2 rounded-full bg-golden-500" />
                </div>
                <JourneyCard entry={entry} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-cream px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-6 text-lg text-navy-600 sm:text-xl">
            Pre-orders for the first print are still open — and the world keeps growing.
          </p>
          <Link to={STORY_BOOKS_PATH}>
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              Pre-order Now
            </Button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Journey;
