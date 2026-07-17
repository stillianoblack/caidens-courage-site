import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  B4_RESULTS_ADMIN_PATH,
  BLUE_RIBBON_PILOT_PATH,
  FAMILY_PORTAL_PATH,
} from '../config/courageRoutes';
import { resolveFamilyKidDefaultLandingPath, resolveFamilyPortalOverviewPath } from '../lib/familyKidLanding';
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
import { lookupPortalProgramByAccessCodeDetailed } from '../lib/portalAccessResolve';
import {
  completeParentClaimViaStudentPin,
  type ParentClaimViaStudentPinInput,
} from '../lib/parentClaimViaStudentPin';
import type { PortalLoginIntent } from '../config/portalLoginIntent';
import { isLegacyDemoUnlockAllowed } from '../lib/portalAuthConfig';
import { verifyFacilitatorProgramEmail } from '../lib/portalFacilitatorAuth';
import { facilitatorReturnSessionPath } from '../lib/kidPlayReturnSessionRoute';
import {
  PORTAL_ACCESS_NOT_FOUND_MESSAGE,
  PORTAL_CLAIM_PIN_MISMATCH_MESSAGE,
  PORTAL_EMAIL_NOT_CONNECTED_MESSAGE,
  PORTAL_PIN_MISMATCH_MESSAGE,
} from '../lib/portalIdentity';
import { isFamilyClaimCode } from '../lib/familyClaimCode';
import {
  isLegacyDemoAccessCode,
  looksLikeProgramAccessCode,
  PORTAL_CODE_NOT_FOUND_MESSAGE,
  PORTAL_CONNECTION_ERROR_MESSAGE,
} from '../lib/portalAccessCodes';
import { logPortalRedirect, portalDebug } from '../lib/portalDebug';
import { replaceWithPortalRoute } from '../lib/portalHardNavigation';
import { resetPortalScroll } from '../lib/portalScroll';
import { FetchTimeoutError, withTimeout } from '../lib/fetchWithTimeout';
import { verifyStudentPinLoginWithProgramFallback } from '../lib/studentPinProgramScope';
import { launchStudentPinKidPlay } from '../lib/studentPinLoginLaunch';
import { resolveOngoingFamilyAccessCode } from '../lib/portalUnlockRoute';
import { clearParentClaimContext } from '../config/parentClaimContext';
import { clearStudentPinSession } from '../lib/studentPinSession';
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
const PORTAL_LOGIN_TIMEOUT_MS = 8000;
const PORTAL_SLOW_LOAD_MESSAGE =
  "We're having trouble loading this portal. Try refreshing or switch program.";

export type PendingParentPinClaim = {
  program: ActivePilotProgram;
  accessCode: string;
  participantId: string;
  childDisplayName: string;
  programCode: string;
};

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
  if (input.rememberDevice) {
    writeRememberedProgramAccess(input.accessCode, input.program);
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
}

