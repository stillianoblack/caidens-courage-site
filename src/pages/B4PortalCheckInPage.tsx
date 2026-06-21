import React, { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import B4BaselineCheckFlow from '../components/b4/B4BaselineCheckFlow';
import '../components/b4/b4-portal-hub.css';
import '../components/b4-baseline-check/b4-baseline-check.css';
import { B4_BASELINE_LANDING } from '../data/b4BaselineCheckContent';
import { resolveBaselineCheckInBackTarget } from '../lib/baselineCheckInMission';

export default function B4PortalCheckInPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const backTarget = useMemo(
    () =>
      resolveBaselineCheckInBackTarget({
        pathname: location.pathname,
        search: location.search,
      }),
    [location.pathname, location.search],
  );

  useEffect(() => {
    document.title = `${B4_BASELINE_LANDING.title} | Caiden's Courage`;
  }, []);

  return (
    <B4BaselineCheckFlow
      embedded
      exitBackLabel={backTarget.label}
      onExit={() => navigate(backTarget.path)}
    />
  );
}
