import React, { useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  FAMILY_PORTAL_BRAND,
  FAMILY_PORTAL_SUBBRAND,
  FAMILY_SIDEBAR_NAV,
  type FamilySidebarNavItem,
} from '../../data/familyPortalContent';
import {
  isCharacterHubRoute,
  resolveFamilyBasePath,
} from '../../lib/familyPortalNav';
import { useFamilyGalleryNewApprovedCount } from '../../hooks/useGalleryNavCounts';
import { formatGalleryNavLabel } from '../../lib/galleryNavCounts';
import FamilyNavIcon from './FamilyNavIcon';
import FamilyUpgradeRailCard from './FamilyUpgradeRailCard';

type FamilyDashboardSidebarProps = {
  navItems?: FamilySidebarNavItem[];
  brandTitle?: string;
  brandSubtitle?: string;
  programCode?: string;
  showUpgradeCard?: boolean;
};

export default function FamilyDashboardSidebar({
  navItems = FAMILY_SIDEBAR_NAV,
  brandTitle = FAMILY_PORTAL_BRAND,
  brandSubtitle = FAMILY_PORTAL_SUBBRAND,
  programCode,
  showUpgradeCard = true,
}: FamilyDashboardSidebarProps) {
  const galleryNewCount = useFamilyGalleryNewApprovedCount(programCode);
  const location = useLocation();
  const basePath = resolveFamilyBasePath(location.pathname);
  const onCharacterRoute = isCharacterHubRoute(location.pathname, basePath);

  const handleNavClick = useCallback(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    document.querySelector('.family-content')?.scrollTo(0, 0);
  }, []);

  return (
    <aside className="family-rail" aria-label="Family portal navigation">
      <div className="family-railBrand">
        <p className="family-railBrandTitle">{brandTitle}</p>
        <p className="family-railBrandSub">{brandSubtitle}</p>
      </div>

      <nav className="family-railNav" aria-label="Dashboard sections">
        <ul className="family-railNavList">
          {navItems.map((item) => {
            const characterHubActive = item.id === 'character-hub' && onCharacterRoute;

            return (
              <li key={item.id}>
                <NavLink
                  to={item.path}
                  end={item.id === 'overview'}
                  onClick={handleNavClick}
                  className={({ isActive }) => {
                    const active = isActive || characterHubActive;
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

      {showUpgradeCard ? <FamilyUpgradeRailCard /> : null}
    </aside>
  );
}
