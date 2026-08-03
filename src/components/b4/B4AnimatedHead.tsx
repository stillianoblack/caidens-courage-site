import React from 'react';
import { useB4Blink } from '../../hooks/useB4Blink';
import './b4-animated-head.css';

export type B4ColorVariant = 'blue' | 'orange' | 'green' | 'pink' | 'purple';

const OPEN_HEADS: Record<B4ColorVariant, string> = {
  blue: '/assets/b4/courage/idle/b4-courage-idle.png',
  orange: '/assets/b4/anchor/idle/b4-anchor-idle.png',
  green: '/assets/b4/fusion/idle/b4-fusion-idle.png',
  pink: '/assets/b4/shield/idle/b4-shield-idle.png',
  purple: '/assets/b4/pattern/idle/b4-pattern-idle.png',
};

const CLOSED_HEADS: Record<B4ColorVariant, string> = {
  blue: '/assets/b4/courage/blinking/b4-courage-blinking.png',
  orange: '/assets/b4/anchor/blinking/b4-anchor-blinking.png',
  green: '/assets/b4/fusion/blinking/b4-fusion-blinking.png',
  pink: '/assets/b4/shield/blinking/b4-shield-blinking.png',
  purple: '/assets/b4/pattern/blinking/b4-pattern-blinking.png',
};

export type B4AnimatedHeadProps = {
  variant?: B4ColorVariant;
  className?: string;
  alt?: string;
  decorative?: boolean;
  animate?: boolean;
  openSrc?: string;
  closedSrc?: string;
  floatProfile?: B4FloatProfile;
};

export type B4FloatProfile = {
  travelPx: number;
  durationSeconds: number;
  delaySeconds: number;
};

export default function B4AnimatedHead({
  variant = 'blue',
  className = '',
  alt = 'B-4 guide',
  decorative = false,
  animate = true,
  openSrc,
  closedSrc,
  floatProfile,
}: B4AnimatedHeadProps) {
  const { rootRef, blinkPhase, reduceMotion } = useB4Blink<HTMLSpanElement>(animate);

  const resolvedAlt = decorative ? '' : alt;
  const floatStyle = floatProfile ? ({
    '--b4-float-travel': `${floatProfile.travelPx}px`,
    '--b4-float-duration': `${floatProfile.durationSeconds}s`,
    '--b4-float-delay': `${floatProfile.delaySeconds}s`,
  } as React.CSSProperties) : undefined;
  return (
    <span
      ref={rootRef}
      className={`b4-animatedHead b4-animatedHead--${variant} ${className}`.trim()}
      data-blink-phase={blinkPhase}
      data-floating={floatProfile ? 'true' : 'false'}
      data-reduce-motion={reduceMotion ? 'true' : 'false'}
      style={floatStyle}
    >
      {floatProfile ? <span className="b4-animatedHeadShadow" aria-hidden="true" /> : null}
      <span className="b4-animatedHeadFloat">
        <span className="b4-animatedHeadStage">
          <img className="b4-animatedHeadFrame b4-animatedHeadFrame--open" src={openSrc ?? OPEN_HEADS[variant]} alt={resolvedAlt} />
          <img className="b4-animatedHeadFrame b4-animatedHeadFrame--closed b4-animatedHeadFrame--closedLeft" src={closedSrc ?? CLOSED_HEADS[variant]} alt="" aria-hidden="true" />
          <img className="b4-animatedHeadFrame b4-animatedHeadFrame--closed b4-animatedHeadFrame--closedRight" src={closedSrc ?? CLOSED_HEADS[variant]} alt="" aria-hidden="true" />
        </span>
      </span>
    </span>
  );
}
