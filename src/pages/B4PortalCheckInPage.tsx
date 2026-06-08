import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import B4BaselineCheckFlow from '../components/b4/B4BaselineCheckFlow';
import '../components/b4/b4-portal-hub.css';
import '../components/b4-baseline-check/b4-baseline-check.css';
import { B4_BASELINE_LANDING } from '../data/b4BaselineCheckContent';
import { resolveB4HubPath } from '../lib/portalGamePaths';

export default function B4PortalCheckInPage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = `${B4_BASELINE_LANDING.title} | Caiden's Courage`;
  }, []);

  return (
    <B4BaselineCheckFlow
      embedded
      onExit={() => navigate(resolveB4HubPath(location.pathname))}
    />
  );
}
