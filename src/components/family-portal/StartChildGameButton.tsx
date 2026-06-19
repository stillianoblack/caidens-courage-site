import React, { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { kidPlaySessionPath } from '../../config/courageRoutes';
import { resolveFamilyKidPlayLaunch } from '../../lib/familyKidPlayLaunch';
import { setKidPlayFamilySoftLocked } from '../../lib/kidPlayFamilySoftLock';
import { kidShellAwareNavigate } from '../../lib/kidShellNav';
import { writeKidPlayFamilyReturnBase } from '../../lib/kidPlayShellRoutes';
import { useToast } from '../portal-design-system/ToastProvider';
import './start-child-game-button.css';

type StartChildGameButtonProps = {
  participantId: string;
  displayName?: string;
  className?: string;
};

export default function StartChildGameButton({
  participantId,
  displayName,
  className,
}: StartChildGameButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(async () => {
    const childId = participantId.trim();
    if (!childId || loading) return;

    setLoading(true);
    try {
      const result = await resolveFamilyKidPlayLaunch({ childId });
      if (result.kind === 'error') {
        showToast(result.message, 'error');
        return;
      }

      setKidPlayFamilySoftLocked(false);
      writeKidPlayFamilyReturnBase(location.pathname);
      kidShellAwareNavigate(navigate, kidPlaySessionPath(result.session.id), {
        state: { fromFamilyPortal: location.pathname },
      });
    } finally {
      setLoading(false);
    }
  }, [loading, location.pathname, navigate, participantId, showToast]);

  return (
    <button
      type="button"
      className={['startChildGameBtn', className].filter(Boolean).join(' ')}
      onClick={() => void handleClick()}
      disabled={loading}
      aria-label={
        displayName
          ? `Start child game for ${displayName}`
          : 'Start child game for active player'
      }
    >
      {loading ? 'Starting…' : 'Start Child Game'}
    </button>
  );
}
