import React from 'react';
import BrandLogo from '../../design-system/components/BrandLogo';
import { applyProgramPortalUnlock } from '../../config/portalContext';
import { FAMILY_HUB_PATH, PROGRAM_DASHBOARD_PATH } from '../../config/courageRoutes';
import { hasFacilitatorAccessCode, isIndependentFamilyProgram } from '../../lib/independentFamilyProgram';
import { activateIndependentFamilyPortalSession } from '../../lib/independentFamilyPortalSignup';
import type { LastPilotProgram } from '../../config/lastPilotProgram';
import { replaceWithPortalRoute } from '../../lib/portalHardNavigation';
import { useCopyToast } from '../shared/useCopyToast';

type PortalWelcomeBackCardProps = {
  saved: LastPilotProgram;
  onUseDifferentCode: () => void;
  onForgotCode?: () => void;
};

export default function PortalWelcomeBackCard({
  saved,
  onUseDifferentCode,
  onForgotCode,
}: PortalWelcomeBackCardProps) {
  const { copyWithToast, toast } = useCopyToast();
  const role = saved.portal_role;
  const isFamily = role === 'family';
  const continueLabel = isFamily ? 'Continue as Family' : 'Continue as Facilitator';
  const showFacilitatorCode = hasFacilitatorAccessCode(saved.facilitator_access_code);

  const handleContinue = () => {
    if (isFamily && isIndependentFamilyProgram(saved.program)) {
      activateIndependentFamilyPortalSession({
        program: saved.program,
        parentEmail: saved.admin_email || saved.program.adminEmail,
        accessCode: saved.last_access_code,
      });
    } else {
      applyProgramPortalUnlock(saved.program, role, saved.last_access_code);
    }
    replaceWithPortalRoute(isFamily ? FAMILY_HUB_PATH : PROGRAM_DASHBOARD_PATH);
  };

  return (
    <>
      {toast}
      <section
        className="portal-welcomeBack portal-welcomeBack--standalone"
        aria-labelledby="portal-welcome-back-title"
      >
        <div className="portal-welcomeBackBrand">
          <BrandLogo variant="facilitator" size="accessCode" decorative />
        </div>
        <h3 id="portal-welcome-back-title" className="portal-welcomeBackTitle">
          Welcome back
        </h3>
        <p className="portal-welcomeBackProgram">{saved.program_name}</p>

        {isFamily ? null : (
          <div className="portal-welcomeBackCodes">
            {showFacilitatorCode ? (
              <div className="portal-recoveryCodeRow">
                <span className="portal-recoveryLabel">Facilitator Code</span>
                <span className="portal-recoveryCodeValue">{saved.facilitator_access_code!}</span>
                <button
                  type="button"
                  className="portal-recoveryCopyBtn"
                  onClick={() => void copyWithToast(saved.facilitator_access_code!)}
                >
                  Copy
                </button>
              </div>
            ) : null}
            <div className="portal-recoveryCodeRow">
              <span className="portal-recoveryLabel">Family Code</span>
              <span className="portal-recoveryCodeValue">{saved.family_access_code}</span>
              <button
                type="button"
                className="portal-recoveryCopyBtn"
                onClick={() => void copyWithToast(saved.family_access_code)}
              >
                Copy
              </button>
            </div>
          </div>
        )}

        <div className="portal-welcomeBackActions">
          <button type="button" className="portal-welcomeBackBtn" onClick={handleContinue}>
            {continueLabel}
          </button>
          <button type="button" className="portal-welcomeBackLink" onClick={onUseDifferentCode}>
            Use Different Code
          </button>
          {isFamily && onForgotCode ? (
            <button type="button" className="portal-welcomeBackLink" onClick={onForgotCode}>
              Forgot Code
            </button>
          ) : null}
        </div>
      </section>
    </>
  );
}
