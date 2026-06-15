import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import GameAssessmentFlow from '../game-assessment/GameAssessmentFlow';
import {
  canPreviewMirandaGradeBand,
  readMirandaGradeBandPreviewParam,
  readParticipantGradeSettings,
} from '../../lib/mirandaGradeBandResolver';
import { readActiveChildParticipantId } from '../../config/activeChildParticipant';
import {
  getCaidenQuestById,
  isCaidenAdaptiveQuest,
  resolveCaidenQuestConfig,
} from '../../data/caiden';
import { caidenContentVersionId } from '../../data/caiden/caidenAdaptiveBuilder';
import { useCaidenGradeBand } from '../../hooks/useCaidenGradeBand';
import MirandaGradeBandPreview from '../miranda/MirandaGradeBandPreview';
import '../miranda/miranda-grade-band-preview.css';

type CaidenQuestFlowProps = {
  questId: string;
  themeClassName?: string;
  exitPath: string;
  exitLabel?: string;
  embedded?: boolean;
  skipLanding?: boolean;
  familyPortalPath?: string;
};

export default function CaidenQuestFlow({
  questId,
  themeClassName = 'caiden-game',
  exitPath,
  exitLabel,
  embedded = false,
  skipLanding = false,
  familyPortalPath,
}: CaidenQuestFlowProps) {
  const location = useLocation();
  const quest = getCaidenQuestById(questId);
  const gradeResolution = useCaidenGradeBand();
  const gradeSettings = readParticipantGradeSettings();
  const participantId = readActiveChildParticipantId();

  const previewBand = useMemo(() => {
    if (!canPreviewMirandaGradeBand(location.pathname)) return null;
    return readMirandaGradeBandPreviewParam(location.search);
  }, [location.pathname, location.search]);

  const activeGradeBand = previewBand ?? gradeResolution.band;

  const config = useMemo(
    () =>
      resolveCaidenQuestConfig(questId, activeGradeBand, {
        participantId,
        gradeLevel: gradeSettings.gradeLevel,
      }),
    [activeGradeBand, gradeSettings.gradeLevel, participantId, questId],
  );

  const completionContext = useMemo(() => {
    if (!isCaidenAdaptiveQuest(questId)) return undefined;
    return {
      gradeBandUsed: activeGradeBand,
      contentVersionId: caidenContentVersionId(questId, activeGradeBand),
      fileId: questId,
      missionId: questId,
    };
  }, [activeGradeBand, questId]);

  if (!quest || !config) {
    return null;
  }

  const showPreviewPill = Boolean(previewBand);

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
        useCaidenHeader
        embedded={embedded}
        skipLanding={skipLanding}
        familyPortalPath={familyPortalPath}
        completionContext={completionContext}
      />
    </>
  );
}
