import React, { useState } from 'react';
import { applyProgramPortalUnlock } from '../../config/portalContext';
import { PROGRAM_DASHBOARD_PATH } from '../../config/courageRoutes';
import { resolveFamilyKidDefaultLandingPath } from '../../lib/familyKidLanding';
import { activateIndependentFamilyPortalSession } from '../../lib/independentFamilyPortalSignup';
import { writeLastPilotProgram } from '../../config/lastPilotProgram';
import type { ActivePilotProgram } from '../../types/pilotProgram';
import { isIndependentFamilyProgram } from '../../lib/independentFamilyProgram';
import { lookupPilotProgramByAdmin } from '../../lib/pilotProgramService';
import { replaceWithPortalRoute } from '../../lib/portalHardNavigation';
import { useCopyToast } from '../shared/useCopyToast';

type PortalCodeRecoveryProps = {
  onClose: () => void;
};

export default function PortalCodeRecovery({ onClose }: PortalCodeRecoveryProps) {
  const { copyWithToast, toast } = useCopyToast();
  const [programName, setProgramName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [program, setProgram] = useState<ActivePilotProgram | null>(null);
  const [matchedName, setMatchedName] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setNotFound(false);
    setProgram(null);
    setMatchedName(null);

    const match = await lookupPilotProgramByAdmin(programName, adminEmail);
    setLoading(false);

    if (!match) {
      setNotFound(true);
      return;
    }

    setMatchedName(match.program_name);
    setProgram(match.program);
  };

  const isIndependentFamily = isIndependentFamilyProgram(program);

  const continueAsFamily = () => {
    if (!program) return;
    if (isIndependentFamily) {
      activateIndependentFamilyPortalSession({
        program,
        parentEmail: adminEmail.trim(),
        accessCode: program.familyAccessCode,
      });
    } else {
      applyProgramPortalUnlock(program, 'family', program.familyAccessCode);
      writeLastPilotProgram(program, 'family', adminEmail.trim(), program.familyAccessCode);
    }
    replaceWithPortalRoute(resolveFamilyKidDefaultLandingPath());
  };

  return (
    <div className="portal-recovery">
      {toast}
      <div className="portal-recoveryHead">
        <h3 className="portal-recoveryTitle">Find your access codes</h3>
        <button type="button" className="portal-recoveryClose" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>

      <form className="portal-recoveryForm" onSubmit={(event) => void handleSubmit(event)}>
        <label className="portal-recoveryField">
          <span>Organization / Program Name</span>
          <input
            type="text"
            value={programName}
            onChange={(event) => setProgramName(event.target.value)}
            required
          />
        </label>
        <label className="portal-recoveryField">
          <span>{isIndependentFamily ? 'Parent / Guardian Email' : 'Admin Email'}</span>
          <input
            type="email"
            value={adminEmail}
            onChange={(event) => setAdminEmail(event.target.value)}
            required
          />
        </label>
        <button type="submit" className="portal-recoverySubmit" disabled={loading}>
          {loading ? 'Searching…' : 'Look Up Codes'}
        </button>
      </form>

      {notFound ? (
        <p className="portal-recoveryNote" role="alert">
          We couldn&apos;t find a matching program. Check your spelling or contact the Caiden&apos;s Courage
          team.
        </p>
      ) : null}

      {program && matchedName ? (
        <div className="portal-recoveryResult">
          <p className="portal-recoveryProgram">{matchedName}</p>

          <div className="portal-recoveryCodeRow">
            <span className="portal-recoveryLabel">Program Code</span>
            <span className="portal-recoveryCodeValue">{program.programCode}</span>
            <button
              type="button"
              className="portal-recoveryCopyBtn"
              onClick={() => void copyWithToast(program.programCode)}
            >
              Copy
            </button>
          </div>
          {isIndependentFamily ? null : (
            <div className="portal-recoveryCodeRow">
              <span className="portal-recoveryLabel">Facilitator Code</span>
              <span className="portal-recoveryCodeValue">{program.facilitatorAccessCode}</span>
              <button
                type="button"
                className="portal-recoveryCopyBtn"
                onClick={() => void copyWithToast(program.facilitatorAccessCode!)}
              >
                Copy
              </button>
            </div>
          )}
          <div className="portal-recoveryCodeRow">
            <span className="portal-recoveryLabel">Family Code</span>
            <span className="portal-recoveryCodeValue">{program.familyAccessCode}</span>
            <button
              type="button"
              className="portal-recoveryCopyBtn"
              onClick={() => void copyWithToast(program.familyAccessCode)}
            >
              Copy
            </button>
          </div>

          <p className="portal-recoveryNote">
            Copy your codes or continue into your portal.
          </p>
          {/* TODO: Email recovery link when admin requests forgotten codes via Supabase Edge Function or external email service. */}

          <div className="portal-recoveryActions">
            {isIndependentFamily ? (
              <button type="button" className="portal-recoveryContinueBtn" onClick={continueAsFamily}>
                Continue as Family
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="portal-recoveryContinueBtn"
                  onClick={() => {
                    if (!program?.facilitatorAccessCode) return;
                    applyProgramPortalUnlock(program, 'facilitator', program.facilitatorAccessCode);
                    writeLastPilotProgram(
                      program,
                      'facilitator',
                      adminEmail.trim(),
                      program.facilitatorAccessCode,
                    );
                    replaceWithPortalRoute(PROGRAM_DASHBOARD_PATH);
                  }}
                >
                  Continue as Facilitator
                </button>
                <button type="button" className="portal-recoveryContinueBtn" onClick={continueAsFamily}>
                  Continue as Family
                </button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
