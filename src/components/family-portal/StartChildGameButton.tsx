import React, { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { launchFamilyKidPlay } from '../../lib/launchFamilyKidPlay';
import { useToast } from '../portal-design-system/ToastProvider';
import './start-child-game-button.css';
import { setActiveChild } from '../../lib/activeChildContext';

type StartChildGameButtonProps = {
  participantId: string;
  displayName?: string;
  className?: string;
  label?: string;
};

export default function StartChildGameButton({
  participantId,
  displayName,
  className,
  label,
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
      setActiveChild({
        participantId: childId,
        displayName: displayName?.trim() || 'Player',
        firstName: displayName?.trim() || 'Player',
      });
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
  }, [displayName, loading, location.pathname, navigate, participantId, showToast]);

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
      {loading ? 'Starting…' : label || 'Start Child Game'}
    </button>
  );
}
