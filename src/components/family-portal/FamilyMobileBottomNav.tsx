import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import KidsAdventureIcon from '../../design-system/kids-adventure/KidsAdventureIcon';
import { useActiveChild } from '../../hooks/useActiveChild';
import { useFamilyDashboardMetrics } from '../../hooks/useFamilyDashboardMetrics';
import { useInventoryNotificationBadge } from '../../hooks/useInventoryNotificationBadge';
import { familyPortalPath, familySettingsPath } from '../../lib/familyPortalPaths';
import { resolveFamilyBasePath } from '../../lib/familyPortalNav';
import { resolveTrackingProgramCode } from '../../lib/activeProgramContext';
import MobileBottomNavigation, {
  type MobileBottomNavigationItem,
} from '../navigation/MobileBottomNavigation';

export type FamilyMobileBottomNavId =
  | 'home'
  | 'adventures'
  | 'characters'
  | 'inventory'
  | 'profile';

type FamilyMobileBottomNavIconId = 'home' | 'adventures' | 'characters' | 'inventory' | 'settings';

const NAV_ICON_MAP: Record<FamilyMobileBottomNavId, FamilyMobileBottomNavIconId> = {
  home: 'home',
  adventures: 'adventures',
  characters: 'characters',
  inventory: 'inventory',
  profile: 'settings',
};

function buildNavItems(
  basePath: string,
  activeId: FamilyMobileBottomNavId,
  inventoryBadgeCount: number,
): MobileBottomNavigationItem[] {
  const defs: Array<{ id: FamilyMobileBottomNavId; label: string; path: string }> = [
    { id: 'home', label: 'Home', path: basePath },
    { id: 'adventures', label: 'Adventures', path: familyPortalPath('weekly-adventures', basePath) },
    { id: 'characters', label: 'Characters', path: familyPortalPath('characters', basePath) },
    { id: 'inventory', label: 'Inventory', path: familyPortalPath('inventory', basePath) },
    { id: 'profile', label: 'Profile', path: familySettingsPath(basePath) },
  ];

  return defs.map((item) => ({
    id: item.id,
    label: item.label,
    href: item.path,
    badgeCount: item.id === 'inventory' ? inventoryBadgeCount : undefined,
    icon: (
      <KidsAdventureIcon
        name={NAV_ICON_MAP[item.id]}
        className="mobileBottomNavIcon"
        size={26}
        filled={item.id === activeId}
      />
    ),
  }));
}

function resolveActiveNavId(pathname: string, basePath: string): FamilyMobileBottomNavId {
  const remainder = pathname.startsWith(basePath)
    ? pathname.slice(basePath.length).replace(/^\//, '')
    : pathname.replace(/^\//, '');

  if (!remainder) return 'home';

  if (
    remainder.startsWith('continue-learning') ||
    remainder.startsWith('weekly-adventures') ||
    remainder.includes('baseline-check')
  ) {
    return 'adventures';
  }

  if (remainder.startsWith('characters') || remainder.startsWith('children')) {
    return 'characters';
  }

  if (remainder.startsWith('inventory')) {
    return 'inventory';
  }

  if (
    remainder.startsWith('settings') ||
    remainder.startsWith('results') ||
    remainder.startsWith('downloads') ||
    remainder.startsWith('gallery') ||
    remainder.startsWith('certificates') ||
    remainder.startsWith('guide')
  ) {
    return 'profile';
  }

  return 'home';
}

export default function FamilyMobileBottomNav() {
  const location = useLocation();
  const basePath = resolveFamilyBasePath(location.pathname);
  const activeId = resolveActiveNavId(location.pathname, basePath);
  const programCode = resolveTrackingProgramCode() ?? undefined;
  const { visibleChildren } = useFamilyDashboardMetrics(programCode);
  const selectableChildren = useMemo(
    () =>
      visibleChildren
        .map((child) => ({
          participantId: child.studentId,
          displayName: child.displayName,
          firstName: child.displayName,
        }))
        .filter((child) => Boolean(child.participantId)),
    [visibleChildren],
  );
  const { activeChild } = useActiveChild(selectableChildren);
  const inventoryBadgeCount = useInventoryNotificationBadge(activeChild?.participantId);
  const items = useMemo(
    () => buildNavItems(basePath, activeId, inventoryBadgeCount),
    [activeId, basePath, inventoryBadgeCount],
  );

  return (
    <MobileBottomNavigation
      items={items}
      activeItem={activeId}
      variant="family"
      ariaLabel="Family Portal navigation"
    />
  );
}
