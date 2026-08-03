import React from 'react';
import { useB4Blink } from '../../hooks/useB4Blink';
import './b4-animated-head.css';

export type B4ColorVariant = 'blue' | 'orange' | 'green' | 'pink' | 'purple';

const OPEN_HEADS: Record<B4ColorVariant, string> = {
  blue: '/images/Choose-Your-Guide/B-4student.webp',
  orange: '/images/Choose-Your-Guide/B-4orange.webp',
  green: '/images/Choose-Your-Guide/b-4facilitator.webp',
  pink: '/images/Choose-Your-Guide/B-4student.webp',
  purple: '/images/Choose-Your-Guide/B-4student.webp',
};

const CLOSED_HEAD = '/images/B-4FlightGame/Blinking/Blinking@2x.png';

type B4AnimatedHeadProps = {
  variant?: B4ColorVariant;
  size?: number | string;
  className?: string;
  alt?: string;
  decorative?: boolean;
  animate?: boolean;
  openSrc?: string;
  closedSrc?: string;
};

export default function B4AnimatedHead({
  variant = 'blue',
  size = '100%',
  className = '',
  alt = 'B-4 guide',
  decorative = false,
  animate = true,
  openSrc,
  closedSrc = CLOSED_HEAD,
}: B4AnimatedHeadProps) {
  const { rootRef, isBlinking } = useB4Blink<HTMLSpanElement>(animate);

  const resolvedAlt = decorative ? '' : alt;
  const style = { '--b4-head-size': typeof size === 'number' ? `${size}px` : size } as React.CSSProperties;

  return (
    <span
      ref={rootRef}
      className={`b4-animatedHead b4-animatedHead--${variant} ${className}`.trim()}
      style={style}
      data-blinking={isBlinking ? 'true' : 'false'}
    >
      <img className="b4-animatedHeadFrame b4-animatedHeadFrame--open" src={openSrc ?? OPEN_HEADS[variant]} alt={resolvedAlt} />
      <img className="b4-animatedHeadFrame b4-animatedHeadFrame--closed" src={closedSrc} alt="" aria-hidden="true" />
    </span>
  );
}
