import React from 'react';
import BrandLogo from '../../design-system/components/BrandLogo';
import {
  rememberedDeviceDisplayName,
  rememberedDevicePortalLabel,
  resumeRememberedDeviceSession,
  switchRememberedDeviceAccount,
} from '../../lib/rememberedDeviceResume';
import type { RememberedDeviceSession } from '../../lib/rememberedDeviceSession';
import { replaceWithPortalRoute } from '../../lib/portalHardNavigation';

type RememberedDeviceResumeCardProps = {
  session: RememberedDeviceSession;
  onSwitchAccount: () => void;
};

export default function RememberedDeviceResumeCard({
  session,
  onSwitchAccount,
}: RememberedDeviceResumeCardProps) {
  const [submitting, setSubmitting] = React.useState(false);

  const handleContinue = async () => {
    setSubmitting(true);
    const result = await resumeRememberedDeviceSession();
    setSubmitting(false);
    if (result.kind === 'routed') {
      replaceWithPortalRoute(result.destination);
      return;
    }
    onSwitchAccount();
  };

  const handleSwitchAccount = () => {
    switchRememberedDeviceAccount();
    onSwitchAccount();
  };

  const displayName = rememberedDeviceDisplayName(session);
  const portalLabel = rememberedDevicePortalLabel(session);
  const programName = session.program?.programName?.trim() || session.program_code;

  return (
    <section
      className="portal-welcomeBack portal-welcomeBack--standalone"
      aria-labelledby="remembered-device-resume-title"
    >
      <div className="portal-welcomeBackBrand">
        <BrandLogo variant="facilitator" size="accessCode" decorative />
      </div>
      <h3 id="remembered-device-resume-title" className="portal-welcomeBackTitle">
        Welcome back
      </h3>
      <p className="portal-welcomeBackProgram">{programName}</p>
      <p className="portal-welcomeBackCopy">
        Continue as <strong>{displayName}</strong> to {portalLabel}.
      </p>

      <div className="portal-welcomeBackActions">
        <button
          type="button"
          className="portal-welcomeBackBtn"
          onClick={() => void handleContinue()}
          disabled={submitting}
        >
          {submitting ? 'Opening…' : `Continue as ${displayName}`}
        </button>
        <button type="button" className="portal-welcomeBackLink" onClick={handleSwitchAccount}>
          Not you? Switch account
        </button>
      </div>
    </section>
  );
}
