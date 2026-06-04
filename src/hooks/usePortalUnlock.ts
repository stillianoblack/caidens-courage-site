import { useCallback, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getDashboardPathForTier,
  resolvePortalAccessCode,
  writePortalSessionUnlock,
} from '../config/portalAccess';

export type PortalUnlockVariant = 'nav' | 'hero';

const ERROR_BY_VARIANT: Record<PortalUnlockVariant, string> = {
  nav: "That code didn't work.",
  hero: "That code didn't work. Check your code or contact the Caiden's Courage team.",
};

export function usePortalUnlock(variant: PortalUnlockVariant, onUnlock?: () => void) {
  const navigate = useNavigate();
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);

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
    [accessCode, navigate, onUnlock, variant]
  );

  const handleAccessCodeChange = useCallback(
    (value: string) => {
      setAccessCode(value);
      if (error) setError(null);
    },
    [error]
  );

  return {
    accessCode,
    error,
    handleSubmit,
    onAccessCodeChange: handleAccessCodeChange,
  };
}
