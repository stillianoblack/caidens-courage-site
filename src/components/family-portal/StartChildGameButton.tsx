import React, { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { launchFamilyKidPlay } from '../../lib/launchFamilyKidPlay';
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
      const result = await launchFamilyKidPlay({
        childId,
        returnPath: location.pathname,
        navigate,
      });
      if (!result.ok) {
        showToast(result.message, 'error');
      }
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
