import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  FAMILY_PORTAL_BRAND,
  FAMILY_PORTAL_SUBBRAND,
  FAMILY_SIDEBAR_NAV,
} from '../../data/familyPortalContent';
import { isGameHubRoute } from '../../lib/familyPortalNav';
import FamilyNavIcon from './FamilyNavIcon';

export default function FamilyDashboardSidebar() {
  const location = useLocation();
  const onGameRoute = isGameHubRoute(location.pathname);

  return (
    <aside className="family-rail" aria-label="Family portal navigation">
      <div className="family-railBrand">
        <p className="family-railBrandTitle">{FAMILY_PORTAL_BRAND}</p>
        <p className="family-railBrandSub">{FAMILY_PORTAL_SUBBRAND}</p>
      </div>

      <nav className="family-railNav" aria-label="Dashboard sections">
        <ul className="family-railNavList">
          {FAMILY_SIDEBAR_NAV.map((item) => {
            const gameHubActive = item.id === 'games' && onGameRoute;
            return (
              <li key={item.id}>
                <NavLink
                  to={item.path}
                  end={item.id === 'overview'}
                  className={({ isActive }) => {
                    const active = isActive || gameHubActive;
                    return `family-railNavLink${active ? ' family-railNavLink--active' : ''}`;
                  }}
                >
                  <span className="family-railIcon">
                    <FamilyNavIcon name={item.icon} />
                  </span>
                  <span className="family-railNavLabel">
                    {item.label}
                    {gameHubActive ? (
                      <span className="family-railActiveDot" aria-hidden="true">
                        ›
                      </span>
                    ) : null}
                  </span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