export function usePortalUnlock(
  _variant: PortalUnlockVariant,
  onUnlock?: () => void,
  initialIntent: PortalLoginIntent = 'student',
  options?: { initialAccessCode?: string },
) {
  const remembered = readRememberedDeviceSession();
  const rememberedAccessCode = readRememberedProgramAccessCode() || remembered?.access_code || '';
  const hasRememberedProgram = hasRememberedProgramAccess();
  const seededAccessCode = options?.initialAccessCode?.trim() || '';

  const [accessCode, setAccessCode] = useState(() => seededAccessCode || rememberedAccessCode);
  const [parentEmail, setParentEmail] = useState('');
  const [parentLastName, setParentLastName] = useState('');
  const [parentFirstName, setParentFirstName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [needsLastNameConfirm, setNeedsLastNameConfirm] = useState(false);
  const [portalIntent, setPortalIntent] = useState<PortalLoginIntent>(initialIntent);
  const [pendingParentPinClaim, setPendingParentPinClaim] = useState<PendingParentPinClaim | null>(
    null,
  );
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [rememberDevice, setRememberDevice] = useState(() =>
    remembered ? true : defaultRememberDeviceForUserType('parent'),
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    portalDebug('portal load step', {
      step: 'session_restoration',
      has_remembered_access_code: Boolean(rememberedAccessCode),
      has_remembered_program: hasRememberedProgram,
      user_type: remembered?.user_type ?? null,
    });
    if (rememberedAccessCode && !accessCode.trim()) {
      setAccessCode(rememberedAccessCode);
    }
  }, [accessCode, hasRememberedProgram, remembered?.user_type, rememberedAccessCode]);

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

      {
        setSubmitting(true);
        portalDebug('portal load step', {
          step: 'program_lookup_start',
          code_shape: isProgramShaped ? 'program' : 'legacy_or_short',
          intent: portalIntent,
        });
        let lookup: Awaited<ReturnType<typeof lookupPortalProgramByAccessCodeDetailed>>;
        try {
          lookup = await withTimeout(
            lookupPortalProgramByAccessCodeDetailed(trimmedCode, {
              intent: portalIntent,
              credential: parentEmail.trim(),
            }),
            PORTAL_LOGIN_TIMEOUT_MS,
            'portal_program_lookup',
          );
        } catch (err) {
          portalDebug('portal load step', {
            step: 'program_lookup_failed',
            reason: err instanceof FetchTimeoutError ? 'timeout' : 'error',
          });
          setSubmitting(false);
          setError(
            err instanceof FetchTimeoutError ? PORTAL_SLOW_LOAD_MESSAGE : PORTAL_CONNECTION_ERROR_MESSAGE,
          );
          return;
        }
        portalDebug('portal load step', {
          step: 'program_lookup_complete',
          status: lookup.status,
          role: lookup.result?.role ?? null,
          program_code: lookup.result?.program.programCode ?? null,
          has_claim_context: Boolean(lookup.claimCodeContext),
        });

        if (lookup.status === 'invalid_credential') {
          setError(PORTAL_EMAIL_NOT_CONNECTED_MESSAGE);
          setSubmitting(false);
          return;
        }

        if (lookup.status === 'found' && lookup.result) {
          const { program, role } = lookup.result;

          if (role === 'family') {
            const credential = parentEmail.trim();
            if (!credential) {
              setError(
                portalIntent === 'student'
                  ? 'Enter your student PIN to continue.'
                  : portalIntent === 'facilitator'
                    ? 'Facilitator access requires a facilitator access code and email.'
                    : isIndependentFamilyProgram(program)
                      ? 'Enter the parent/guardian email for your family account.'
                      : 'Enter the parent/guardian email or student PIN for this program.',
              );
              setSubmitting(false);
              return;
            }

            if (portalIntent === 'facilitator') {
              setError('This access code is for families. Use your facilitator access code and email.');
              setSubmitting(false);
              return;
            }

            if (STUDENT_PIN_RE.test(credential)) {
              clearParentClaimContext();
              const campProgramCodeHint =
                lookup.claimCodeContext?.campProgramCode?.trim() ||
                program.programCode.trim();
              let verified: Awaited<ReturnType<typeof verifyStudentPinLoginWithProgramFallback>>;
              try {
                verified = await withTimeout(
                  verifyStudentPinLoginWithProgramFallback({
                    pin: credential,
                    accessCodeHint: trimmedCode,
                    campProgramCodeHint,
                  }),
                  PORTAL_LOGIN_TIMEOUT_MS,
                  'portal_student_pin_hydration',
                );
              } catch (err) {
                portalDebug('portal load step', {
                  step: 'participant_hydration_failed',
                  reason: err instanceof FetchTimeoutError ? 'timeout' : 'error',
                });
                setError(PORTAL_SLOW_LOAD_MESSAGE);
                setSubmitting(false);
                return;
              }
              if (!verified.success) {
                const claimCodeMismatch =
                  isFamilyClaimCode(trimmedCode) &&
                  (verified.error.includes('match') || verified.error.includes('Invalid'));
                setError(
                  claimCodeMismatch
                    ? PORTAL_CLAIM_PIN_MISMATCH_MESSAGE
                    : verified.error.includes('match') || verified.error.includes('Invalid')
                      ? PORTAL_PIN_MISMATCH_MESSAGE
                      : verified.error,
                );
                setSubmitting(false);
                return;
              }

              const expectedParticipantId = lookup.claimCodeContext?.participantId?.trim();
              if (
                expectedParticipantId &&
                verified.participantId.trim() !== expectedParticipantId
              ) {
                setError(PORTAL_CLAIM_PIN_MISMATCH_MESSAGE);
                setSubmitting(false);
                return;
              }

              if (portalIntent === 'parent') {
                setPendingParentPinClaim({
                  program,
                  accessCode: trimmedCode,
                  participantId: lookup.claimCodeContext?.participantId ?? verified.participantId,
                  childDisplayName:
                    lookup.claimCodeContext?.childDisplayName ?? verified.displayName,
                  programCode: verified.programCode,
                });
                setParentEmail('');
                setParentFirstName('');
                setParentLastName('');
                setParentPhone('');
                setClaimError(null);
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
                accessCode: isFamilyClaimCode(trimmedCode)
                  ? trimmedCode
                  : resolveOngoingFamilyAccessCode(program, trimmedCode),
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

            if (portalIntent === 'student') {
              setError('Students should enter a student PIN, not a parent email.');
              setSubmitting(false);
              return;
            }

            clearStudentPinSession();

            if (isIndependentFamilyProgram(program)) {
              let unlock: Awaited<ReturnType<typeof unlockIndependentFamilyPortal>>;
              try {
                unlock = await withTimeout(
                  unlockIndependentFamilyPortal({
                    program,
                    parentEmail: credential,
                    parentLastName: parentLastName.trim() || undefined,
                    accessCode: trimmedCode,
                  }),
                  PORTAL_LOGIN_TIMEOUT_MS,
                  'portal_family_link_lookup',
                );
              } catch (err) {
                portalDebug('portal load step', {
                  step: 'family_link_lookup_failed',
                  reason: err instanceof FetchTimeoutError ? 'timeout' : 'error',
                });
                setError(PORTAL_SLOW_LOAD_MESSAGE);
                setSubmitting(false);
                return;
              }

              if (!unlock.success) {
                setError(
                  hasRememberedProgram && portalIntent === 'parent'
                    ? PORTAL_EMAIL_NOT_CONNECTED_MESSAGE
                    : (unlock.message ?? PORTAL_ACCESS_NOT_FOUND_MESSAGE),
                );
                setSubmitting(false);
                return;
              }

              persistRememberedDevice({
                rememberDevice,
                userType: 'parent',
                accessCode: resolveOngoingFamilyAccessCode(program, trimmedCode),
                program,
                parentId: credential.trim().toLowerCase(),
              });

              setAccessCode('');
              setParentEmail('');
              setParentLastName('');
              setNeedsLastNameConfirm(false);
              navigateToPortal(resolveFamilyPortalOverviewPath(), 'independent-family-unlock');
              setSubmitting(false);
              onUnlock?.();
              return;
            }

            let claim: Awaited<ReturnType<typeof claimParentFamilyPortal>>;
            try {
              claim = await withTimeout(
                claimParentFamilyPortal({
                  program,
                  parentEmail: credential,
                  parentLastName: parentLastName.trim() || undefined,
                  accessCode: trimmedCode,
                }),
                PORTAL_LOGIN_TIMEOUT_MS,
                'portal_family_claim_lookup',
              );
            } catch (err) {
              portalDebug('portal load step', {
                step: 'family_claim_lookup_failed',
                reason: err instanceof FetchTimeoutError ? 'timeout' : 'error',
              });
              setError(PORTAL_SLOW_LOAD_MESSAGE);
              setSubmitting(false);
              return;
            }
            portalDebug('portal load step', {
              step: 'family_claim_lookup',
              success: claim.success,
              program_code: program.programCode,
              matched_student_count: claim.matchedStudentIds?.length ?? 0,
            });

            if (!claim.success) {
              setNeedsLastNameConfirm(Boolean(claim.needsLastNameConfirm));
              setError(
                claim.needsLastNameConfirm
                  ? (claim.message ?? 'Multiple children matched. Enter your last name to continue.')
                  : hasRememberedProgram && portalIntent === 'parent'
                    ? PORTAL_EMAIL_NOT_CONNECTED_MESSAGE
                    : (claim.message ?? PORTAL_ACCESS_NOT_FOUND_MESSAGE),
              );
              setSubmitting(false);
              return;
            }

            if (claim.familyProgram) {
              writeLastPilotProgram(
                claim.familyProgram,
                'family',
                credential,
                resolveOngoingFamilyAccessCode(claim.familyProgram, trimmedCode),
              );
            }

            persistRememberedDevice({
              rememberDevice,
              userType: 'parent',
              accessCode: resolveOngoingFamilyAccessCode(claim.familyProgram ?? program, trimmedCode),
              program: claim.familyProgram ?? program,
              parentId: credential.trim().toLowerCase(),
            });

            setAccessCode('');
            setParentEmail('');
            setParentLastName('');
            setNeedsLastNameConfirm(false);
            navigateToPortal(resolveFamilyPortalOverviewPath(), 'parent-claim-family');
            portalDebug('portal load step', {
              step: 'route_decision',
              destination: resolveFamilyPortalOverviewPath(),
              reason: 'parent-claim-family',
            });
            setSubmitting(false);
            onUnlock?.();
            return;
          }

          if (role === 'facilitator') {
            if (portalIntent === 'student' || portalIntent === 'parent') {
              setError(
                portalIntent === 'student'
                  ? 'Student PINs use family access codes. Switch to Parent / Guardian or use your family access code.'
                  : 'This access code is for facilitators. Switch to Facilitator or use your family access code.',
              );
              setSubmitting(false);
              return;
            }

            const email = parentEmail.trim();
            if (!email) {
              setError('Enter your facilitator email to continue.');
              setSubmitting(false);
              return;
            }

            if (STUDENT_PIN_RE.test(email)) {
              setError(
                'Student PINs use family access codes. Enter your parent/guardian email or use your family access code with a student PIN.',
              );
              setSubmitting(false);
              return;
            }

            clearParentClaimContext();
            clearStudentPinSession();

            const facilitatorVerified = verifyFacilitatorProgramEmail(program, email, trimmedCode);
            if (!facilitatorVerified.success) {
              setError(
                hasRememberedProgram && portalIntent === 'facilitator'
                  ? PORTAL_EMAIL_NOT_CONNECTED_MESSAGE
                  : (facilitatorVerified.message ?? PORTAL_ACCESS_NOT_FOUND_MESSAGE),
              );
              setSubmitting(false);
              return;
            }

            applyProgramPortalUnlock(program, role, trimmedCode);
            writeLastPilotProgram(program, role, email, trimmedCode);
            trackKitFacilitatorSignup({
              facilitatorEmail: email,
              eventName: 'facilitator_unlock',
              metadata: { program_code: program.programCode, source: 'portal_unlock' },
            });
            persistRememberedDevice({
              rememberDevice,
              userType: 'facilitator',
              accessCode: trimmedCode,
              program,
              facilitatorId: email.trim().toLowerCase(),
            });
            setAccessCode('');
            setParentEmail('');
            setParentLastName('');
            setNeedsLastNameConfirm(false);
            navigateToPortal(facilitatorReturnSessionPath(), 'facilitator-email-verified');
            portalDebug('portal load step', {
              step: 'route_decision',
              destination: facilitatorReturnSessionPath(),
              reason: 'facilitator-email-verified',
            });
            setSubmitting(false);
            onUnlock?.();
            return;
          }

          setError(PORTAL_CODE_NOT_FOUND_MESSAGE);
          setSubmitting(false);
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
      }

      if (isProgramShaped) {
        setError(PORTAL_CODE_NOT_FOUND_MESSAGE);
        return;
      }

      if (isLegacyDemoUnlockAllowed() && isLegacyDemoAccessCode(trimmedCode) && isBlueRibbonPilotCode(trimmedCode)) {
        writePortalSessionUnlock('pilot');
        writeBlueRibbonUnlock();
        writeActivePortalRole('facilitator');
        setAccessCode('');
        onUnlock?.();
        navigateToPortal(BLUE_RIBBON_PILOT_PATH, 'blueribbon-pilot-code');
        return;
      }

      if (
        isLegacyDemoUnlockAllowed() &&
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
    [accessCode, hasRememberedProgram, onUnlock, parentEmail, parentLastName, portalIntent, rememberDevice, rememberedAccessCode],
  );

  const cancelPendingParentPinClaim = useCallback(() => {
    setPendingParentPinClaim(null);
    setClaimError(null);
    setParentEmail('');
    setParentFirstName('');
    setParentLastName('');
    setParentPhone('');
  }, []);

  const completePendingParentPinClaim = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!pendingParentPinClaim) return;

      setClaimError(null);
      setClaimSubmitting(true);

      const payload: ParentClaimViaStudentPinInput = {
        program: pendingParentPinClaim.program,
        accessCode: pendingParentPinClaim.accessCode,
        participantId: pendingParentPinClaim.participantId,
        childDisplayName: pendingParentPinClaim.childDisplayName,
        parentEmail,
        parentFirstName: parentFirstName.trim() || undefined,
        parentLastName: parentLastName.trim() || undefined,
        parentPhone: parentPhone.trim() || undefined,
      };

      let result: Awaited<ReturnType<typeof completeParentClaimViaStudentPin>>;
      try {
        result = await withTimeout(
          completeParentClaimViaStudentPin(payload),
          PORTAL_LOGIN_TIMEOUT_MS,
          'portal_parent_claim_via_pin',
        );
      } catch (err) {
        portalDebug('portal load step', {
          step: 'parent_claim_via_pin_failed',
          reason: err instanceof FetchTimeoutError ? 'timeout' : 'error',
        });
        setClaimError(PORTAL_SLOW_LOAD_MESSAGE);
        setClaimSubmitting(false);
        return;
      }
      if (!result.success) {
        setClaimError(result.message ?? PORTAL_ACCESS_NOT_FOUND_MESSAGE);
        setClaimSubmitting(false);
        return;
      }

      persistRememberedDevice({
        rememberDevice,
        userType: 'parent',
        accessCode: resolveOngoingFamilyAccessCode(
          result.familyProgram ?? pendingParentPinClaim.program,
          pendingParentPinClaim.accessCode,
        ),
        program: result.familyProgram ?? pendingParentPinClaim.program,
        parentId: parentEmail.trim().toLowerCase(),
      });

      setPendingParentPinClaim(null);
      setAccessCode('');
      setParentEmail('');
      setParentFirstName('');
      setParentLastName('');
      setParentPhone('');
      setClaimSubmitting(false);
      navigateToPortal(result.overviewPath ?? resolveFamilyPortalOverviewPath(), 'parent-claim-via-pin');
      onUnlock?.();
    },
    [
      onUnlock,
      parentEmail,
      parentFirstName,
      parentLastName,
      parentPhone,
      pendingParentPinClaim,
      rememberDevice,
    ],
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
    parentFirstName,
    parentPhone,
    needsLastNameConfirm,
    portalIntent,
    pendingParentPinClaim,
    claimSubmitting,
    claimError,
    rememberDevice,
    hasRememberedProgram,
    rememberedSession: remembered,
    error,
    submitting,
    handleSubmit,
    completePendingParentPinClaim,
    cancelPendingParentPinClaim,
    onAccessCodeChange: handleAccessCodeChange,
    onPortalIntentChange: (intent: PortalLoginIntent) => {
      setPortalIntent(intent);
      setError(null);
      setParentEmail('');
      setParentLastName('');
      setNeedsLastNameConfirm(false);
    },
    onParentEmailChange: (value: string) => {
      setParentEmail(value);
      if (error) setError(null);
      if (STUDENT_PIN_RE.test(value.trim())) {
        setRememberDevice(false);
      } else if (value.trim()) {
        setRememberDevice(defaultRememberDeviceForUserType('parent'));
      }
    },
    onParentFirstNameChange: setParentFirstName,
    onParentPhoneChange: setParentPhone,
    onParentLastNameChange: (value: string) => {
      setParentLastName(value);
      if (error) setError(null);
    },
    onRememberDeviceChange: setRememberDevice,
    clearAccessCode: () => setAccessCode(''),
    setError,
  };
}
