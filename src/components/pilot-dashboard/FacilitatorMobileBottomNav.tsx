import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  FACILITATOR_BOTTOM_NAV,
  facilitatorTabPath,
  resolveFacilitatorActiveTab,
  resolveFacilitatorBottomNavId,
} from '../../lib/facilitatorMobileNav';
import type { FacilitatorBottomNavBadges } from '../../hooks/useFacilitatorBottomNavBadges';
import MobileBottomNavigation, {
  type MobileBottomNavigationItem,
} from '../navigation/MobileBottomNavigation';
import PilotNavIcon from './PilotNavIcon';

type FacilitatorMobileBottomNavProps = {
  onOpenMore: () => void;
  badges?: FacilitatorBottomNavBadges;
};

function MoreIcon() {
  return (
    <svg className="pilot-railIconSvg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="6" cy="12" r="1.75" fill="currentColor" />
      <circle cx="12" cy="12" r="1.75" fill="currentColor" />
      <circle cx="18" cy="12" r="1.75" fill="currentColor" />
    </svg>
  );
}

export default function FacilitatorMobileBottomNav({
  onOpenMore,
  badges = {},
}: FacilitatorMobileBottomNavProps) {
  const location = useLocation();
  const activeTab = resolveFacilitatorActiveTab(location.pathname, location.hash);
  const activeBottomId = resolveFacilitatorBottomNavId(activeTab);

  const items = useMemo<MobileBottomNavigationItem[]>(
    () =>
      FACILITATOR_BOTTOM_NAV.map((item) => {
        const badgeCount = badges[item.id];

        if (item.id === 'more') {
          return {
            id: item.id,
            label: item.label,
            onClick: onOpenMore,
            badgeCount,
            icon: <MoreIcon />,
          };
        }

        const tab = item.tab as Exclude<typeof item.tab, 'more'>;
        return {
          id: item.id,
          label: item.label,
          href: facilitatorTabPath(tab, location.pathname),
          badgeCount,
          icon: <PilotNavIcon name={tab} />,
        };
      }),
    [badges, location.pathname, onOpenMore],
  );

  return (
    <MobileBottomNavigation
      items={items}
      activeItem={activeBottomId}
      variant="facilitator"
      ariaLabel="Facilitator portal navigation"
    />
  );
}
