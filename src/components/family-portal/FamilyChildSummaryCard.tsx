import React, { useId } from 'react';
import type { FamilyChildBaselineStatus } from '../../lib/familyChildrenMetrics';
import { resolveParticipantGradeDisplay } from '../../lib/participantGradeDisplay';
import B4CircleAvatar from '../b4/B4CircleAvatar';

export type FamilyChildSummaryCardOption = {
  participantId: string;
  displayName: string;
};

export type FamilyChildSummaryCardProps = {
  childName: string;
  programName: string;
  baselineStatus: FamilyChildBaselineStatus;
  b4CheckInStatus?: FamilyChildBaselineStatus;
  modulesCompleted: number;
  modulesTotal: number;
  lastActivityLabel: string;
  gradeLevel?: string | null;
  gradeBand?: string | null;
  avatarSrc?: string | null;
  b4Variant?: string | null;
  avatarInitials: string;
  childOptions?: FamilyChildSummaryCardOption[];
  activeParticipantId?: string | null;
  onSelectChild?: (participantId: string) => void;
  isActivePlayer?: boolean;
  onSetActivePlayer?: () => void;
  familyGoalsSet?: boolean;
  onViewProgress?: () => void;
  onOpenInsights?: () => void;
  onClaimReward?: () => void;
  claimRewardLoading?: boolean;
  loading?: boolean;
  previewEmpty?: boolean;
  className?: string;
};

function statusTone(status: FamilyChildBaselineStatus): 'complete' | 'progress' | 'pending' {
  if (status === 'Complete') return 'complete';
  if (status === 'In Progress') return 'progress';
  return 'pending';
}

