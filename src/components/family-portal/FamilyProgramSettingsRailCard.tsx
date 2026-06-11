import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { familySettingsPath } from '../../lib/familyPortalPaths';
import { resetPortalScroll } from '../../lib/portalScroll';

export default function FamilyProgramSettingsRailCard() {
  const location = useLocation();
  const settingsPath = familySettingsPath(location.pathname);

  return (
    <div className="family-railSettings">
      <NavLink
        to={settingsPath}
        onClick={resetPortalScroll}
        className={({ isActive }) =>
          `family-railSettingsLink${isActive ? ' family-railSettingsLink--active' : ''}`
        }
      >
        Settings
      </NavLink>
    </div>
  );
}
