import React from 'react';
import { useLocation } from 'react-router-dom';
import FamilyCertificatesPanel from './panels/FamilyCertificatesPanel';
import FamilyCharactersPanel from './panels/FamilyCharactersPanel';
import FamilyContinueLearningPanel from './panels/FamilyContinueLearningPanel';
import FamilyDownloadsPanel from './panels/FamilyDownloadsPanel';
import FamilyGalleryPanel from './panels/FamilyGalleryPanel';
import FamilyGuidePanel from './panels/FamilyGuidePanel';
import FamilyOverviewPanel from './panels/FamilyOverviewPanel';
import type { FamilySidebarNavId } from '../../data/familyPortalContent';
import { resolvePortalNavId } from '../../lib/familyPortalNav';

type FamilyPortalDashboardContentProps = {
  basePath: string;
};

function renderActivePanel(activeNav: FamilySidebarNavId): React.ReactNode {
  switch (activeNav) {
    case 'continue-learning':
      return <FamilyContinueLearningPanel />;
    case 'character-hub':
      return <FamilyCharactersPanel />;
    case 'downloads':
      return <FamilyDownloadsPanel />;
    case 'gallery':
      return <FamilyGalleryPanel />;
    case 'certificates':
      return <FamilyCertificatesPanel />;
    case 'guide':
      return <FamilyGuidePanel />;
    case 'overview':
    default:
      return <FamilyOverviewPanel />;
  }
}

/** Main family portal panels — tab-panel pattern keyed off location.pathname. */
export default function FamilyPortalDashboardContent({ basePath }: FamilyPortalDashboardContentProps) {
  const location = useLocation();
  const activeNav = resolvePortalNavId(location.pathname, basePath);

  return <div className="family-tabPanel">{renderActivePanel(activeNav)}</div>;
}
