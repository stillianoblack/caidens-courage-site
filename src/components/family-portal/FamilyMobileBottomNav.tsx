import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import KidsAdventureIcon from '../../design-system/kids-adventure/KidsAdventureIcon';
import { familyPortalPath, familySettingsPath } from '../../lib/familyPortalPaths';
import { resolveFamilyBasePath } from '../../lib/familyPortalNav';
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

function buildNavItems(basePath: string, activeId: FamilyMobileBottomNavId): MobileBottomNavigationItem[] {
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
  const items = useMemo(
    () => buildNavItems(basePath, activeId),
    [activeId, basePath],
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
