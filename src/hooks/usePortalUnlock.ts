import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  B4_RESULTS_ADMIN_PATH,
  BLUE_RIBBON_PILOT_PATH,
  FAMILY_PORTAL_PATH,
  PROGRAM_DASHBOARD_PATH,
} from '../config/courageRoutes';
import { resolveFamilyKidDefaultLandingPath } from '../lib/familyKidLanding';
import { writeBlueRibbonUnlock } from '../config/blueRibbonPortalAccess';
import { applyProgramPortalUnlock, writeActivePortalRole } from '../config/portalContext';
import { writeFamilyPortalSession } from '../config/familyPortalAccess';
import { writeLastPilotProgram } from '../config/lastPilotProgram';
import {
  getDashboardPathForTier,
  resolvePortalAccessCode,
  writePortalSessionUnlock,
} from '../config/portalAccess';
import { claimParentFamilyPortal } from '../lib/parentClaimService';
import { unlockIndependentFamilyPortal } from '../lib/independentFamilyPortalSignup';
import { isIndependentFamilyProgram } from '../lib/independentFamilyProgram';
import { lookupPilotProgramByAccessCodeDetailed } from '../lib/pilotProgramService';
import {
  isLegacyDemoAccessCode,
  looksLikeProgramAccessCode,
  PORTAL_CODE_NOT_FOUND_MESSAGE,
  PORTAL_CONNECTION_ERROR_MESSAGE,
} from '../lib/portalAccessCodes';
import { logPortalRedirect } from '../lib/portalDebug';
import { replaceWithPortalRoute } from '../lib/portalHardNavigation';
import { resetPortalScroll } from '../lib/portalScroll';
import { isSupabaseConfigReady } from '../lib/supabaseClient';
import { verifyStudentPinLogin } from '../lib/studentPinService';
import { launchStudentPinKidPlay } from '../lib/studentPinLoginLaunch';
import {
  defaultRememberDeviceForUserType,
  readRememberedDeviceSession,
  writeRememberedDeviceSession,
  type RememberedDeviceUserType,
} from '../lib/rememberedDeviceSession';
import {
  hasRememberedProgramAccess,
  readRememberedProgramAccessCode,
  writeRememberedProgramAccess,
} from '../lib/rememberedProgramAccess';
import type { ActivePilotProgram } from '../types/pilotProgram';
import { trackKitFacilitatorSignup } from '../lib/kitIntegration';

export type PortalUnlockVariant = 'nav' | 'hero';

const BASELINE_RESULTS_CODES = new Set(['results', 'result']);
const STUDENT_PIN_RE = /^\d{4,8}$/;

function isBlueRibbonPilotCode(raw: string): boolean {
  const normalized = raw.trim().toLowerCase().replace(/\s+/g, '');
  return normalized === 'blueribbon2026' || normalized === 'blueribbon';
}

function isBlueRibbonFamilyCode(raw: string): boolean {
  const normalized = raw.trim().toLowerCase().replace(/\s+/g, '');
  return normalized === 'blueribbonfamily';
}

function isBlueRibbonKidsCode(raw: string): boolean {
  const normalized = raw.trim().toLowerCase().replace(/\s+/g, '');
  return normalized === 'blueribbonkids';
}

function navigateToPortal(destination: string, reason: string): void {
  resetPortalScroll();
  logPortalRedirect('/portal', destination, reason);
  replaceWithPortalRoute(destination);
}

function persistRememberedDevice(input: {
  rememberDevice: boolean;
  userType: RememberedDeviceUserType;
  accessCode: string;
  program: ActivePilotProgram;
  studentId?: string;
  parentId?: string;
  facilitatorId?: string;
  displayName?: string;
}): void {
  writeRememberedProgramAccess(input.accessCode, input.program);
  if (!input.rememberDevice) return;
  writeRememberedDeviceSession({
    access_code: input.accessCode,
    program_id: input.program.id ?? null,
    program_code: input.program.programCode,
    user_type: input.userType,
    student_id: input.studentId,
    parent_id: input.parentId,
    facilitator_id: input.facilitatorId,
    display_name: input.displayName,
    program: input.program,
  });
}

