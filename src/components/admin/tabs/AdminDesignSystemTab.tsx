import React from 'react';
import { Link } from 'react-router-dom';
import { DESIGN_SYSTEM_PATH } from '../../../config/courageRoutes';
import { ADMIN_DESIGN_SYSTEM_SECTIONS } from '../../../data/adminPortalContent';
import SettingsCard from '../../family-portal/settings/SettingsCard';

export default function AdminDesignSystemTab() {
  return (
    <SettingsCard
      title="Design System"
      subtitle="Read-only references for the Focus Flame design system used across Family, Facilitator, and Kids experiences."
    >
      <p className="adminPortal-cardSub">
        Open the full interactive design system page for live component previews, tokens, and
        interaction patterns.
      </p>
      <Link to={DESIGN_SYSTEM_PATH} className="adminPortal-btn adminPortal-btn--primary">
        Open Design System
      </Link>

      <ul className="adminPortal-designList">
        {ADMIN_DESIGN_SYSTEM_SECTIONS.map((section) => (
          <li key={section}>{section}</li>
        ))}
      </ul>
    </SettingsCard>
  );
}
