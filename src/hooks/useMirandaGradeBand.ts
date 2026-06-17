import { useCallback, useEffect, useState } from 'react';
import { readActiveChildParticipantId, CHILD_PROFILE_UPDATED_EVENT } from '../config/activeChildParticipant';
import {
  readParticipantGradeSettings,
  readParticipantGradeSettingsAsync,
  resolveMirandaGradeBandForParticipant,
  type MirandaGradeBandResolution,
  type ParticipantGradeSettingsSnapshot,
} from '../lib/mirandaGradeBandResolver';
import { isFamilyGradeBand } from '../data/familyGradeBandOptions';
import { hasCanonicalGradeLevel } from '../lib/participantGradeDisplay';
import { resolveBaseGradeBand } from '../lib/getGradeBand';

function resolveFromGradeSettings(
  settings: ParticipantGradeSettingsSnapshot,
  loading: boolean,
): MirandaGradeBandResolution {
  const { gradeLevel, gradeBand, allowStretch } = settings;
  const familyGradeBand = gradeBand && isFamilyGradeBand(gradeBand) ? gradeBand : null;
  const hasLevel = hasCanonicalGradeLevel(gradeLevel);
  const hasBand = Boolean(gradeBand?.trim());

  const baseBand = resolveBaseGradeBand({
    gradeLevel,
    gradeBand,
  });

  return {
    band: baseBand,
    baseBand,
    bandKey: baseBand,
    gradeLevel,
    gradeBand,
    loading,
    missingGrade: !hasLevel && !hasBand,
    needsGradeSelection: !hasLevel && hasBand,
    familyGradeBand,
    allowStretch,
  };
}

export function useMirandaGradeBand(participantId?: string): MirandaGradeBandResolution {
  const resolvedParticipantId = participantId?.trim() || readActiveChildParticipantId();
  const syncSettings = readParticipantGradeSettings(resolvedParticipantId ?? undefined);
  const needsAsyncHydration =
    Boolean(resolvedParticipantId) &&
    !hasCanonicalGradeLevel(syncSettings.gradeLevel) &&
    !syncSettings.gradeBand?.trim();

  const [resolution, setResolution] = useState<MirandaGradeBandResolution>(() =>
    needsAsyncHydration
      ? resolveFromGradeSettings(syncSettings, true)
      : resolveMirandaGradeBandForParticipant(participantId),
  );

  const refresh = useCallback(() => {
    const id = participantId?.trim() || readActiveChildParticipantId();
    if (!id) {
      setResolution(resolveFromGradeSettings(
        { gradeLevel: null, gradeBand: null, allowStretch: false },
        false,
      ));
      return;
    }

    const localSync = readParticipantGradeSettings(id);
    const awaitingRemote =
      !hasCanonicalGradeLevel(localSync.gradeLevel) && !localSync.gradeBand?.trim();
    if (awaitingRemote) {
      setResolution(resolveFromGradeSettings(localSync, true));
    }

    // Stale-while-revalidate: keep the current band visible during background refresh
    // so active missions are not unmounted (questionIndex would reset to 0).
    void readParticipantGradeSettingsAsync(id).then((settings) => {
      setResolution(resolveFromGradeSettings(settings, false));
    });
  }, [participantId]);

  useEffect(() => {
    refresh();
  }, [refresh, resolvedParticipantId]);

  useEffect(() => {
    const handleUpdate = () => refresh();
    window.addEventListener(CHILD_PROFILE_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(CHILD_PROFILE_UPDATED_EVENT, handleUpdate);
  }, [refresh]);

  return resolution;
}
