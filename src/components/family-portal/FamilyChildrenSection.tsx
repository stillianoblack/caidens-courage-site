import React from 'react';
import { formatB4CheckInStatusLabel, formatBaselineAssessmentStatusLabel } from '../../config/assessmentTypeConstants';
import type { FamilyChildSummary } from '../../lib/familyChildrenMetrics';
import type { SelectableChild } from '../../hooks/useActiveChild';

type FamilyChildrenSectionProps = {
  childSummaries: FamilyChildSummary[];
  loading?: boolean;
  adultBaselineComplete?: boolean;
  activeParticipantId?: string;
  onSelectChild?: (child: SelectableChild) => void;
  onViewProgress?: (participantId: string) => void;
};

function baselineStatusClass(status: FamilyChildSummary['baselineStatus']): string {
  if (status === 'Complete') return 'family-childStatus family-childStatus--complete';
  if (status === 'In Progress') return 'family-childStatus family-childStatus--progress';
  return 'family-childStatus family-childStatus--pending';
}

export default function FamilyChildrenSection({
  childSummaries,
  loading = false,
  adultBaselineComplete = false,
  activeParticipantId = '',
  onSelectChild,
  onViewProgress,
}: FamilyChildrenSectionProps) {
  return (
    <section className="family-panelBlock" aria-labelledby="family-children-title">
      <div className="family-panelBlockHead">
        <h2 id="family-children-title" className="family-panelBlockTitle">
          Children
        </h2>
      </div>

      {loading ? (
        <div className="family-childrenSkeleton" aria-busy="true" aria-label="Loading children">
          {Array.from({ length: 2 }, (_, index) => (
            <div key={index} className="family-skeletonBar" />
          ))}
        </div>
      ) : null}

      {!loading && childSummaries.length === 0 ? (
        <p className="family-panelHelper">
          {adultBaselineComplete
            ? 'Adult baseline complete. Child profiles will appear after your child completes a B-4 Check-In or mission.'
            : 'Child profiles will appear here after a student completes a B-4 Check-In or game activity.'}
        </p>
      ) : null}

      {!loading && childSummaries.length > 0 ? (
        <ul className="family-childrenList">
          {childSummaries.map((child) => {
            const isActive = Boolean(
              activeParticipantId && child.participantId === activeParticipantId,
            );
            return (
            <li key={child.key} className={`family-childCard${isActive ? ' family-childCard--active' : ''}`}>
              {onViewProgress && child.participantId ? (
                <button
                  type="button"
                  className="family-childAvatarBtn"
                  onClick={() => onViewProgress(child.participantId!)}
                  aria-label={`View progress for ${child.displayName}`}
                >
                  <span className="family-childAvatar" aria-hidden="true">
                    {child.displayName.trim().charAt(0).toUpperCase()}
                  </span>
                </button>
              ) : null}
              {onSelectChild && child.participantId ? (
                <button
                  type="button"
                  className="family-childSelectBtn"
                  aria-pressed={isActive}
                  onClick={() =>
                    onSelectChild({
                      participantId: child.participantId!,
                      displayName: child.displayName,
                    })
                  }
                >
                  {isActive ? 'Active player' : 'Set as active player'}
                </button>
              ) : null}
              <div className="family-childCardHead">
                {onViewProgress && child.participantId ? (
                  <button
                    type="button"
                    className="family-childNameBtn"
                    onClick={() => onViewProgress(child.participantId!)}
                  >
                    {child.displayName}
                  </button>
                ) : (
                  <h3 className="family-childName">{child.displayName}</h3>
                )}
                <span className={baselineStatusClass(child.baselineStatus)}>
                  {formatBaselineAssessmentStatusLabel(child.baselineStatus)}
                </span>
                <span className={baselineStatusClass(child.b4CheckInStatus)}>
                  {formatB4CheckInStatusLabel(child.b4CheckInStatus)}
                </span>
              </div>
              <dl className="family-childMeta">
                <div className="family-childMetaRow">
                  <dt>Latest Activity</dt>
                  <dd>{child.latestActivity ?? 'No activity yet'}</dd>
                </div>
                <div className="family-childMetaRow">
                  <dt>Progress</dt>
                  <dd>
                    {onViewProgress && child.participantId ? (
                      <button
                        type="button"
                        className="family-childProgressBtn"
                        onClick={() => onViewProgress(child.participantId!)}
                      >
                        <div className="family-childProgress">
                          <div className="family-childProgressTrack" aria-hidden="true">
                            <div
                              className="family-childProgressFill"
                              style={{ width: `${Math.min(100, Math.max(0, child.progressPct))}%` }}
                            />
                          </div>
                          <span className="family-childProgressPct">{child.progressPct}%</span>
                        </div>
                        <p className="family-childProgressDetail">{child.progressLabel}</p>
                      </button>
                    ) : (
                      <>
                        <div className="family-childProgress">
                          <div className="family-childProgressTrack" aria-hidden="true">
                            <div
                              className="family-childProgressFill"
                              style={{ width: `${Math.min(100, Math.max(0, child.progressPct))}%` }}
                            />
                          </div>
                          <span className="family-childProgressPct">{child.progressPct}%</span>
                        </div>
                        <p className="family-childProgressDetail">{child.progressLabel}</p>
                      </>
                    )}
                  </dd>
                </div>
              </dl>
            </li>
          );
          })}
        </ul>
      ) : null}
    </section>
  );
}
