import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import B4GuideFlow from '../components/b4/B4GuideFlow';
import '../components/b4/b4-portal-hub.css';
import '../components/b4-guide/b4-guide.css';
import { B4_MODULE_TITLE } from '../data/b4GuideContent';
import { resolveB4HubPath } from '../lib/portalGamePaths';

export default function B4PortalWeek1Page() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = `${B4_MODULE_TITLE} | Caiden's Courage`;
  }, []);

  return (
    <B4GuideFlow
      embedded
      initialScreen="module"
      onExit={() => navigate(resolveB4HubPath(location.pathname))}
    />
  );
}
