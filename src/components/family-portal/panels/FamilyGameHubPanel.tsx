import React from 'react';
import { PortalPageIntro } from '../../portal-design-system';
import FamilyValueCards from '../FamilyValueCards';

export default function FamilyGameHubPanel() {
  return (
    <div className="family-panel">
      <PortalPageIntro>
        Jump into character games, focus missions, and interactive story activities.
      </PortalPageIntro>
      <FamilyValueCards />
    </div>
  );
}
