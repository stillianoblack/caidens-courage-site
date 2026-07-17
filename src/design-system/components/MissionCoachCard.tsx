import React from 'react';
import { Link } from 'react-router-dom';
import './mission-coach-card.css';

export type MissionCoachStepStatus = 'complete' | 'current' | 'incomplete' | 'locked';

export type MissionCoachStep = {
  id: string;
  label: string;
  description?: string;
  status: MissionCoachStepStatus;
  badgeNumber?: number;
  href?: string;
  onClick?: () => void;
};

export type MissionCoachVariant = 'family' | 'facilitator' | 'student' | 'default';

export type MissionCoachCardProps = {
  title: string;
  subtitle: string;
  avatarImage: string;
  avatarAlt?: string;
  progressLabel: string;
  progressPercent: number;
  steps: MissionCoachStep[];
  variant?: MissionCoachVariant;
  className?: string;
  compact?: boolean;
  avatarContent?: React.ReactNode;
};

function StepIndicator({
  step,
  index,
}: {
  step: MissionCoachStep;
  index: number;
}) {
  const badge = step.badgeNumber ?? index + 1;

  if (step.status === 'complete') {
    return (
      <span className="ds-missionCoach-stepIcon ds-missionCoach-stepIcon--complete" aria-hidden="true">
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M16.704 5.29a1 1 0 010 1.42l-7.25 7.25a1 1 0 01-1.42 0l-3.25-3.25a1 1 0 111.42-1.42l2.54 2.54 6.54-6.54a1 1 0 011.42 0z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    );
  }

  return (
    <span
      className={[
        'ds-missionCoach-stepIcon',
        step.status === 'current' ? 'ds-missionCoach-stepIcon--current' : '',
        step.status === 'locked' ? 'ds-missionCoach-stepIcon--locked' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden="true"
    >
      {badge}
    </span>
  );
}

function MissionCoachStepRow({ step, index }: { step: MissionCoachStep; index: number }) {
  const isInteractive = step.status !== 'locked' && (Boolean(step.href) || Boolean(step.onClick));
  const rowClass = [
    'ds-missionCoach-step',
    `ds-missionCoach-step--${step.status}`,
    isInteractive ? 'ds-missionCoach-step--interactive' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      <StepIndicator step={step} index={index} />
      <span className="ds-missionCoach-stepCopy">
        <span className="ds-missionCoach-stepLabel">{step.label}</span>
        {step.description ? (
          <span className="ds-missionCoach-stepDescription">{step.description}</span>
        ) : null}
      </span>
    </>
  );

  if (step.href && step.status !== 'locked') {
    return (
      <li>
        <Link to={step.href} className={rowClass} onClick={step.onClick}>
          {content}
        </Link>
      </li>
    );
  }

  if (step.onClick && step.status !== 'locked') {
    return (
      <li>
        <button type="button" className={rowClass} onClick={step.onClick}>
          {content}
        </button>
      </li>
    );
  }

  return (
    <li>
      <div className={rowClass}>{content}</div>
    </li>
  );
}

export default function MissionCoachCard({
  title,
  subtitle,
  avatarImage,
  avatarAlt = '',
  progressLabel,
  progressPercent,
  steps,
  variant = 'default',
  className = '',
  compact = false,
  avatarContent,
}: MissionCoachCardProps) {
  const clampedProgress = Math.max(0, Math.min(100, progressPercent));

  return (
    <section
      className={[
        'ds-missionCoach',
        `ds-missionCoach--${variant}`,
        compact ? 'ds-missionCoach--compact' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-labelledby="mission-coach-title"
    >
      <div className="ds-missionCoach-header">
        {avatarContent ?? (
          <img
            className="ds-missionCoach-avatar"
            src={avatarImage}
            alt={avatarAlt}
            decoding="async"
          />
        )}
        <div className="ds-missionCoach-intro">
          <h2 id="mission-coach-title" className="ds-missionCoach-title">
            {title}
          </h2>
          <p className="ds-missionCoach-subtitle">{subtitle}</p>
        </div>
      </div>

      <div className="ds-missionCoach-progress">
        <div className="ds-missionCoach-progressHead">
          <span className="ds-missionCoach-progressLabel">{progressLabel}</span>
          <span className="ds-missionCoach-progressValue">{Math.round(clampedProgress)}%</span>
        </div>
        <div
          className="ds-missionCoach-progressTrack"
          role="progressbar"
          aria-valuenow={Math.round(clampedProgress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={progressLabel}
        >
          <span
            className="ds-missionCoach-progressFill"
            style={{ width: `${clampedProgress}%` }}
          />
        </div>
      </div>

      <ol className="ds-missionCoach-steps">
        {steps.map((step, index) => (
          <MissionCoachStepRow key={step.id} step={step} index={index} />
        ))}
      </ol>
    </section>
  );
}
