import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import GameAssessmentFlow from '../game-assessment/GameAssessmentFlow';
import {
  canPreviewMirandaGradeBand,
  readMirandaGradeBandPreviewParam,
  readParticipantGradeSettings,
  readParticipantGradeSettingsAsync,
  resolveMirandaGradeBandKey,
  type ParticipantGradeSettingsSnapshot,
} from '../../lib/mirandaGradeBandResolver';
import {
  getB4MissionById,
  isB4AdaptiveMission,
  resolveB4MissionConfig,
} from '../../data/b4';
import { b4ContentVersionId } from '../../data/b4/b4AdaptiveBuilder';
import { useB4GradeBand } from '../../hooks/useB4GradeBand';
import { useStableAdaptiveMissionConfig } from '../../hooks/useStableAdaptiveMissionConfig';
import MirandaGradeBandPreview from '../miranda/MirandaGradeBandPreview';
import B4BaselineGradeGate from '../b4-baseline-check/B4BaselineGradeGate';
import { readActiveChildParticipantId, CHILD_PROFILE_UPDATED_EVENT } from '../../config/activeChildParticipant';
import { ensureWeekGradeLevel, readWeekGradeLevel } from '../../lib/participantWeekGradeService';
import { normalizeGradeLevelStorage } from '../../data/gradeLevelOptions';
import { hasCanonicalGradeLevel } from '../../lib/participantGradeDisplay';
import '../miranda/miranda-grade-band-preview.css';
import '../b4-baseline-check/b4-baseline-check.css';

type B4MissionFlowProps = {
  missionId: string;
  themeClassName?: string;
  exitPath: string;
  exitLabel?: string;
  embedded?: boolean;
  skipLanding?: boolean;
  familyPortalPath?: string;
};

export default function B4MissionFlow({
  missionId,
  themeClassName = 'b4-game',
  exitPath,
  exitLabel,
  embedded = false,
  skipLanding = false,
  familyPortalPath,
}: B4MissionFlowProps) {
  const location = useLocation();
  const mission = getB4MissionById(missionId);
  const gradeResolution = useB4GradeBand();
  const [gradeSettings, setGradeSettings] = useState<ParticipantGradeSettingsSnapshot>(() =>
    readParticipantGradeSettings(),
  );
  const [weekGradeLevel, setWeekGradeLevel] = useState<string | null>(null);
  const [gradeReady, setGradeReady] = useState(false);

  const participantId = readActiveChildParticipantId();
  const weekId = 'week-1';

  const refreshGradeSettings = useCallback(async () => {
    if (!participantId) {
      setGradeSettings({ gradeLevel: null, gradeBand: null, allowStretch: false });
      setWeekGradeLevel(null);
      setGradeReady(true);
      return;
    }

    const settings = await readParticipantGradeSettingsAsync(participantId);
    const weekGrade = await ensureWeekGradeLevel(participantId, weekId);
    setGradeSettings(settings);
    setWeekGradeLevel(weekGrade ?? (await readWeekGradeLevel(participantId, weekId)));
    setGradeReady(true);
  }, [participantId, weekId]);

  useEffect(() => {
    void refreshGradeSettings();
  }, [refreshGradeSettings]);

  useEffect(() => {
    const handleUpdate = () => {
      void refreshGradeSettings();
    };
    window.addEventListener(CHILD_PROFILE_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(CHILD_PROFILE_UPDATED_EVENT, handleUpdate);
  }, [refreshGradeSettings]);

  const previewBand = useMemo(() => {
    if (!canPreviewMirandaGradeBand(location.pathname)) return null;
    return readMirandaGradeBandPreviewParam(location.search);
  }, [location.pathname, location.search]);

  const lockedGradeLevel =
    normalizeGradeLevelStorage(weekGradeLevel) ??
    normalizeGradeLevelStorage(gradeSettings.gradeLevel);

  const hasGrade = hasCanonicalGradeLevel(lockedGradeLevel);

  const activeGradeBand =
    previewBand ??
    (lockedGradeLevel
      ? resolveMirandaGradeBandKey({
          gradeLevel: lockedGradeLevel,
          allowStretch: gradeSettings.allowStretch,
        })
      : gradeResolution.band);

  const resolvedConfig = useMemo(
    () =>
      resolveB4MissionConfig(missionId, activeGradeBand, {
        participantId,
        gradeLevel: lockedGradeLevel ?? gradeSettings.gradeLevel,
      }),
    [activeGradeBand, gradeSettings.gradeLevel, lockedGradeLevel, missionId, participantId],
  );
  const config = useStableAdaptiveMissionConfig(resolvedConfig);

  const gradeDiagnostics = useMemo(
    () => ({
      participantId,
      gradeLevel: lockedGradeLevel ?? gradeSettings.gradeLevel,
      familyGradeBand: gradeSettings.gradeBand,
      baseBand: lockedGradeLevel
        ? resolveMirandaGradeBandKey({
            gradeLevel: lockedGradeLevel,
            familyGradeBand: gradeSettings.gradeBand,
          })
        : activeGradeBand,
      contentBand: config?.adaptiveMeta?.contentBand ?? activeGradeBand,
      allowStretch: gradeSettings.allowStretch,
      usedStretch: config?.adaptiveMeta?.usedStretch ?? false,
    }),
    [
      activeGradeBand,
      config?.adaptiveMeta?.contentBand,
      config?.adaptiveMeta?.usedStretch,
      gradeSettings.allowStretch,
      gradeSettings.gradeBand,
      gradeSettings.gradeLevel,
      lockedGradeLevel,
      participantId,
    ],
  );

  const completionContext = useMemo(() => {
    if (!isB4AdaptiveMission(missionId)) return undefined;
    return {
      gradeBandUsed: activeGradeBand,
      gradeLevelUsed: lockedGradeLevel ?? gradeSettings.gradeLevel ?? undefined,
      contentVersionId: b4ContentVersionId(missionId, activeGradeBand),
      fileId: missionId,
      missionId,
    };
  }, [activeGradeBand, gradeSettings.gradeLevel, lockedGradeLevel, missionId]);

  if (!mission) {
    return null;
  }

  if (!config && !gradeReady) {
    return (
      <div className={themeClassName}>
        <p className="bbc-fieldHint" role="status">Loading mission…</p>
      </div>
    );
  }

  if (!config) {
    return null;
  }

  const showPreviewPill = Boolean(previewBand);
  const needsGradeGate =
    skipLanding && embedded && !showPreviewPill && participantId && gradeReady && !hasGrade;

  if (needsGradeGate) {
    return (
      <div className={themeClassName}>
        <B4BaselineGradeGate
          participantId={participantId}
          onComplete={() => {
            void refreshGradeSettings();
          }}
        />
      </div>
    );
  }

  return (
    <>
      {showPreviewPill && previewBand ? (
        <MirandaGradeBandPreview bandKey={previewBand} />
      ) : null}
      <GameAssessmentFlow
        config={config}
        themeClassName={themeClassName}
        exitPath={exitPath}
        exitLabel={exitLabel}
        useB4Header
        embedded={embedded}
        skipLanding={skipLanding || hasGrade}
        familyPortalPath={familyPortalPath}
        completionContext={completionContext}
        gradeDiagnostics={gradeDiagnostics}
        missionCharacterId="b4"
      />
    </>
  );
}
