import { useCallback, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { looksLikeProgramAccessCode, PORTAL_DB_UNAVAILABLE_MESSAGE } from '../lib/portalAccessCodes';
import { logPortalRedirect } from '../lib/portalDebug';
import { resetPortalScroll } from '../lib/portalScroll';
import { isSupabaseConfigReady } from '../lib/supabaseClient';

export type PortalUnlockVariant = 'nav' | 'hero';

const ERROR_BY_VARIANT: Record<PortalUnlockVariant, string> = {
  nav: "That code didn't work.",
  hero: "That code didn't work. Check your code or contact the Caiden's Courage team.",
};

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

function navigateToPortal(
  navigate: ReturnType<typeof useNavigate>,
  destination: string,
  reason: string,
): void {
  resetPortalScroll();
  logPortalRedirect('/portal', destination, reason);
  navigate(destination, { replace: true });
}

export function usePortalUnlock(variant: PortalUnlockVariant, onUnlock?: () => void) {
  const navigate = useNavigate();
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
        setError(ERROR_BY_VARIANT[variant]);
        return;
      }

      if (BASELINE_RESULTS_CODES.has(normalizedCode)) {
        setAccessCode('');
        onUnlock?.();
        navigateToPortal(navigate, B4_RESULTS_ADMIN_PATH, 'baseline-results-code');
        return;
      }

      // Supabase pilot_programs lookup first (trimmed, case-insensitive).
      if (isSupabaseConfigReady()) {
        setSubmitting(true);
        const lookup = await lookupPilotProgramByAccessCodeDetailed(trimmedCode);
        setSubmitting(false);

        if (lookup.status === 'found' && lookup.result) {
          const { program, role } = lookup.result;
          applyProgramPortalUnlock(program, role, trimmedCode);
          writeLastPilotProgram(program, role, program.adminEmail);
          setAccessCode('');
          onUnlock?.();
          const destination = role === 'family' ? FAMILY_HUB_PATH : PROGRAM_DASHBOARD_PATH;
          navigateToPortal(navigate, destination, `program-code-${role}`);
          return;
        }

        if (lookup.status === 'unavailable' && looksLikeProgramAccessCode(trimmedCode)) {
          setError(PORTAL_DB_UNAVAILABLE_MESSAGE);
          return;
        }
      } else if (looksLikeProgramAccessCode(trimmedCode)) {
        setError(PORTAL_DB_UNAVAILABLE_MESSAGE);
        return;
      }

      // Legacy demo codes (fallback only).
      if (isBlueRibbonPilotCode(trimmedCode)) {
        writePortalSessionUnlock('pilot');
        writeBlueRibbonUnlock();
        writeActivePortalRole('facilitator');
        setAccessCode('');
        onUnlock?.();
        navigateToPortal(navigate, BLUE_RIBBON_PILOT_PATH, 'blueribbon-pilot-code');
        return;
      }

      if (isBlueRibbonFamilyCode(trimmedCode) || isBlueRibbonKidsCode(trimmedCode)) {
        writeFamilyPortalSession();
        writeBlueRibbonUnlock();
        writeActivePortalRole('family');
        setAccessCode('');
        onUnlock?.();
        navigateToPortal(navigate, FAMILY_PORTAL_PATH, 'blueribbon-family-code');
        return;
      }

      const tier = resolvePortalAccessCode(trimmedCode);
      if (!tier) {
        setError(ERROR_BY_VARIANT[variant]);
        return;
      }

      writePortalSessionUnlock(tier.type);
      setAccessCode('');
      onUnlock?.();
      navigateToPortal(navigate, getDashboardPathForTier(tier), `tier-code-${tier.type}`);
    },
    [accessCode, navigate, onUnlock, variant],
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
