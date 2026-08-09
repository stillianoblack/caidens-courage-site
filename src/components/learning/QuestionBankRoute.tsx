import React from 'react';
import { useParams } from 'react-router-dom';
import { useActiveParticipant } from '../../hooks/useActiveParticipant';
import { resolveBaseGradeBand } from '../../lib/getGradeBand';
import QuestionBankExperience from './QuestionBankExperience';

export default function QuestionBankRoute() {
  const { weekNumber = '1' } = useParams();
  const { participantId, roster } = useActiveParticipant();
  const participant = roster.find((entry) => entry.participantId === participantId);
  const gradeBand = participant?.gradeLevel
    ? resolveBaseGradeBand({ gradeLevel: participant.gradeLevel })
    : 'general';

  return (
    <QuestionBankExperience
      moduleKey={`week-${weekNumber}`}
      gradeBand={gradeBand}
      programDefaultGradeBand="general"
    />
  );
}
