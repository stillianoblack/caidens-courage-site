import React from 'react';

export default function B4GuidePanel({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <aside className={['ffl-b4Panel', className].filter(Boolean).join(' ')} aria-label="B-4 guide">
      <div className="ffl-b4PanelAvatarWrap">
        <div className="ffl-b4PanelRing" aria-hidden="true">
          <img
            className="ffl-b4PanelImg"
            src={`${process.env.PUBLIC_URL || ''}/images/characters/B4_Guide_LowerThird.webp`}
            alt=""
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
      <div className="ffl-b4PanelLabel">B-4 GUIDE</div>
      <p className="ffl-b4PanelBubble">{message}</p>
    </aside>
  );
}

