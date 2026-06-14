import React from 'react';
import { B4_BASELINE_FAMILY_LANDING } from '../../data/b4BaselineCheckContent';
import { formatB4CheckInStatusLabel } from '../../config/assessmentTypeConstants';
import type { B4CheckInDisplayStatus } from '../../lib/b4CheckInStatus';
import { B4Avatar } from '../b4-baseline-check/B4BaselineTopBar';

type FamilyChildOption = {
  participantId: string;
  displayName: string;
};

type B4BaselineFamilyEntryProps = {
  childName?: string;
  checkInStatus: B4CheckInDisplayStatus;
  roster: FamilyChildOption[];
  activeParticipantId?: string;
  needsChildSelection: boolean;
  noChildren: boolean;
  childrenSettingsPath: string;
  continueLearningPath?: string;
  onSelectChild: (participantId: string) => void;
  onStartCheckIn: () => void;
  starting?: boolean;
};

export default function B4BaselineFamilyEntry({
  childName,
  checkInStatus,
  roster,
  activeParticipantId = '',
  needsChildSelection,
  noChildren,
  childrenSettingsPath,
  continueLearningPath,
  onSelectChild,
  onStartCheckIn,
  starting = false,
}: B4BaselineFamilyEntryProps) {
  if (noChildren) {
    return (
      <div className="bbc-landing bbc-landing--familyEntry">
        <p className="bbc-eyebrow">{B4_BASELINE_FAMILY_LANDING.eyebrow}</p>
        <h1 className="bbc-title">{B4_BASELINE_FAMILY_LANDING.title}</h1>
        <B4Avatar size="hero" />
        <p className="bbc-body">Add a child to begin their B-4 Check-In and unlock weekly adventures.</p>
        <a href={childrenSettingsPath} className="bbc-primaryBtn bbc-landingCta">
          Add Child in Settings
        </a>
      </div>
    );
  }

  if (needsChildSelection) {
    return (
      <div className="bbc-landing bbc-landing--familyEntry">
        <p className="bbc-eyebrow">{B4_BASELINE_FAMILY_LANDING.eyebrow}</p>
        <h1 className="bbc-title">Who is checking in?</h1>
        <p className="bbc-subtitle">Pick the child doing this B-4 Check-In so progress stays on the right profile.</p>
        <div className="bbc-familyChildPicker">
          {roster.map((child) => {
            const active = child.participantId === activeParticipantId;
            return (
              <button
                key={child.participantId}
                type="button"
                className={`bbc-familyChildBtn${active ? ' bbc-familyChildBtn--active' : ''}`}
                aria-pressed={active}
                onClick={() => onSelectChild(child.participantId)}
              >
                {child.displayName}
              </button>
            );
          })}
        </div>
        <a href={childrenSettingsPath} className="bbc-secondaryBtn">
          Add Child
        </a>
      </div>
    );
  }

  if (checkInStatus === 'Complete') {
    return (
      <div className="bbc-landing bbc-landing--familyEntry">
        <p className="bbc-eyebrow">{B4_BASELINE_FAMILY_LANDING.eyebrow}</p>
        <h1 className="bbc-title">B-4 Check-In Complete</h1>
        <B4Avatar size="hero" />
        <p className="bbc-body">
          {childName ? `${childName}'s` : 'Your'} B-4 Check-In is complete. You can continue weekly adventures or
          do a daily B-4 sprint anytime.
        </p>
        <p className="bbc-familyStatusPill" role="status">
          {formatB4CheckInStatusLabel('Complete')}
        </p>
        <div className="bbc-hubActions">
          {continueLearningPath ? (
            <a href={continueLearningPath} className="bbc-primaryBtn bbc-landingCta">
              Continue Weekly Adventures
            </a>
          ) : null}
          <button type="button" className="bbc-secondaryBtn" onClick={onStartCheckIn}>
            Review Check-In Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bbc-landing bbc-landing--familyEntry">
      <p className="bbc-eyebrow">{B4_BASELINE_FAMILY_LANDING.eyebrow}</p>
      <h1 className="bbc-title">
        {childName ? `B-4 Check-In for ${childName}` : B4_BASELINE_FAMILY_LANDING.title}
      </h1>
      <p className="bbc-subtitle">{B4_BASELINE_FAMILY_LANDING.subtitle}</p>
      <B4Avatar size="hero" />
      <p className="bbc-body">{B4_BASELINE_FAMILY_LANDING.body}</p>
      <p className="bbc-familyStatusPill" role="status">
        {formatB4CheckInStatusLabel(checkInStatus)}
      </p>
      <button
        type="button"
        className="bbc-primaryBtn bbc-landingCta"
        disabled={starting}
        onClick={onStartCheckIn}
      >
        {starting ? 'Starting…' : 'Start Check-In'}
      </button>
    </div>
  );
}
