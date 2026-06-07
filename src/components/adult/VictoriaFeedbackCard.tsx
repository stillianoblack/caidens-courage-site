import React from 'react';

type VictoriaFeedbackCardProps = {
  avatarSrc: string;
  avatarAlt?: string;
  message: string;
  tone: 'success' | 'try' | 'neutral';
};

export default function VictoriaFeedbackCard({
  avatarSrc,
  avatarAlt = 'Dr. Victoria',
  message,
  tone,
}: VictoriaFeedbackCardProps) {
  return (
    <div className={`victoria-feedbackCard victoria-feedbackCard--${tone}`} role="status">
      <img src={avatarSrc} alt="" className="victoria-feedbackAvatar" decoding="async" />
      <div>
        <p className="victoria-feedbackLabel">Dr. Victoria says</p>
        <p className="victoria-feedbackText">{message}</p>
      </div>
    </div>
  );
}
