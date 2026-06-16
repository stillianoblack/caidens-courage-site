import React from 'react';
import { B4_AVATAR_SRC } from '../../../data/b4/avatar';
import type { FacilitatorProgramCoachModel } from '../../../lib/facilitatorProgramCoachModel';
import CoachActionLink from './CoachActionLink';
import CoachChecklistItem from './CoachChecklistItem';
import CoachInsightCard from './CoachInsightCard';
import CoachProgressBar from './CoachProgressBar';
import CoachReadinessItem from './CoachReadinessItem';
import './facilitator-program-coach.css';

export type FacilitatorProgramCoachPanelProps = {
  model?: FacilitatorProgramCoachModel;
  loading?: boolean;
  className?: string;
};

export default function FacilitatorProgramCoachPanel({
  model,
  loading = false,
  className = '',
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
        <img
          className="pilot-programCoachAvatar"
          src={B4_AVATAR_SRC}
          alt=""
          decoding="async"
        />
        <div className="pilot-programCoachIntro">
          <h2 id="pilot-program-coach-title" className="pilot-programCoachTitle">
            B-4 Program Coach
          </h2>
          <p className="pilot-programCoachGreeting">Hi, I&apos;m B-4</p>
          <p className="pilot-programCoachSubtitle">Your Focus Flame Journey is active.</p>
        </div>
      </header>

      <CoachProgressBar label="Focus Flame Journey" percent={model.progressPercent} />

      <section className="pilot-programCoachSection" aria-labelledby="pilot-coach-readiness-heading">
        <h3 id="pilot-coach-readiness-heading" className="pilot-programCoachSectionTitle">
          Camp Readiness Summary
        </h3>
        <ul className="pilot-coachReadinessList">
          {model.campReadiness.items.map((item) => (
            <CoachReadinessItem key={item.id} {...item} />
          ))}
        </ul>
      </section>

      <section className="pilot-programCoachSection" aria-labelledby="pilot-coach-checklist-heading">
        <h3 id="pilot-coach-checklist-heading" className="pilot-programCoachSectionTitle">
          Setup Checklist
        </h3>
        <ul className="pilot-coachChecklist">
          {model.checklist.map((item) => (
            <CoachChecklistItem
              key={item.id}
              label={item.label}
              description={item.description}
              status={item.status}
              warningText={item.warningText}
              href={item.href}
              onClick={item.onClick}
            />
          ))}
        </ul>
      </section>

      <section className="pilot-programCoachSection" aria-labelledby="pilot-coach-insights-heading">
        <h3 id="pilot-coach-insights-heading" className="pilot-programCoachSectionTitle">
          Needs Attention
        </h3>
        {model.showSuccessState ? (
          <div className="pilot-coachInsight pilot-coachInsight--success">
            <p className="pilot-coachInsightMessage">
              Everything looks good. Your program is ready for the next activity.
            </p>
          </div>
        ) : (
          <div className="pilot-coachInsightList">
            {model.insights.map((insight) => (
              <CoachInsightCard
                key={insight.id}
                title={insight.title}
                message={insight.message}
                tone={insight.tone}
                href={insight.href}
              />
            ))}
          </div>
        )}
      </section>

      <section className="pilot-programCoachSection" aria-labelledby="pilot-coach-actions-heading">
        <h3 id="pilot-coach-actions-heading" className="pilot-programCoachSectionTitle">
          Quick Actions
        </h3>
        <div className="pilot-coachActions">
          {model.quickActions.map((action) => (
            <CoachActionLink
              key={action.id}
              label={action.label}
              href={action.href}
              onClick={action.onClick}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
