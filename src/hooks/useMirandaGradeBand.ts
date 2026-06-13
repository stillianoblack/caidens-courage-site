import { useCallback, useEffect, useState } from 'react';
import { readActiveChildParticipantId, CHILD_PROFILE_UPDATED_EVENT } from '../config/activeChildParticipant';
import {
  readParticipantGradeSettingsAsync,
  resolveMirandaGradeBandForParticipant,
  type MirandaGradeBandResolution,
  type ParticipantGradeSettingsSnapshot,
} from '../lib/mirandaGradeBandResolver';
import { isFamilyGradeBand } from '../data/familyGradeBandOptions';
import { hasCanonicalGradeLevel } from '../lib/participantGradeDisplay';
import { resolveAdaptiveGradeBand } from '../lib/getGradeBand';

function resolveFromGradeSettings(
  settings: ParticipantGradeSettingsSnapshot,
): MirandaGradeBandResolution {
  const { gradeLevel, gradeBand, allowStretch } = settings;
  const familyGradeBand = gradeBand && isFamilyGradeBand(gradeBand) ? gradeBand : null;
  const hasLevel = hasCanonicalGradeLevel(gradeLevel);
  const hasBand = Boolean(gradeBand?.trim());

  const band = resolveAdaptiveGradeBand({
    gradeLevel,
    gradeBand,
    allowStretch,
  });

  return {
    band,
    bandKey: band,
    missingGrade: !hasLevel && !hasBand,
    needsGradeSelection: !hasLevel && hasBand,
    familyGradeBand,
    allowStretch,
  };
}

export function useMirandaGradeBand(participantId?: string): MirandaGradeBandResolution {
  const [resolution, setResolution] = useState<MirandaGradeBandResolution>(() =>
    resolveMirandaGradeBandForParticipant(participantId),
  );

  const refresh = useCallback(() => {
    const id = participantId?.trim() || readActiveChildParticipantId();
    if (!id) {
      setResolution(resolveMirandaGradeBandForParticipant(participantId));
      return;
    }

    void readParticipantGradeSettingsAsync(id).then((settings) => {
      setResolution(resolveFromGradeSettings(settings));
    });
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
