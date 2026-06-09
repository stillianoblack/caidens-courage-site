import React from 'react';
import { formatChildBaselineStatusLabel } from '../../config/assessmentTypeConstants';
import type { FamilyChildSummary } from '../../lib/familyChildrenMetrics';

type FamilyChildrenSectionProps = {
  childSummaries: FamilyChildSummary[];
  loading?: boolean;
  adultBaselineComplete?: boolean;
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
          {childSummaries.map((child) => (
            <li key={child.key} className="family-childCard">
              <div className="family-childCardHead">
                <h3 className="family-childName">{child.displayName}</h3>
                <span className={baselineStatusClass(child.baselineStatus)}>
                  {formatChildBaselineStatusLabel(child.baselineStatus)}
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
                  </dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
