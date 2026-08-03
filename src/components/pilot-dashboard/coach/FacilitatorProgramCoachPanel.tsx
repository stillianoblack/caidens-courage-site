import React from 'react';
import type { FacilitatorProgramCoachModel } from '../../../lib/facilitatorProgramCoachModel';
import CoachActionLink from './CoachActionLink';
import CoachProgressBar from './CoachProgressBar';
import './facilitator-program-coach.css';
import { FACILITATOR_GAME_HUDDLE_PATH } from '../../../config/courageRoutes';
import B4AnimatedHead from '../../b4/B4AnimatedHead';

export type FacilitatorProgramCoachPanelProps = {
  model?: FacilitatorProgramCoachModel;
  loading?: boolean;
  className?: string;
  warning?: string | null;
};

export default function FacilitatorProgramCoachPanel({
  model,
  loading = false,
  className = '',
  warning = null,
}: FacilitatorProgramCoachPanelProps) {
  if (loading || !model) {
    return (
      <div
        className={['pilot-programCoach', 'pilot-programCoach--loading', className].filter(Boolean).join(' ')}
        aria-busy="true"
        aria-label="B-4 Program Coach"
      >
        <div className="pilot-programCoachSkeleton" />
        <div className="pilot-programCoachSkeleton pilot-programCoachSkeleton--short" />
        <div className="pilot-programCoachSkeleton pilot-programCoachSkeleton--bar" />
      </div>
    );
  }

  return (
    <div
      className={['pilot-programCoach', className].filter(Boolean).join(' ')}
      aria-labelledby="pilot-program-coach-title"
    >
      <header className="pilot-programCoachHeader">
        <B4AnimatedHead
          className="pilot-programCoachAvatar pilot-programCoachAvatar--guide"
          variant="orange"
          alt="B-4"
        />
        <div className="pilot-programCoachIntro">
          <h2 id="pilot-program-coach-title" className="pilot-programCoachTitle">
            B-4 Guide
          </h2>
          <p className="pilot-programCoachGreeting">Welcome back.</p>
          <p className="pilot-programCoachSubtitle">Your campers are making great progress.</p>
        </div>
      </header>

      {warning ? <p className="pilot-programCoachWarning" role="status">{warning}</p> : null}

      <CoachProgressBar label="Focus Flame Journey" percent={model.progressPercent} />

      <section className="pilot-programCoachSection" aria-labelledby="pilot-coach-readiness-heading">
        <h3 id="pilot-coach-readiness-heading" className="pilot-programCoachSectionTitle">
          Today&apos;s Journey
        </h3>
        <ul className="pilot-guideJourneyList">
          <li><span className="pilot-guideJourneyMark pilot-guideJourneyMark--complete">✓</span><span><strong>{model.counts.studentCount - model.counts.missingBaselineCount}</strong> explorers discovered their Focus Flame</span></li>
          <li><span className="pilot-guideJourneyMark pilot-guideJourneyMark--parent">✓</span><span><strong>{Math.max(0, model.counts.studentCount - model.counts.parentNotConnectedCount)}</strong> parent connections are active</span></li>
          <li><span className="pilot-guideJourneyMark pilot-guideJourneyMark--award">★</span><span><strong>{model.counts.certificateReady}</strong> certificates waiting</span></li>
          {model.counts.missingBaselineCount > 0 ? <li><span className="pilot-guideJourneyMark pilot-guideJourneyMark--warning">!</span><span><strong>{model.counts.missingBaselineCount}</strong> explorers haven&apos;t discovered their Focus Flame</span></li> : null}
          {model.counts.missingWeek1Count > 0 ? <li><span className="pilot-guideJourneyMark pilot-guideJourneyMark--learning">▤</span><span>Week 1 is waiting for <strong>{model.counts.missingWeek1Count}</strong> explorers</span></li> : null}
        </ul>
      </section>

      <section className="pilot-programCoachSection" aria-labelledby="pilot-coach-actions-heading">
        <h3 id="pilot-coach-actions-heading" className="pilot-programCoachSectionTitle">
          Choose the next step
        </h3>
        <div className="pilot-coachActions">
          {model.quickActions.filter((action) => ['week-1-modules', 'roster'].includes(action.id)).map((action) => (
            <CoachActionLink
              key={action.id}
              label={action.id === 'week-1-modules' ? 'Launch Game Huddle' : 'View Full Program'}
              href={action.id === 'week-1-modules' ? FACILITATOR_GAME_HUDDLE_PATH : action.href}
              onClick={action.id === 'week-1-modules' ? undefined : action.onClick}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
