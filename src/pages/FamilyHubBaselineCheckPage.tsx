import React from 'react';
import { useNavigate } from 'react-router-dom';
import B4BaselineCheckFlow from '../components/b4/B4BaselineCheckFlow';
import FamilyDashboardSidebar from '../components/family-portal/FamilyDashboardSidebar';
import FamilyDashboardTopBar from '../components/family-portal/FamilyDashboardTopBar';
import PortalAccessRequired from '../components/portal/PortalAccessRequired';
import PortalShell from '../components/portal/PortalShell';
import '../components/family-portal/family-dashboard.css';
import '../components/portal/portal-shell.css';
import { readActivePortalRole } from '../config/portalContext';
import { PROGRAM_FAMILY_SIDEBAR_NAV } from '../data/familyPortalContent';
import { readFamilyPortalSession } from '../config/familyPortalAccess';
import { getPortalRoute } from '../lib/portalGamePaths';
import { resolveActivePilotProgram } from '../lib/portalProgramRestore';
import { PORTAL_ROLE_MISMATCH_MESSAGE } from '../lib/portalSessionGuard';

export default function FamilyHubBaselineCheckPage() {
  const navigate = useNavigate();
  const activeProgram = resolveActivePilotProgram();
  const activeRole = readActivePortalRole();
  const hasLegacySession = readFamilyPortalSession();
  const sessionOk = activeRole === 'family' && Boolean(activeProgram);

  if (activeRole === 'facilitator') {
    return <PortalAccessRequired message={PORTAL_ROLE_MISMATCH_MESSAGE} />;
  }

  if (!sessionOk && !hasLegacySession) {
    return <PortalAccessRequired />;
  }

  if (!activeProgram) {
    return <PortalAccessRequired />;
  }

  return (
    <PortalShell
      variant="family"
      sidebar={
        <FamilyDashboardSidebar
          navItems={PROGRAM_FAMILY_SIDEBAR_NAV}
          programCode={activeProgram.programCode}
        />
      }
      topBar={
        <FamilyDashboardTopBar pageTitle="B-4 Baseline Check" />
      }
      footer={<footer className="family-miniFooter">© 2026 Caiden&apos;s Courage™ Family Portal</footer>}
    >
      <B4BaselineCheckFlow embedded familyPortal onExit={() => navigate(getPortalRoute('characters'))} />
    </PortalShell>
  );
}
