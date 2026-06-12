import React from 'react';
import { Link } from 'react-router-dom';

export type FamilyMissingActionKind = 'add-child' | 'add-grade' | 'set-goals' | 'b4-check-in';

type FamilyMissingActionPromptProps = {
  kind: FamilyMissingActionKind;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
};

const COPY: Record<
  FamilyMissingActionKind,
  { title: string; body: string; cta: string }
> = {
  'add-child': {
    title: 'Add Your Child',
    body: 'Add a child profile so B-4 can personalize activities and track progress.',
    cta: 'Add Child',
  },
  'add-grade': {
    title: 'Configure Grade Level',
    body: 'We found your child profile. Select a grade so B-4 can recommend the right activities.',
    cta: 'Configure Grade Level',
  },
  'set-goals': {
    title: 'Set Family Goals',
    body: 'Choose focus areas so B-4 can personalize your child’s journey.',
    cta: 'Set Family Goals',
  },
  'b4-check-in': {
    title: 'Complete B-4 Check-In',
    body: 'Finish the baseline check-in so B-4 can tailor recommendations for your child.',
    cta: 'Start Check-In',
  },
};

export default function FamilyMissingActionPrompt({
  kind,
  onAction,
  actionHref,
  className = '',
}: FamilyMissingActionPromptProps) {
  const copy = COPY[kind];

  const actionClass = 'family-missingActionCta';

  return (
    <section className={`family-missingActionPrompt ${className}`.trim()} aria-labelledby={`family-missing-${kind}`}>
      <h3 id={`family-missing-${kind}`} className="family-missingActionTitle">
        {copy.title}
      </h3>
      <p className="family-missingActionBody">{copy.body}</p>
      {actionHref ? (
        <Link to={actionHref} className={actionClass}>
          {copy.cta}
        </Link>
      ) : (
        <button type="button" className={actionClass} onClick={onAction}>
          {copy.cta}
        </button>
      )}
    </section>
  );
}
