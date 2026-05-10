import React from 'react';

export type B4GuideBubbleVariant = 'entry' | 'help';

const BUBBLE_COPY: Record<B4GuideBubbleVariant, string> = {
  entry: 'I’m B-4. I’ll guide you.',
  help: 'Need help?',
};

/**
 * In-world B-4 guide (ring + optional bubble). `layout="float"` is absolute to the HUD;
 * `layout="rail"` is in-flow for the scene-select sidebar. Distinct from site “Talk to B-4” chat.
 */
export default function B4GuideWidget({
  bubbleVariant,
  showBubble = true,
  layout = 'float',
}: {
  bubbleVariant: B4GuideBubbleVariant;
  showBubble?: boolean;
  layout?: 'float' | 'rail';
}) {
  const text = BUBBLE_COPY[bubbleVariant];

  return (
    <div
      className={`b4-guide-widget${layout === 'rail' ? ' b4-guide-widget--rail' : ''}`}
      role="region"
      aria-label="B-4 guide"
    >
      <div className="b4-guide-widget-inner">
        <div className="b4-guide-widget-ring">
          <img
            className="b4-guide-widget-img"
            src="/images/characters/B4_Guide_LowerThird.webp"
            alt=""
            loading="lazy"
            decoding="async"
          />
        </div>
        {showBubble ? <p className="b4-guide-widget-bubble">{text}</p> : null}
      </div>
    </div>
  );
}
