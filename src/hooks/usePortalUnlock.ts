import { useCallback, useState, type FormEvent } from 'react';
import {
  B4_RESULTS_ADMIN_PATH,
  BLUE_RIBBON_PILOT_PATH,
  FAMILY_HUB_PATH,
  FAMILY_PORTAL_PATH,
  PROGRAM_DASHBOARD_PATH,
} from '../config/courageRoutes';
import { writeBlueRibbonUnlock } from '../config/blueRibbonPortalAccess';
import { applyProgramPortalUnlock, writeActivePortalRole } from '../config/portalContext';
import { writeFamilyPortalSession } from '../config/familyPortalAccess';
import { writeLastPilotProgram } from '../config/lastPilotProgram';
import {
  getDashboardPathForTier,
  resolvePortalAccessCode,
  writePortalSessionUnlock,
} from '../config/portalAccess';
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

export type PortalUnlockVariant = 'nav' | 'hero';

const BASELINE_RESULTS_CODES = new Set(['results', 'result']);

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

export function usePortalUnlock(_variant: PortalUnlockVariant, onUnlock?: () => void) {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);

      const trimmedCode = accessCode.trim();
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
          applyProgramPortalUnlock(program, role, trimmedCode);
          writeLastPilotProgram(program, role, program.adminEmail, trimmedCode);
          setAccessCode('');
          const destination = role === 'family' ? FAMILY_HUB_PATH : PROGRAM_DASHBOARD_PATH;
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

      // Legacy demo codes only — never for program-shaped codes.
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
        navigateToPortal(FAMILY_PORTAL_PATH, 'blueribbon-family-code');
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
    [accessCode, onUnlock],
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
    error,
    submitting,
    handleSubmit,
    onAccessCodeChange: handleAccessCodeChange,
    clearAccessCode: () => setAccessCode(''),
    setError,
  };
}
