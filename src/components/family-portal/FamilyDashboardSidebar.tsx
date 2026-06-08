import React from 'react';
import {
  FAMILY_PORTAL_BRAND,
  FAMILY_PORTAL_SUBBRAND,
  FAMILY_SIDEBAR_NAV,
  type FamilySidebarNavId,
  type FamilySidebarNavItem,
} from '../../data/familyPortalContent';
import { useFamilyGalleryNewApprovedCount } from '../../hooks/useGalleryNavCounts';
import { formatGalleryNavLabel } from '../../lib/galleryNavCounts';
import FamilyNavIcon from './FamilyNavIcon';
import FamilyUpgradeRailCard from './FamilyUpgradeRailCard';

type FamilyDashboardSidebarProps = {
  activeId: FamilySidebarNavId;
  onSelect: (id: FamilySidebarNavId) => void;
  navItems?: FamilySidebarNavItem[];
  brandTitle?: string;
  brandSubtitle?: string;
  programCode?: string;
  showUpgradeCard?: boolean;
};

export default function FamilyDashboardSidebar({
  activeId,
  onSelect,
  navItems = FAMILY_SIDEBAR_NAV,
  brandTitle = FAMILY_PORTAL_BRAND,
  brandSubtitle = FAMILY_PORTAL_SUBBRAND,
  programCode,
  showUpgradeCard = true,
}: FamilyDashboardSidebarProps) {
  const galleryNewCount = useFamilyGalleryNewApprovedCount(programCode);

  return (
    <aside className="family-rail" aria-label="Family portal navigation">
      <div className="family-railBrand">
        <p className="family-railBrandTitle">{brandTitle}</p>
        <p className="family-railBrandSub">{brandSubtitle}</p>
      </div>

      <nav className="family-railNav" role="tablist" aria-label="Dashboard sections">
        <ul className="family-railNavList">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                role="tab"
                aria-selected={activeId === item.id}
                className={`family-railNavLink${activeId === item.id ? ' family-railNavLink--active' : ''}`}
                onClick={() => onSelect(item.id)}
              >
                <span className="family-railIcon">
                  <FamilyNavIcon name={item.icon} />
                </span>
                <span className="family-railNavLabel">
                  {item.id === 'gallery'
                    ? formatGalleryNavLabel(item.label, galleryNewCount)
                    : item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {showUpgradeCard ? <FamilyUpgradeRailCard /> : null}
    </aside>
  );
}
