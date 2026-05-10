import React from 'react';

export default function CompactB4HudCard({ message }: { message: string }) {
  const publicUrl = process.env.PUBLIC_URL || '';
  const b4Img = `${publicUrl}/images/characters/B4_Guide_LowerThird.webp`;

  return (
    <div className="ffl-hud-card ffl-hud-card--b4 ffl-b4-card">
      <div className="ffl-b4-avatar-wrap">
        <div className="ffl-b4-avatar-ring" aria-hidden="true">
          <img className="ffl-b4-avatar" src={b4Img} alt="" loading="lazy" decoding="async" />
        </div>
        <div className="ffl-b4-avatar-label">B-4 GUIDE</div>
      </div>
      <p className="ffl-b4-bubble">{message}</p>
    </div>
  );
}
