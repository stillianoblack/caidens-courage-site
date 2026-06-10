import React, { useId } from 'react';
import type { FamilyChildBaselineStatus } from '../../lib/familyChildrenMetrics';

export type FamilyChildSummaryCardOption = {
  participantId: string;
  displayName: string;
};

export type FamilyChildSummaryCardProps = {
  childName: string;
  programName: string;
  baselineStatus: FamilyChildBaselineStatus;
  modulesCompleted: number;
  modulesTotal: number;
  lastActivityLabel: string;
  avatarSrc?: string | null;
  avatarInitials: string;
  childOptions?: FamilyChildSummaryCardOption[];
  activeParticipantId?: string | null;
  onSelectChild?: (participantId: string) => void;
  onViewProgress?: () => void;
  loading?: boolean;
  previewEmpty?: boolean;
  className?: string;
};

function baselineStatusIcon(status: FamilyChildBaselineStatus): string {
  if (status === 'Complete') return '✓';
  if (status === 'In Progress') return '◐';
  return '○';
}

export default function FamilyChildSummaryCard({
  childName,
  programName,
  baselineStatus,
  modulesCompleted,
  modulesTotal,
  lastActivityLabel,
  avatarSrc = null,
  avatarInitials,
  childOptions = [],
  activeParticipantId = null,
  onSelectChild,
  onViewProgress,
  loading = false,
  previewEmpty = false,
  className = '',
}: FamilyChildSummaryCardProps) {
  const selectId = useId();
  const hasMultipleChildren = childOptions.length > 1;

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
      className={`family-childSummaryCard${className ? ` ${className}` : ''}`}
      aria-label={`${childName} progress summary`}
    >
      <div className="family-childSummaryAvatarWrap" aria-hidden="true">
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt=""
            className="family-childSummaryAvatarImg"
            decoding="async"
          />
        ) : (
          <span className="family-childSummaryAvatarInitials">{avatarInitials}</span>
        )}
      </div>

      <div className="family-childSummaryMain">
        <div className="family-childSummaryIdentity">
          {hasMultipleChildren && onSelectChild ? (
            <div className="family-childSummaryNameRow">
              <label className="sr-only" htmlFor={selectId}>
                Select child
              </label>
              <select
                id={selectId}
                className="family-childSummaryNameSelect"
                value={activeParticipantId ?? childOptions[0]?.participantId ?? ''}
                onChange={(event) => onSelectChild(event.target.value)}
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

        <ul className="family-childSummaryStatusRow">
          <li>
            <span className="family-childSummaryStatusIcon" aria-hidden="true">
              {baselineStatusIcon(baselineStatus)}
            </span>
            <span>
              Baseline{' '}
              {baselineStatus === 'Complete'
                ? 'Complete'
                : baselineStatus === 'In Progress'
                  ? 'In Progress'
                  : 'Not Started'}
            </span>
          </li>
          <li>
            <span className="family-childSummaryStatusIcon" aria-hidden="true">
              📚
            </span>
            <span>
              {modulesCompleted} / {modulesTotal} Modules
            </span>
          </li>
          <li>
            <span className="family-childSummaryStatusIcon" aria-hidden="true">
              🕒
            </span>
            <span>Last Activity: {lastActivityLabel}</span>
          </li>
        </ul>
      </div>

      <div className="family-childSummaryActions">
        <button
          type="button"
          className="family-nextCta family-childSummaryCta"
          onClick={() => onViewProgress?.()}
        >
          View Progress
        </button>
      </div>
    </section>
  );
}
