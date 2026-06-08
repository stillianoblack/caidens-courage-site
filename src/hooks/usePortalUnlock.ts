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
import { writeFamilyPortalSession } from '../config/familyPortalAccess';
import { applyProgramPortalUnlock } from '../config/portalContext';
import { writeLastPilotProgram } from '../config/lastPilotProgram';
import {
  getDashboardPathForTier,
  resolvePortalAccessCode,
  writePortalSessionUnlock,
} from '../config/portalAccess';
import { lookupPilotProgramByAccessCodeDetailed } from '../lib/pilotProgramService';
import { looksLikeProgramAccessCode, PORTAL_DB_UNAVAILABLE_MESSAGE } from '../lib/portalAccessCodes';
import { logPortalRedirect } from '../lib/portalDebug';
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

      if (BASELINE_RESULTS_CODES.has(normalizedCode)) {
        setAccessCode('');
        onUnlock?.();
        logPortalRedirect('/portal', B4_RESULTS_ADMIN_PATH, 'baseline-results-code');
        navigate(B4_RESULTS_ADMIN_PATH);
        return;
      }

      if (isBlueRibbonPilotCode(trimmedCode)) {
        writePortalSessionUnlock('pilot');
        writeBlueRibbonUnlock();
        setAccessCode('');
        onUnlock?.();
        logPortalRedirect('/portal', BLUE_RIBBON_PILOT_PATH, 'blueribbon-pilot-code');
        navigate(BLUE_RIBBON_PILOT_PATH);
        return;
      }

      if (isBlueRibbonFamilyCode(trimmedCode) || isBlueRibbonKidsCode(trimmedCode)) {
        writeFamilyPortalSession();
        writeBlueRibbonUnlock();
        setAccessCode('');
        onUnlock?.();
        logPortalRedirect('/portal', FAMILY_PORTAL_PATH, 'blueribbon-family-code');
        navigate(FAMILY_PORTAL_PATH);
        return;
      }

      if (looksLikeProgramAccessCode(trimmedCode)) {
        if (!isSupabaseConfigReady()) {
          setError(PORTAL_DB_UNAVAILABLE_MESSAGE);
          return;
        }

        setSubmitting(true);
        const lookup = await lookupPilotProgramByAccessCodeDetailed(trimmedCode);
        setSubmitting(false);

        if (lookup.status === 'unavailable') {
          setError(PORTAL_DB_UNAVAILABLE_MESSAGE);
          return;
        }

        if (lookup.result) {
          const { program, role } = lookup.result;
          applyProgramPortalUnlock(program, role);
          writeLastPilotProgram(program, role, program.adminEmail);
          setAccessCode('');
          onUnlock?.();
          const destination = role === 'family' ? FAMILY_HUB_PATH : PROGRAM_DASHBOARD_PATH;
          logPortalRedirect('/portal', destination, `program-code-${role}`);
          navigate(destination, { replace: true });
          return;
        }

        setError(ERROR_BY_VARIANT[variant]);
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
      const destination = getDashboardPathForTier(tier);
      logPortalRedirect('/portal', destination, `tier-code-${tier.type}`);
      navigate(destination);
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
  };
}
