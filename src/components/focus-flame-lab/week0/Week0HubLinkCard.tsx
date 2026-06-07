import React from 'react';
import { Link } from 'react-router-dom';
import { WEEK_0_ASSESSMENT_PATH } from '../../../config/courageRoutes';

const WEEK0_CARD_IMAGE = '/images/focus-flame-lab/thepath.webp';

type Week0HubLinkCardProps = {
  complete?: boolean;
  onHover?: () => void;
  onSelect?: () => void;
};

/** Focus Flame Lab scene-select entry card for Week 0 baseline check. */
export default function Week0HubLinkCard({ complete = false, onHover, onSelect }: Week0HubLinkCardProps) {
  return (
    <Link
      to={WEEK_0_ASSESSMENT_PATH}
      className="ffl-week0-hubLink"
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse') onHover?.();
      }}
      onClick={() => onSelect?.()}
      aria-label={`Week 0: Focus Check. Before the adventure begins. ${complete ? 'Completed.' : 'Start Check-In.'}`}
    >
      <span className={`ffl-sceneRow ffl-sceneRow--featured${complete ? ' ffl-sceneRow--completed' : ''}`}>
        <span className="ffl-sceneRowMedia">
          <img
            className="ffl-sceneRowImg ffl-sceneRowImg--move"
            src={WEEK0_CARD_IMAGE}
            alt=""
            loading="lazy"
            decoding="async"
          />
          <span className="ffl-sceneRowLevel" aria-hidden="true">
            Week 0
          </span>
          {complete ? (
            <span className="ffl-sceneRowCompletedMark" aria-hidden="true">
              ✓
            </span>
          ) : null}
        </span>
        <span className="ffl-sceneRowText">
          <span className="ffl-sceneRowTitle">Week 0: Focus Check</span>
          <span className="ffl-sceneRowBlurb">Before the adventure begins</span>
          <span className="ffl-sceneRowStatus" data-status={complete ? 'Completed' : 'Available'}>
            {complete ? 'Completed' : 'Available'}
          </span>
        </span>
        <span className="ffl-sceneRowBegin ffl-sceneRowBegin--pill" aria-hidden="true">
          {complete ? 'Review' : 'Start Check-In'}
        </span>
      </span>
    </Link>
  );
}
