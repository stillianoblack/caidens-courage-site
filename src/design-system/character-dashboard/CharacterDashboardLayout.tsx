import React from 'react';
import { useLocation } from 'react-router-dom';
import PortalBreadcrumb from '../../components/portal/PortalBreadcrumb';
import FocusCoinWalletBadge from '../../components/rewards/FocusCoinWalletBadge';
import MissionCoachCard from '../components/MissionCoachCard';
import type { MissionCoachCardProps } from '../components/MissionCoachCard';
import {
  readPortalReturnState,
  resolveDashboardBreadcrumb,
  resolveFacilitatorReturnFallback,
} from '../../lib/portalBreadcrumbNav';
import { PROGRAM_DASHBOARD_PATH } from '../../config/courageRoutes';
import CharacterHeroCard, { type CharacterHeroCardProps } from './CharacterHeroCard';
import './character-dashboard.css';

export type CharacterDashboardLayoutProps = {
  characterId: string;
  theme?: string;
  hero: CharacterHeroCardProps;
  coach: MissionCoachCardProps;
  quests: React.ReactNode;
  footer?: React.ReactNode;
  /** When true, match embedded portal content inset (gameplay-aligned breadcrumb) */
  portalInset?: boolean;
  breadcrumbLabel?: string;
  breadcrumbHref?: string;
  className?: string;
};

function resolveDashboardBack(location: ReturnType<typeof useLocation>): { label: string; href: string } {
  const fromState = readPortalReturnState(location.search, location.state);
  if (fromState) {
    return fromState;
  }

  if (location.pathname.startsWith(PROGRAM_DASHBOARD_PATH)) {
    return resolveFacilitatorReturnFallback(location.pathname);
  }

  return resolveDashboardBreadcrumb(location.pathname);
}

export default function CharacterDashboardLayout({
  characterId,
  theme,
  hero,
  coach,
  quests,
  footer,
  portalInset = true,
  breadcrumbLabel,
  breadcrumbHref,
  className = '',
}: CharacterDashboardLayoutProps) {
  const location = useLocation();
  const fallbackBack = resolveDashboardBack(location);
  const backLabel = breadcrumbLabel ?? fallbackBack.label;
  const backHref = breadcrumbHref ?? fallbackBack.href;

  return (
    <div
      className={[
        'character-dashboard',
        portalInset ? 'character-dashboard--portalInset' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-character-dashboard={characterId}
    >
      <div className="character-dashboard-grid">
        <div className="character-dashboard-breadcrumb">
          <div className="character-dashboard-breadcrumbRow">
            <PortalBreadcrumb
              label={backLabel}
              href={backHref}
              theme={theme ?? characterId}
              variant="game"
            />
            <FocusCoinWalletBadge compact />
          </div>
        </div>

        <div className="character-dashboard-hero">
          <CharacterHeroCard {...hero} theme={hero.theme ?? (characterId as CharacterHeroCardProps['theme'])} />
        </div>

        <aside className="character-dashboard-rail" aria-label="Mission coach">
          <MissionCoachCard {...coach} variant="family" compact />
        </aside>

        <div className="character-dashboard-quests">
          {quests}
          {footer ?? null}
        </div>
      </div>
    </div>
  );
}
