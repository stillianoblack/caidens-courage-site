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
import { lookupPilotProgramByAccessCode } from '../lib/pilotProgramService';

export type PortalUnlockVariant = 'nav' | 'hero';

const ERROR_BY_VARIANT: Record<PortalUnlockVariant, string> = {
  nav: "That code didn't work.",
  hero: "That code didn't work. Check your code or contact the Caiden's Courage team.",
};

const BASELINE_RESULTS_CODES = new Set(['results', 'result']);

function normalizePilotAccessCode(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, '');
}

function isBlueRibbonPilotCode(raw: string): boolean {
  const normalized = normalizePilotAccessCode(raw);
  return normalized === 'blueribbon2026' || normalized === 'blueribbon';
}

function isBlueRibbonFamilyCode(raw: string): boolean {
  const normalized = normalizePilotAccessCode(raw);
  return normalized === 'blueribbonfamily';
}

function isBlueRibbonKidsCode(raw: string): boolean {
  const normalized = normalizePilotAccessCode(raw);
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

      const normalizedCode = accessCode.trim().toLowerCase();
      if (BASELINE_RESULTS_CODES.has(normalizedCode)) {
        setAccessCode('');
        onUnlock?.();
        navigate(B4_RESULTS_ADMIN_PATH);
        return;
      }

      if (isBlueRibbonPilotCode(accessCode)) {
        writePortalSessionUnlock('pilot');
        writeBlueRibbonUnlock();
        setAccessCode('');
        onUnlock?.();
        navigate(BLUE_RIBBON_PILOT_PATH);
        return;
      }

      if (isBlueRibbonFamilyCode(accessCode) || isBlueRibbonKidsCode(accessCode)) {
        writeFamilyPortalSession();
        writeBlueRibbonUnlock();
        setAccessCode('');
        onUnlock?.();
        navigate(FAMILY_PORTAL_PATH);
        return;
      }

      setSubmitting(true);
      const programMatch = await lookupPilotProgramByAccessCode(accessCode);
      setSubmitting(false);

      if (programMatch) {
        applyProgramPortalUnlock(programMatch.program, programMatch.role);
        writeLastPilotProgram(programMatch.program, programMatch.role, programMatch.program.adminEmail);
        setAccessCode('');
        onUnlock?.();
        navigate(programMatch.role === 'family' ? FAMILY_HUB_PATH : PROGRAM_DASHBOARD_PATH);
        return;
      }

      const tier = resolvePortalAccessCode(accessCode);
      if (!tier) {
        setError(ERROR_BY_VARIANT[variant]);
        return;
      }

      writePortalSessionUnlock(tier.type);
      setAccessCode('');
      onUnlock?.();
      navigate(getDashboardPathForTier(tier));
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
