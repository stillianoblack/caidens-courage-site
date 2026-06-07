import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import B4BaselineCheckFlow from '../components/b4/B4BaselineCheckFlow';
import '../components/b4/b4-portal-hub.css';
import '../components/b4-baseline-check/b4-baseline-check.css';
import { KIDS_PORTAL_PATH } from '../config/courageRoutes';
import { B4_BASELINE_LANDING } from '../data/b4BaselineCheckContent';

export default function B4PortalCheckInPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = `${B4_BASELINE_LANDING.title} | Caiden's Courage`;
  }, []);

  return (
    <B4BaselineCheckFlow
      embedded
      onExit={() => navigate(`${KIDS_PORTAL_PATH}/b4`)}
    />
  );
}
