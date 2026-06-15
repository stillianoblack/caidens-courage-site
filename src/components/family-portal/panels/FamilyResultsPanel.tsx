import React from 'react';
import { useFamilyResults } from '../../../hooks/useFamilyResults';
import type { FamilyResultEntry } from '../../../lib/familyResultsService';
import { PortalPageIntro } from '../../portal-design-system';
import ResponsivePortalTable, {
  type ResponsivePortalTableColumn,
} from '../../portal-design-system/ResponsivePortalTable';

function formatCompletedDate(iso: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function formatScore(entry: FamilyResultEntry): string {
  if (entry.percentScore != null) return `${entry.percentScore}%`;
  if (entry.latestScore != null && entry.maxScore != null) {
    return `${entry.latestScore} / ${entry.maxScore}`;
  }
  if (entry.latestScore != null) return String(entry.latestScore);
  return '—';
}

function formatCompletionProgress(entry: FamilyResultEntry): string {
  if (entry.latestScore != null && entry.maxScore != null) {
    return `${entry.latestScore}/${entry.maxScore}`;
  }
  if (entry.percentScore != null) return `${entry.percentScore}%`;
  return '—';
}

const RESULT_COLUMNS: ResponsivePortalTableColumn<FamilyResultEntry>[] = [
  {
    id: 'name',
    header: 'Name',
    mobileRole: 'primary',
    className: 'family-resultsName',
    render: (entry) => entry.personName,
  },
  {
    id: 'assessment',
    header: 'Assessment',
    mobileRole: 'secondary',
    render: (entry) => entry.assessmentLabel,
  },
  {
    id: 'score',
    header: 'Score',
    mobileRole: 'metric',
    render: (entry) => formatScore(entry),
  },
  {
    id: 'completed-progress',
    header: 'Completed',
    mobileRole: 'detail',
    mobileLabel: 'Completed',
    mobileOnly: true,
    render: (entry) => formatCompletionProgress(entry),
  },
  {
    id: 'submitted',
    header: 'Completed',
    mobileRole: 'detail',
    mobileLabel: 'Submitted',
    render: (entry) => formatCompletedDate(entry.completedAt),
  },
  {
    id: 'summary',
    header: 'Summary',
    mobileRole: 'detail',
    render: (entry) => entry.progressSummary,
  },
];

type ResultsTableProps = {
  entries: FamilyResultEntry[];
  emptyMessage: string;
  ariaLabel: string;
};

function ResultsTable({ entries, emptyMessage, ariaLabel }: ResultsTableProps) {
  if (entries.length === 0) {
    return <p className="family-panelHelper">{emptyMessage}</p>;
  }

  return (
    <ResponsivePortalTable
      columns={RESULT_COLUMNS}
      rows={entries}
      rowKey={(entry) => entry.id}
      tableClassName="family-resultsTable"
      wrapClassName="family-resultsTableWrap"
      mobileAriaLabel={ariaLabel}
    />
  );
}

export default function FamilyResultsPanel() {
  const { data, loading } = useFamilyResults();

  return (
    <div className="family-panel family-panel--results">
      <PortalPageIntro>
        Assessment scores and reflections for everyone in your family program.
      </PortalPageIntro>

      {loading ? (
        <div className="family-progressSkeleton" aria-busy="true" aria-label="Loading results">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="family-skeletonBar" />
          ))}
        </div>
      ) : null}

      {!loading && data.error ? (
        <p className="family-panelHelper" role="alert">
          {data.error}
        </p>
      ) : null}

      {!loading ? (
        <>
          <section className="family-panelBlock" aria-labelledby="family-results-children">
            <div className="family-panelBlockHead">
              <h2 id="family-results-children" className="family-panelBlockTitle">
                Children
              </h2>
            </div>
            <ResultsTable
              entries={data.children}
              emptyMessage="No child assessments yet. Complete a B-4 Check-In to see results here."
              ariaLabel="Children assessment results"
            />
          </section>

          <section className="family-panelBlock" aria-labelledby="family-results-adults">
            <div className="family-panelBlockHead">
              <h2 id="family-results-adults" className="family-panelBlockTitle">
                Adult / Parent/Guardian Reflections
              </h2>
            </div>
            <ResultsTable
              entries={data.adults}
              emptyMessage="No adult reflections yet. Complete a Parent/Guardian Baseline or Growth Check to see results here."
              ariaLabel="Adult assessment results"
            />
          </section>
        </>
      ) : null}
    </div>
  );
}
