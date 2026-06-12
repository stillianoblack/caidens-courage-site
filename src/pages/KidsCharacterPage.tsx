import React, { useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import PortalSmartBackButton from '../components/family-portal/PortalSmartBackButton';
import ZekeCharacterDashboard from '../components/zeke/ZekeCharacterDashboard';
import '../components/family-portal/family-dashboard.css';
import { setPortalReturnPath } from '../lib/portalReturnNav';
import {
  B4_GUIDE_PATH,
  FOCUS_FLAME_LAB_PATH,
  MIRANDA_MYSTERY_FILES_PATH,
} from '../config/courageRoutes';

type KidsCharacterId = 'caiden' | 'miranda' | 'b4' | 'zeke';

const CHARACTER_CONTENT: Record<
  KidsCharacterId,
  { title: string; description: string; cta: string; href: string; comingSoon?: boolean }
> = {
  caiden: {
    title: "Caiden's Focus Flame Journey",
    description: "Follow Caiden's story and discover how focus becomes power.",
    cta: 'Open Focus Flame Lab',
    href: FOCUS_FLAME_LAB_PATH,
  },
  miranda: {
    title: "Miranda's Mystery Files",
    description: 'Read clues, solve mysteries, and build reading skills.',
    cta: 'Open Mystery Files',
    href: MIRANDA_MYSTERY_FILES_PATH,
  },
  b4: {
    title: 'B-4 Focus Missions',
    description: 'Practice focus moves, feelings check-ins, and brave choices.',
    cta: 'Open B-4 Guide',
    href: B4_GUIDE_PATH,
  },
  zeke: {
    title: "Zeke's Logic Lab",
    description: 'Patterns, puzzles, and critical-thinking challenges.',
    cta: 'Preview',
    href: '#',
    comingSoon: true,
  },
};

type KidsCharacterPageProps = {
  character: KidsCharacterId;
};

export default function KidsCharacterPage({ character }: KidsCharacterPageProps) {
  const content = CHARACTER_CONTENT[character];
  const location = useLocation();

  useEffect(() => {
    document.title = `${content.title} | Caiden's Courage`;
  }, [content.title]);

  if (character === 'miranda') {
    const from =
      new URLSearchParams(location.search).get('from') ?? undefined;
    const target = from
      ? `${MIRANDA_MYSTERY_FILES_PATH}?from=${encodeURIComponent(from)}`
      : MIRANDA_MYSTERY_FILES_PATH;
    return <Navigate to={target} replace />;
  }

  if (character === 'zeke') {
    return <ZekeCharacterDashboard />;
  }

  return (
    <main className="family-kidsHub">
      <PortalSmartBackButton />
      <h1 className="family-kidsHubTitle">{content.title}</h1>
      <p className="family-kidsHubIntro">{content.description}</p>
      {content.comingSoon ? (
        <p className="family-emptyNote">
          Coming soon — check back for Zeke&apos;s Logic Lab adventures.
        </p>
      ) : (
        <Link
          to={content.href}
          onClick={() => setPortalReturnPath(location.pathname)}
          className="family-nextCta"
        >
          {content.cta}
        </Link>
      )}
    </main>
  );
}
