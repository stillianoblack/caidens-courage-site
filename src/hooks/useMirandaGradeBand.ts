import { useCallback, useEffect, useState } from 'react';
import { CHILD_PROFILE_UPDATED_EVENT } from '../config/activeChildParticipant';
import {
  resolveMirandaGradeBandForParticipant,
  type MirandaGradeBandResolution,
} from '../lib/mirandaGradeBandResolver';

export function useMirandaGradeBand(participantId?: string): MirandaGradeBandResolution {
  const [resolution, setResolution] = useState<MirandaGradeBandResolution>(() =>
    resolveMirandaGradeBandForParticipant(participantId),
  );

  const refresh = useCallback(() => {
    setResolution(resolveMirandaGradeBandForParticipant(participantId));
  }, [participantId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const handleUpdate = () => refresh();
    window.addEventListener(CHILD_PROFILE_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(CHILD_PROFILE_UPDATED_EVENT, handleUpdate);
  }, [refresh]);

  return resolution;
}
