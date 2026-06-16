import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  FAMILY_SIDEBAR_NAV,
  type FamilySidebarNavItem,
} from '../../data/familyPortalContent';
import {
  isCharacterHubRoute,
  resolveFamilyBasePath,
} from '../../lib/familyPortalNav';
import { isWeeklyAdventureSource } from '../../lib/weeklyAdventureRouteContext';
import { useFamilyGalleryNewApprovedCount } from '../../hooks/useGalleryNavCounts';
import { formatGalleryNavLabel } from '../../lib/galleryNavCounts';
import { resetPortalScroll } from '../../lib/portalScroll';
import FamilyNavIcon from './FamilyNavIcon';
import BrandLogo from '../../design-system/components/BrandLogo';
import FamilyProgramSettingsRailCard from './FamilyProgramSettingsRailCard';
import FamilyUpgradeRailCard from './FamilyUpgradeRailCard';

type FamilyDashboardSidebarProps = {
  navItems?: FamilySidebarNavItem[];
  programCode?: string;
  showUpgradeCard?: boolean;
  variant?: 'rail' | 'drawer';
  onNavigate?: () => void;
  showRailCopyright?: boolean;
};

export default function FamilyDashboardSidebar({
  navItems = FAMILY_SIDEBAR_NAV,
  programCode,
  showUpgradeCard = true,
  variant = 'rail',
  onNavigate,
  showRailCopyright,
}: FamilyDashboardSidebarProps) {
  const galleryNewCount = useFamilyGalleryNewApprovedCount(programCode);
  const location = useLocation();
  const basePath = resolveFamilyBasePath(location.pathname);
  const weeklyLaunch = isWeeklyAdventureSource(location.search);
  const onCharacterRoute = isCharacterHubRoute(location.pathname, basePath) && !weeklyLaunch;
  const showCopyright = showRailCopyright ?? variant !== 'drawer';

  const handleNavClick = () => {
    resetPortalScroll();
    onNavigate?.();
  };

  return (
    <aside
      className={[
        'family-rail',
        variant === 'drawer' ? 'family-rail--drawer' : '',
        showUpgradeCard ? 'family-rail--hasUpgrade' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="Family portal navigation"
    >
      <div className="family-railUpper">
        <div className="family-railBrand">
          <BrandLogo
            variant="family"
            size="portalWordmark"
            className="family-railBrandLogo"
            decorative
          />
        </div>

        <nav className="family-railNav" aria-label="Dashboard sections">
          <ul className="family-railNavList">
            {navItems.map((item) => {
              const characterHubActive = item.id === 'character-hub' && onCharacterRoute;
              const weeklyAdventuresActive =
                item.id === 'continue-learning' && weeklyLaunch;

              return (
                <li key={item.id}>
                  <NavLink
                    to={item.path}
                    end={item.id === 'overview'}
                    onClick={handleNavClick}
                    className={({ isActive }) => {
                      const active = isActive || characterHubActive || weeklyAdventuresActive;
                      return `family-railNavLink${active ? ' family-railNavLink--active' : ''}`;
                    }}
                  >
                    <span className="family-railIcon">
                      <FamilyNavIcon name={item.icon} />
                    </span>
                    <span className="family-railNavLabel">
                      {item.id === 'gallery'
                        ? formatGalleryNavLabel(item.label, galleryNewCount)
                        : item.label}
                    </span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="family-railFooter">
        <FamilyProgramSettingsRailCard />
        {showUpgradeCard ? <FamilyUpgradeRailCard /> : null}
        {showCopyright ? (
          <p className="family-railCopyright">© 2026 Caiden&apos;s Courage™ Family Portal</p>
        ) : null}
      </div>
    </aside>
  );
}
