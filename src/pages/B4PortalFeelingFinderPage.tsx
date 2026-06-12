import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import GameAssessmentFlow from '../components/game-assessment/GameAssessmentFlow';
import { B4_FEELING_FINDER_CONFIG } from '../data/b4/b4FeelingFinder';
import { resolveB4HubPath, resolvePortalFamilyShellPath } from '../lib/portalGamePaths';

export default function B4PortalFeelingFinderPage() {
  const location = useLocation();

  useEffect(() => {
    document.title = `${B4_FEELING_FINDER_CONFIG.landing.title} | Caiden's Courage`;
  }, []);

  return (
    <GameAssessmentFlow
      config={B4_FEELING_FINDER_CONFIG}
      themeClassName="b4-game"
      useB4Header
      exitPath={resolveB4HubPath(location.pathname)}
      embedded
      familyPortalPath={resolvePortalFamilyShellPath(location.pathname)}
    />
  );
}