export function usePortalUnlock(_variant: PortalUnlockVariant, onUnlock?: () => void) {
  const remembered = readRememberedDeviceSession();
  const rememberedAccessCode = readRememberedProgramAccessCode() || remembered?.access_code || '';
  const hasRememberedProgram = hasRememberedProgramAccess();

  const [accessCode, setAccessCode] = useState(() => rememberedAccessCode);
  const [parentEmail, setParentEmail] = useState('');
  const [parentLastName, setParentLastName] = useState('');
  const [needsLastNameConfirm, setNeedsLastNameConfirm] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(() =>
    remembered ? true : defaultRememberDeviceForUserType('parent'),
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (rememberedAccessCode && !accessCode.trim()) {
      setAccessCode(rememberedAccessCode);
    }
  }, [accessCode, rememberedAccessCode]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);

      const trimmedCode = (accessCode.trim() || rememberedAccessCode).trim();
      const normalizedCode = trimmedCode.toLowerCase().replace(/\s+/g, '');

      if (!trimmedCode) {
        setError(PORTAL_CODE_NOT_FOUND_MESSAGE);
        return;
      }

      if (BASELINE_RESULTS_CODES.has(normalizedCode)) {
        setAccessCode('');
        onUnlock?.();
        navigateToPortal(B4_RESULTS_ADMIN_PATH, 'baseline-results-code');
        return;
      }

      const isProgramShaped = looksLikeProgramAccessCode(trimmedCode);

      if (isSupabaseConfigReady()) {
        setSubmitting(true);
        const lookup = await lookupPilotProgramByAccessCodeDetailed(trimmedCode);

        if (lookup.status === 'found' && lookup.result) {
          const { program, role } = lookup.result;

          if (role === 'family') {
            const email = parentEmail.trim();
            if (!email) {
              setError(
                isIndependentFamilyProgram(program)
                  ? 'Enter the parent/guardian email for your family account.'
                  : 'Enter the parent/guardian email used at camp registration.',
              );
              setSubmitting(false);
              return;
            }

            if (STUDENT_PIN_RE.test(email)) {
              const verified = await verifyStudentPinLogin({
                programCode: program.programCode,
                pin: email,
              });
              if (!verified.success) {
                setError(verified.error);
                setSubmitting(false);
                return;
              }

              const launch = await launchStudentPinKidPlay({
                participantId: verified.participantId,
                programCode: verified.programCode,
                displayName: verified.displayName,
                organizationId: program.id,
              });
              if (launch.kind === 'error') {
                setError(launch.message);
                setSubmitting(false);
                return;
              }

              persistRememberedDevice({
                rememberDevice,
                userType: 'student',
                accessCode: trimmedCode,
                program,
                studentId: verified.participantId,
                displayName: verified.displayName,
              });

              setAccessCode('');
              setParentEmail('');
              setParentLastName('');
              setNeedsLastNameConfirm(false);
              navigateToPortal(launch.path, 'student-pin-portal-login');
              setSubmitting(false);
              onUnlock?.();
              return;
            }

            if (isIndependentFamilyProgram(program)) {
              const unlock = await unlockIndependentFamilyPortal({
                program,
                parentEmail: email,
                parentLastName: parentLastName.trim() || undefined,
                accessCode: trimmedCode,
              });

              if (!unlock.success) {
                setError(unlock.message ?? 'Could not open your family portal.');
                setSubmitting(false);
                return;
              }

              persistRememberedDevice({
                rememberDevice,
                userType: 'parent',
                accessCode: trimmedCode,
                program,
                parentId: email.trim().toLowerCase(),
              });

              setAccessCode('');
              setParentEmail('');
              setParentLastName('');
              setNeedsLastNameConfirm(false);
              navigateToPortal(resolveFamilyKidDefaultLandingPath(), 'independent-family-unlock');
              setSubmitting(false);
              onUnlock?.();
              return;
            }

            const claim = await claimParentFamilyPortal({
              program,
              parentEmail: email,
              parentLastName: parentLastName.trim() || undefined,
              accessCode: trimmedCode,
            });

            if (!claim.success) {
              setNeedsLastNameConfirm(Boolean(claim.needsLastNameConfirm));
              setError(claim.message ?? 'Could not verify parent access.');
              setSubmitting(false);
              return;
            }

            if (claim.familyProgram) {
              writeLastPilotProgram(claim.familyProgram, 'family', email, trimmedCode);
            }

            persistRememberedDevice({
              rememberDevice,
              userType: 'parent',
              accessCode: trimmedCode,
              program: claim.familyProgram ?? program,
              parentId: email.trim().toLowerCase(),
            });

            setAccessCode('');
            setParentEmail('');
            setParentLastName('');
            setNeedsLastNameConfirm(false);
            navigateToPortal(resolveFamilyKidDefaultLandingPath(), 'parent-claim-family');
            setSubmitting(false);
            onUnlock?.();
            return;
          }

          applyProgramPortalUnlock(program, role, trimmedCode);
          writeLastPilotProgram(program, role, program.adminEmail, trimmedCode);
          if (role === 'facilitator' && program.adminEmail?.trim()) {
            trackKitFacilitatorSignup({
              facilitatorEmail: program.adminEmail,
              eventName: 'facilitator_unlock',
              metadata: { program_code: program.programCode, source: 'portal_unlock' },
            });
          }
          persistRememberedDevice({
            rememberDevice,
            userType: 'facilitator',
            accessCode: trimmedCode,
            program,
            facilitatorId: program.adminEmail?.trim().toLowerCase() || undefined,
          });
          setAccessCode('');
          const destination = PROGRAM_DASHBOARD_PATH;
          navigateToPortal(destination, `program-code-${role}`);
          setSubmitting(false);
          onUnlock?.();
          return;
        }

        setSubmitting(false);

        if (lookup.status === 'error' || lookup.status === 'unavailable') {
          setError(PORTAL_CONNECTION_ERROR_MESSAGE);
          return;
        }

        if (lookup.status === 'not_found' && isProgramShaped) {
          setError(PORTAL_CODE_NOT_FOUND_MESSAGE);
          return;
        }
      } else if (isProgramShaped) {
        setError(PORTAL_CONNECTION_ERROR_MESSAGE);
        return;
      }

      if (isProgramShaped) {
        setError(PORTAL_CODE_NOT_FOUND_MESSAGE);
        return;
      }

      if (isLegacyDemoAccessCode(trimmedCode) && isBlueRibbonPilotCode(trimmedCode)) {
        writePortalSessionUnlock('pilot');
        writeBlueRibbonUnlock();
        writeActivePortalRole('facilitator');
        setAccessCode('');
        onUnlock?.();
        navigateToPortal(BLUE_RIBBON_PILOT_PATH, 'blueribbon-pilot-code');
        return;
      }

      if (
        isLegacyDemoAccessCode(trimmedCode) &&
        (isBlueRibbonFamilyCode(trimmedCode) || isBlueRibbonKidsCode(trimmedCode))
      ) {
        writeFamilyPortalSession();
        writeBlueRibbonUnlock();
        writeActivePortalRole('family');
        setAccessCode('');
        onUnlock?.();
        navigateToPortal(resolveFamilyKidDefaultLandingPath(FAMILY_PORTAL_PATH), 'blueribbon-family-code');
        return;
      }

      const tier = resolvePortalAccessCode(trimmedCode);
      if (!tier) {
        setError(PORTAL_CODE_NOT_FOUND_MESSAGE);
        return;
      }

      writePortalSessionUnlock(tier.type);
      setAccessCode('');
      onUnlock?.();
      navigateToPortal(getDashboardPathForTier(tier), `tier-code-${tier.type}`);
    },
    [accessCode, onUnlock, parentEmail, parentLastName, rememberDevice, rememberedAccessCode],
  );

  const handleAccessCodeChange = useCallback(
    (value: string) => {
      setAccessCode(value);
      if (error) setError(null);
    },
    [error],
  );

  return {
    accessCode,
    parentEmail,
    parentLastName,
    needsLastNameConfirm,
    rememberDevice,
    hasRememberedProgram,
    rememberedSession: remembered,
    error,
    submitting,
    handleSubmit,
    onAccessCodeChange: handleAccessCodeChange,
    onParentEmailChange: (value: string) => {
      setParentEmail(value);
      if (error) setError(null);
      if (STUDENT_PIN_RE.test(value.trim())) {
        setRememberDevice(false);
      } else if (value.trim()) {
        setRememberDevice(defaultRememberDeviceForUserType('parent'));
      }
    },
    onParentLastNameChange: (value: string) => {
      setParentLastName(value);
      if (error) setError(null);
    },
    onRememberDeviceChange: setRememberDevice,
    clearAccessCode: () => setAccessCode(''),
    setError,
  };
}
