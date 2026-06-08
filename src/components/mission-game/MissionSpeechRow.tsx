import React from 'react';
import CharacterAvatar from '../game-assessment/shared/CharacterAvatar';

export type MissionGameTheme = 'caiden' | 'miranda' | 'victoria' | 'uncle-t' | 'charlie' | 'b4' | 'default';

type MissionSpeechRowProps = {
  avatarSrc: string;
  avatarAlt?: string;
  theme?: MissionGameTheme;
  children: React.ReactNode;
};

export default function MissionSpeechRow({
  avatarSrc,
  avatarAlt = '',
  theme = 'default',
  children,
}: MissionSpeechRowProps) {
  return (
    <div className={`mission-speechRow mission-speechRow--${theme}`}>
      <CharacterAvatar
        src={avatarSrc}
        alt={avatarAlt}
        size="medium"
        theme={theme}
        className="mission-speechAvatar"
      />
      <div className="mission-speechCard">
        <div className="mission-speechCaret" aria-hidden="true" />
        <div className="mission-speechContent">{children}</div>
      </div>
    </div>
  );
}
