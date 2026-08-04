import React, { useState } from 'react';
import { useB4Blink } from '../../hooks/useB4Blink';
import type { B4FloatProfile } from './B4AnimatedHead';
import './b4-animated-image.css';

type Props = {
  assetType: 'head' | 'full-body';
  idleSrc: string;
  blinkSrc?: string;
  alt?: string;
  className?: string;
  floatProfile?: B4FloatProfile;
};

/** Presentation-neutral B-4 motion. The host class owns every display dimension. */
export default function B4AnimatedImage({
  assetType,
  idleSrc,
  blinkSrc,
  alt = '',
  className = '',
  floatProfile,
}: Props) {
  const [idleLoaded, setIdleLoaded] = useState(false);
  const [blinkLoaded, setBlinkLoaded] = useState(!blinkSrc);
  const canBlink = Boolean(blinkSrc && idleLoaded && blinkLoaded);
  const { rootRef, blinkPhase, reduceMotion } = useB4Blink<HTMLSpanElement>(canBlink);
  const style = floatProfile ? ({
    '--b4-image-float-travel': `${floatProfile.travelPx}px`,
    '--b4-image-float-duration': `${floatProfile.durationSeconds}s`,
    '--b4-image-float-delay': `${floatProfile.delaySeconds}s`,
  } as React.CSSProperties) : undefined;

  return (
    <span
      ref={rootRef}
      className={`b4-animatedImage ${className}`.trim()}
      data-asset-type={assetType}
      data-blink-phase={blinkPhase}
      data-floating={floatProfile ? 'true' : 'false'}
      data-reduce-motion={reduceMotion ? 'true' : 'false'}
      style={style}
    >
      <span className="b4-animatedImageShadow" aria-hidden="true" />
      <span className="b4-animatedImageFloat">
        <span className="b4-animatedImageStage">
          <img
            className="b4-animatedImageFrame b4-animatedImageFrame--idle"
            src={idleSrc}
            alt={alt}
            onLoad={() => setIdleLoaded(true)}
          />
          {blinkSrc ? (
            <img
              className="b4-animatedImageFrame b4-animatedImageFrame--blink"
              src={blinkSrc}
              alt=""
              aria-hidden="true"
              onLoad={() => setBlinkLoaded(true)}
            />
          ) : null}
        </span>
      </span>
    </span>
  );
}
