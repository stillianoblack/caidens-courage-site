import React from 'react';
import type { GameQuestion } from '../../types/gameAssessment';
import './game-question-grade-diagnostics.css';

export type GameQuestionGradeDiagnosticsProps = {
  participantId?: string | null;
  gradeLevel?: string | null;
  familyGradeBand?: string | null;
  baseBand?: string | null;
  contentBand?: string | null;
  allowStretch?: boolean;
  usedStretch?: boolean;
  question?: GameQuestion | null;
};

export default function GameQuestionGradeDiagnostics({
  participantId,
  gradeLevel,
  familyGradeBand,
  baseBand,
  contentBand,
  allowStretch,
  usedStretch,
  question,
}: GameQuestionGradeDiagnosticsProps) {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const diagnostic = question?.diagnosticMeta;

  return (
    <aside className="gameQuestionGradeDiagnostics" aria-label="Adaptive grade diagnostics">
      <p className="gameQuestionGradeDiagnosticsTitle">Grade diagnostics (dev)</p>
      <dl>
        <div>
          <dt>participant</dt>
          <dd>{participantId ?? '—'}</dd>
        </div>
        <div>
          <dt>grade_level</dt>
          <dd>{gradeLevel ?? '—'}</dd>
        </div>
        <div>
          <dt>family grade band</dt>
          <dd>{familyGradeBand ?? '—'}</dd>
        </div>
        <div>
          <dt>base band</dt>
          <dd>{baseBand ?? '—'}</dd>
        </div>
        <div>
          <dt>content band</dt>
          <dd>{contentBand ?? diagnostic?.contentBand ?? '—'}</dd>
        </div>
        <div>
          <dt>question source</dt>
          <dd>{diagnostic?.sourceBand ?? diagnostic?.contentBand ?? '—'}</dd>
        </div>
        <div>
          <dt>allow_stretch</dt>
          <dd>{allowStretch ? 'true' : 'false'}</dd>
        </div>
        <div>
          <dt>used_stretch</dt>
          <dd>{usedStretch ? 'true' : 'false'}</dd>
        </div>
        <div>
          <dt>question id</dt>
          <dd>{question?.id ?? '—'}</dd>
        </div>
        <div>
          <dt>source band</dt>
          <dd>{diagnostic?.sourceBand ?? '—'}</dd>
        </div>
        <div>
          <dt>difficulty tier</dt>
          <dd>{diagnostic?.difficultyTier ?? '—'}</dd>
        </div>
        <div>
          <dt>content version</dt>
          <dd>{diagnostic?.contentVersion ?? '—'}</dd>
        </div>
      </dl>
    </aside>
  );
}
