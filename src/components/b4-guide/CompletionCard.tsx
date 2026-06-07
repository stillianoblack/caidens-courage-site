import React from 'react';
import { Link } from 'react-router-dom';
import { FOCUS_FLAME_LAB_PATH, PORTAL_PATH } from '../../config/courageRoutes';
import B4Dialogue from './B4Dialogue';

type CompletionCardProps = {
  title: string;
  b4Message: string;
  badge: string;
  onTryAgain: () => void;
};

export default function CompletionCard({ title, b4Message, badge, onTryAgain }: CompletionCardProps) {
  return (
    <div className="b4g-card">
      <h2 className="b4g-result-heading">{title}</h2>
      <B4Dialogue message={b4Message} />
      <div className="b4g-badge" role="status">
        <span aria-hidden="true">✦</span>
        Badge unlocked: {badge}
      </div>
      <div className="b4g-actions">
        <button type="button" className="b4g-primary-btn" onClick={onTryAgain}>
          Try Again
        </button>
        <Link to={FOCUS_FLAME_LAB_PATH} className="b4g-secondary-btn">
          Go to Focus Flame Lab
        </Link>
        <Link to={`${PORTAL_PATH}?audience=kids`} className="b4g-secondary-btn">
          Return to Kids Portal
        </Link>
      </div>
    </div>
  );
}
