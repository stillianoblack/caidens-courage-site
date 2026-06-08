import React from 'react';
import CharacterAvatar from '../game-assessment/shared/CharacterAvatar';
import type { GameFeedbackDetail } from '../../types/gameAssessment';
import type { MissionGameTheme } from './MissionSpeechRow';

type MissionFeedbackCardProps = {
  theme: MissionGameTheme;
  avatarSrc: string;
  avatarAlt?: string;
  speakerLabel: string;
  message: string;
  tone: 'success' | 'try' | 'neutral';
  detail?: GameFeedbackDetail;
};

export default function MissionFeedbackCard({
  theme,
  avatarSrc,
  avatarAlt = '',
  speakerLabel,
  message,
  tone,
  detail,
}: MissionFeedbackCardProps) {
  return (
    <div
      className={`mission-feedbackCard mission-feedbackCard--${theme} mission-feedbackCard--${tone}`}
      role="status"
    >
      <CharacterAvatar
        src={avatarSrc}
        alt={avatarAlt}
        size="small"
        theme={theme}
        className="mission-feedbackAvatar"
      />
      <div className="mission-feedbackBody">
        <p className="mission-feedbackLabel">{speakerLabel}</p>
        <p className="mission-feedbackText">{message}</p>

        {detail ? (
          <div className="mission-feedbackDetail">
            {detail.whyItMatters ? (
              <div className="mission-feedbackSection">
                <p className="mission-feedbackSectionTitle">Why it matters:</p>
                <p className="mission-feedbackSectionText">{detail.whyItMatters}</p>
              </div>
            ) : null}
            {detail.tryThis?.length ? (
              <div className="mission-feedbackSection">
                <p className="mission-feedbackSectionTitle">{detail.tryThisLabel ?? 'Try this:'}</p>
                <ul className="mission-feedbackTips">
                  {detail.tryThis.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {detail.watchFor ? (
              <div className="mission-feedbackSection">
                <p className="mission-feedbackSectionTitle">Watch for:</p>
                <p className="mission-feedbackSectionText">{detail.watchFor}</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
