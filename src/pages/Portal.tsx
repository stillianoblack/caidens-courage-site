import React, { useEffect, useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import CourageHeader from '../components/courage/CourageHeader';
import CourageFooter from '../components/courage/CourageFooter';
import PortalHero from '../components/courage/PortalHero';
import ParentClaimViaPinModal from '../components/courage/ParentClaimViaPinModal';
import { parsePortalAudienceParam, type PortalAudienceTab } from '../config/portalAudience';
import { defaultPortalLoginIntent } from '../config/portalLoginIntent';
import { usePortalUnlock } from '../hooks/usePortalUnlock';
import { resolveFamilyKidDefaultLandingPath, resolveFamilyPortalOverviewPath } from '../lib/familyKidLanding';
import { readActivePortalRole } from '../config/portalContext';
import { PORTAL_PATH, PROGRAM_DASHBOARD_PATH } from '../config/courageRoutes';
import { isFamilyClaimCode } from '../lib/familyClaimCode';
import { logPortalRedirect } from '../lib/portalDebug';
import {
  hasFacilitatorPortalSession,
  hasFamilyPortalSession,
} from '../lib/portalSessionGuard';
import { replaceWithPortalRoute } from '../lib/portalHardNavigation';

/**
 * Caiden's Courage Portal — access-code entry only.
 * Enter a code to open Family Portal (/family-hub) or Facilitator Portal (/program-dashboard).
 */
const Portal: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const portalMessage = useMemo(
    () => (location.state as { portalMessage?: string } | null)?.portalMessage ?? null,
    [location.state],
  );

  const audienceParam = searchParams.get('audience');
  const audience: PortalAudienceTab | null = audienceParam
    ? parsePortalAudienceParam(audienceParam)
    : null;
  const claimCodeFromUrl = searchParams.get('code')?.trim().toUpperCase() || '';
  const claimMode = searchParams.get('claim') === '1' || isFamilyClaimCode(claimCodeFromUrl);
  const initialIntent =
    claimMode || audience === 'parents' ? 'parent' : defaultPortalLoginIntent(audience);

  const {
    accessCode,
    parentEmail,
    parentLastName,
    parentFirstName,
    parentPhone,
    needsLastNameConfirm,
    portalIntent,
    pendingParentPinClaim,
    claimSubmitting,
    claimError,
    rememberDevice,
    hasRememberedProgram,
    rememberedSession,
    error,
    submitting,
    handleSubmit,
    completePendingParentPinClaim,
    cancelPendingParentPinClaim,
    onAccessCodeChange,
    onPortalIntentChange,
    onParentEmailChange,
    onParentFirstNameChange,
    onParentLastNameChange,
    onParentPhoneChange,
    onRememberDeviceChange,
    clearAccessCode,
    setError,
  } = usePortalUnlock('hero', undefined, initialIntent, {
    initialAccessCode: claimCodeFromUrl || undefined,
  });

  useEffect(() => {
    document.title = "Caiden's Courage Portal";
  }, []);

  useEffect(() => {
    if (portalMessage) {
      setError(portalMessage);
    }
  }, [portalMessage, setError]);

  useEffect(() => {
    if (hasFamilyPortalSession()) {
      const resumePath =
        readActivePortalRole() === 'family'
          ? resolveFamilyPortalOverviewPath()
          : resolveFamilyKidDefaultLandingPath();
      logPortalRedirect(PORTAL_PATH, resumePath, 'resume-family-session');
      replaceWithPortalRoute(resumePath);
      return;
    }
    if (hasFacilitatorPortalSession()) {
      logPortalRedirect(PORTAL_PATH, PROGRAM_DASHBOARD_PATH, 'resume-facilitator-session');
      replaceWithPortalRoute(PROGRAM_DASHBOARD_PATH);
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-cream font-body">
      <CourageHeader />

      <PortalHero
        audience={audience}
        accessCode={accessCode}
        parentEmail={parentEmail}
        parentLastName={parentLastName}
        needsLastNameConfirm={needsLastNameConfirm}
        portalIntent={portalIntent}
        rememberDevice={rememberDevice}
        hasRememberedProgram={hasRememberedProgram}
        rememberedSession={rememberedSession}
        error={error}
        submitting={submitting}
        onAccessCodeChange={onAccessCodeChange}
        onPortalIntentChange={onPortalIntentChange}
        onParentEmailChange={onParentEmailChange}
        onParentLastNameChange={onParentLastNameChange}
        onRememberDeviceChange={onRememberDeviceChange}
        onSubmit={handleSubmit}
        onUseDifferentCode={clearAccessCode}
      />

      <ParentClaimViaPinModal
        open={Boolean(pendingParentPinClaim)}
        childDisplayName={pendingParentPinClaim?.childDisplayName ?? 'your child'}
        submitting={claimSubmitting}
        error={claimError}
        parentEmail={parentEmail}
        parentFirstName={parentFirstName}
        parentLastName={parentLastName}
        parentPhone={parentPhone}
        onParentEmailChange={onParentEmailChange}
        onParentFirstNameChange={onParentFirstNameChange}
        onParentLastNameChange={onParentLastNameChange}
        onParentPhoneChange={onParentPhoneChange}
        onCancel={cancelPendingParentPinClaim}
        onSubmit={completePendingParentPinClaim}
      />

      <CourageFooter />
    </div>
  );
};

export default Portal;