export default function FamilyChildSummaryCard({
  childName,
  programName,
  baselineStatus,
  b4CheckInStatus,
  modulesCompleted,
  modulesTotal,
  lastActivityLabel,
  gradeLevel = null,
  gradeBand = null,
  avatarSrc = null,
  b4Variant = null,
  avatarInitials,
  childOptions = [],
  activeParticipantId = null,
  onSelectChild,
  isActivePlayer = true,
  onSetActivePlayer,
  familyGoalsSet,
  onViewProgress,
  onOpenInsights,
  onClaimReward,
  claimRewardLoading = false,
  loading = false,
  previewEmpty = false,
  className = '',
}: FamilyChildSummaryCardProps) {
  const selectId = useId();
  const hasMultipleChildren = childOptions.length > 1;
  const b4Status = b4CheckInStatus ?? 'Not Started';
  const progressPct = modulesTotal > 0 ? Math.round((modulesCompleted / modulesTotal) * 100) : 0;
  const showClaimReward = b4Status === 'Complete' && Boolean(onClaimReward);
  const gradeDisplay = resolveParticipantGradeDisplay({ gradeLevel, gradeBand }).displayGrade;

  if (previewEmpty) {
    return (
      <section
        className={`family-childSummaryCard family-childSummaryCard--empty${className ? ` ${className}` : ''}`}
        aria-label="Child summary preview"
      >
        <div className="family-childSummaryEmptyCopy">
          <p className="family-childSummaryEmptyTitle">No child connected yet</p>
          <p className="family-childSummaryEmptyMeta">
            After you link your child, their name, program, baseline status, and module progress
            appear here.
          </p>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section
        className={`family-childSummaryCard family-childSummaryCard--loading${className ? ` ${className}` : ''}`}
        aria-busy="true"
        aria-label="Loading child summary"
      >
        <div className="family-childSummarySkeletonAvatar" />
        <div className="family-childSummarySkeletonBody">
          <div className="family-skeletonBar family-childSummarySkeletonLine" />
          <div className="family-skeletonBar family-childSummarySkeletonLine family-childSummarySkeletonLine--short" />
          <div className="family-skeletonBar family-childSummarySkeletonLine family-childSummarySkeletonLine--meta" />
        </div>
      </section>
    );
  }

  return (
    <section
      className={`family-childSummaryCard family-childSummaryCard--celebration${
        onOpenInsights ? ' family-childSummaryCard--clickable' : ''
      }${className ? ` ${className}` : ''}`}
      aria-label={`${childName} progress summary`}
      onClick={onOpenInsights}
      onKeyDown={
        onOpenInsights
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onOpenInsights();
              }
            }
          : undefined
      }
      role={onOpenInsights ? 'button' : undefined}
      tabIndex={onOpenInsights ? 0 : undefined}
    >
      <div className="family-childSummaryGlow" aria-hidden="true" />
      <div className="family-childSummaryTop">
        <div className={`family-childSummaryAvatarWrap${b4Variant ? ' family-childSummaryAvatarWrap--b4' : ''}`}>
          {b4Variant ? (
            <B4CircleAvatar
              variant={b4Variant}
              size="medium"
              alt={`${childName}'s selected B-4`}
            />
          ) : avatarSrc ? (
            <img
              src={avatarSrc}
              alt={`${childName}'s profile`}
              className="family-childSummaryAvatarImg"
              decoding="async"
              loading="lazy"
            />
          ) : (
            <span className="family-childSummaryAvatarInitials">{avatarInitials}</span>
          )}
        </div>

        <div className="family-childSummaryIdentity">
          {isActivePlayer ? (
            <span className="family-childSummaryActivePill">Active Player</span>
          ) : onSetActivePlayer ? (
            <button
              type="button"
              className="family-childSummarySetActiveBtn"
              onClick={(event) => {
                event.stopPropagation();
                onSetActivePlayer();
              }}
            >
              Set as active player
            </button>
          ) : null}
          {hasMultipleChildren && onSelectChild && isActivePlayer ? (
            <div className="family-childSummaryNameRow">
              <label className="sr-only" htmlFor={selectId}>
                Select child
              </label>
              <select
                id={selectId}
                className="family-childSummaryNameSelect"
                value={activeParticipantId ?? childOptions[0]?.participantId ?? ''}
                onChange={(event) => {
                  event.stopPropagation();
                  onSelectChild(event.target.value);
                }}
                onClick={(event) => event.stopPropagation()}
              >
                {childOptions.map((option) => (
                  <option key={option.participantId} value={option.participantId}>
                    {option.displayName}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <h2 className="family-childSummaryName">{childName}</h2>
          )}
          <p className="family-childSummaryProgram">{programName}</p>
        </div>
      </div>

      <div className="family-childSummaryPills">
        <span className="family-childSummaryPill">
          Grade: {gradeDisplay}
        </span>
        <span className={`family-childSummaryPill family-childSummaryPill--${statusTone(baselineStatus)}`}>
          Baseline: {baselineStatus}
        </span>
        <span className={`family-childSummaryPill family-childSummaryPill--${statusTone(b4Status)}`}>
          B-4 Check-In: {b4Status}
        </span>
        {typeof familyGoalsSet === 'boolean' ? (
          <span
            className={`family-childSummaryPill family-childSummaryGoalsPill--${
              familyGoalsSet ? 'complete' : 'pending'
            }`}
          >
            Family Goals: {familyGoalsSet ? 'Set' : 'Needed'}
          </span>
        ) : null}
        <span className="family-childSummaryPill">
          Adventures: {modulesCompleted}
        </span>
        <span className="family-childSummaryPill">
          Progress: {progressPct}%
        </span>
        <span className="family-childSummaryPill">
          Last Activity: {lastActivityLabel}
        </span>
      </div>

      <div className="family-childSummaryProgressBlock">
        <div className="family-childSummaryProgressHead">
          <span>Mission Progress</span>
          <strong>
            {modulesCompleted} / {modulesTotal}
          </strong>
        </div>
        <div className="family-childSummaryProgressTrack" aria-hidden="true">
          <span
            className="family-childSummaryProgressFill"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="family-childSummaryActions">
        {showClaimReward ? (
          <button
            type="button"
            className="family-nextCta family-childSummaryCta family-childSummaryCta--reward"
            disabled={claimRewardLoading}
            onClick={(event) => {
              event.stopPropagation();
              onClaimReward?.();
            }}
          >
            {claimRewardLoading ? 'Claiming…' : 'Claim Your Reward'}
          </button>
        ) : null}
        <button
          type="button"
          className="family-nextCta family-childSummaryCta"
          onClick={(event) => {
            event.stopPropagation();
            onViewProgress?.();
          }}
        >
          View Progress
        </button>
      </div>
    </section>
  );
}
