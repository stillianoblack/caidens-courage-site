import React from 'react';
import type { GameFeedbackDetail } from '../../types/gameAssessment';
import MissionFeedbackCard from '../mission-game/MissionFeedbackCard';

type VictoriaFeedbackCardProps = {
  avatarSrc: string;
  avatarAlt?: string;
  message: string;
  tone: 'success' | 'try' | 'neutral';
  detail?: GameFeedbackDetail;
};

/** @deprecated Prefer MissionFeedbackCard with theme="victoria" */
export default function VictoriaFeedbackCard({
  avatarSrc,
  avatarAlt = 'Dr. Victoria',
  message,
  tone,
  detail,
}: VictoriaFeedbackCardProps) {
  return (
    <MissionFeedbackCard
      theme="victoria"
      avatarSrc={avatarSrc}
      avatarAlt={avatarAlt}
      speakerLabel="Dr. Victoria says"
      message={message}
      tone={tone}
      detail={detail}
    />
  );
}
