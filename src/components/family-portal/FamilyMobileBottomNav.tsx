import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { familyPortalPath, familySettingsPath } from '../../lib/familyPortalPaths';
import { resolveFamilyBasePath } from '../../lib/familyPortalNav';
import KidsAdventureIcon from '../../design-system/kids-adventure/KidsAdventureIcon';
import './family-mobile-bottom-nav.css';

export type FamilyMobileBottomNavId =
  | 'home'
  | 'adventures'
  | 'characters'
  | 'inventory'
  | 'profile';

type FamilyMobileBottomNavIconId = 'home' | 'adventures' | 'characters' | 'inventory' | 'settings';

type NavItem = {
  id: FamilyMobileBottomNavId;
  label: string;
  path: string;
  icon: FamilyMobileBottomNavIconId;
};

const NAV_ICON_MAP: Record<FamilyMobileBottomNavId, FamilyMobileBottomNavIconId> = {
  home: 'home',
  adventures: 'adventures',
  characters: 'characters',
  inventory: 'inventory',
  profile: 'settings',
};

function buildNavItems(basePath: string): NavItem[] {
  return [
    { id: 'home', label: 'Home', path: basePath, icon: NAV_ICON_MAP.home },
    {
      id: 'adventures',
      label: 'Adventures',
      path: familyPortalPath('weekly-adventures', basePath),
      icon: NAV_ICON_MAP.adventures,
    },
    {
      id: 'characters',
      label: 'Characters',
      path: familyPortalPath('characters', basePath),
      icon: NAV_ICON_MAP.characters,
    },
    {
      id: 'inventory',
      label: 'Inventory',
      path: familyPortalPath('inventory', basePath),
      icon: NAV_ICON_MAP.inventory,
    },
    {
      id: 'profile',
      label: 'Profile',
      path: familySettingsPath(basePath),
      icon: NAV_ICON_MAP.profile,
    },
  ];
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
  const items = buildNavItems(basePath);
  const activeId = resolveActiveNavId(location.pathname, basePath);

  return (
    <nav className="family-mobileBottomNav" aria-label="Family Portal navigation">
      <ul className="family-mobileBottomNavList">
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <li key={item.id} className="family-mobileBottomNavItem">
              <Link
                to={item.path}
                className={[
                  'family-mobileBottomNavLink',
                  active ? 'family-mobileBottomNavLink--active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-current={active ? 'page' : undefined}
                aria-label={item.label}
                title={item.label}
              >
                <KidsAdventureIcon
                  name={item.icon}
                  className="family-mobileBottomNavIcon"
                  size={26}
                  filled={active}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
