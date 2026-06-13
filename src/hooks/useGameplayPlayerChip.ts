import { useMemo } from 'react';
import { useActiveParticipant } from './useActiveParticipant';

/**
 * Family Portal gameplay header chip — roster-validated child only.
 */
export function useGameplayPlayerChip() {
  const { participant, playerLabel, hasActiveParticipant } = useActiveParticipant();

  return useMemo(() => {
    const label = hasActiveParticipant ? playerLabel : 'Choose Player';
    const nameForAvatar = hasActiveParticipant
      ? participant?.displayName?.trim() || playerLabel.split('·')[0]?.trim() || 'Player'
      : '';
    const avatarLetter = hasActiveParticipant
      ? nameForAvatar.charAt(0).toUpperCase() || 'P'
      : '?';

    return {
      label,
      displayName: nameForAvatar,
      avatarLetter,
      hasActiveParticipant,
      participantId: participant?.participantId ?? '',
      showChip: true,
    };
  }, [hasActiveParticipant, participant, playerLabel]);
}
