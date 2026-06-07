import React from 'react';

import { B4_AVATAR_SRC } from '../../data/b4/avatar';

type B4DialogueProps = {
  message: string;
  label?: string;
};

export default function B4Dialogue({ message, label = 'B-4 says' }: B4DialogueProps) {
  return (
    <div className="b4g-dialogue" role="group" aria-label="B-4 guide message">
      <div className="b4g-dialogue-avatar" aria-hidden="true">
        <img src={B4_AVATAR_SRC} alt="" decoding="async" />
      </div>
      <div className="b4g-dialogue-body">
        <p className="b4g-dialogue-label">{label}</p>
        <p className="b4g-dialogue-bubble">{message}</p>
      </div>
    </div>
  );
}
