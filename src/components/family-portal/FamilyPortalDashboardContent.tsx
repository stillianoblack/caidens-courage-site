import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import FamilyCertificatesPanel from './panels/FamilyCertificatesPanel';
import FamilyCharactersPanel from './panels/FamilyCharactersPanel';
import FamilyContinueLearningPanel from './panels/FamilyContinueLearningPanel';
import FamilyDownloadsPanel from './panels/FamilyDownloadsPanel';
import FamilyGalleryPanel from './panels/FamilyGalleryPanel';
import FamilyGuidePanel from './panels/FamilyGuidePanel';
import FamilyOverviewPanel from './panels/FamilyOverviewPanel';
import { isFamilyNestedRoute, resolvePortalNavId } from '../../lib/familyPortalNav';

type FamilyPortalDashboardContentProps = {
  basePath: string;
};

/**
 * Main family portal panels — same tab-panel pattern as ProgramDashboardPage.
 * Nested routes (character profiles, kids games, adult guide) use Outlet.
 */
export default function FamilyPortalDashboardContent({ basePath }: FamilyPortalDashboardContentProps) {
  const location = useLocation();
  const activeNav = resolvePortalNavId(location.pathname, basePath);
  const showOutlet = isFamilyNestedRoute(location.pathname, basePath);

  if (showOutlet) {
    return <Outlet key={location.pathname} />;
  }

  return (
    <>
      <div role="tabpanel" hidden={activeNav !== 'overview'} className="family-tabPanel">
        <FamilyOverviewPanel />
      </div>

      <div role="tabpanel" hidden={activeNav !== 'continue-learning'} className="family-tabPanel">
        <FamilyContinueLearningPanel />
      </div>

      <div role="tabpanel" hidden={activeNav !== 'character-hub'} className="family-tabPanel">
        <FamilyCharactersPanel />
      </div>

      <div role="tabpanel" hidden={activeNav !== 'downloads'} className="family-tabPanel">
        <FamilyDownloadsPanel />
      </div>

      <div role="tabpanel" hidden={activeNav !== 'gallery'} className="family-tabPanel">
        <FamilyGalleryPanel />
      </div>

      <div role="tabpanel" hidden={activeNav !== 'certificates'} className="family-tabPanel">
        <FamilyCertificatesPanel />
      </div>

      <div role="tabpanel" hidden={activeNav !== 'guide'} className="family-tabPanel">
        <FamilyGuidePanel />
      </div>
    </>
  );
}
