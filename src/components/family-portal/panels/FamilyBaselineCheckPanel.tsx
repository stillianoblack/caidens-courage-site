import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import B4BaselineCheckFlow from '../../b4/B4BaselineCheckFlow';
import { getPortalRoute } from '../../../lib/portalGamePaths';

export default function FamilyBaselineCheckPanel() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <B4BaselineCheckFlow
      embedded
      familyPortal
      onExit={() => navigate(getPortalRoute('continue-learning', location.pathname))}
    />
  );
}
