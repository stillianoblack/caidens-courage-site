import React from 'react';
import FamilyValueCards from '../FamilyValueCards';

export default function FamilyGameHubPanel() {
  return (
    <div className="family-panel">
      <p className="family-panelIntro">
        Jump into character games, focus missions, and interactive story activities.
      </p>
      <FamilyValueCards />
    </div>
  );
}
