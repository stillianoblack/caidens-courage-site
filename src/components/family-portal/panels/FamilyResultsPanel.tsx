import React from 'react';
import { useFamilyResults } from '../../../hooks/useFamilyResults';
import type { FamilyResultEntry } from '../../../lib/familyResultsService';

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

function ResultsTable({
  entries,
  emptyMessage,
}: {
  entries: FamilyResultEntry[];
  emptyMessage: string;
}) {
  if (entries.length === 0) {
    return <p className="family-panelHelper">{emptyMessage}</p>;
  }

  return (
    <div className="family-resultsTableWrap">
      <table className="family-resultsTable">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Assessment</th>
            <th scope="col">Score</th>
            <th scope="col">Completed</th>
            <th scope="col">Summary</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td className="family-resultsName">{entry.personName}</td>
              <td>{entry.assessmentLabel}</td>
              <td>{formatScore(entry)}</td>
              <td>{formatCompletedDate(entry.completedAt)}</td>
              <td>{entry.progressSummary}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function FamilyResultsPanel() {
  const { data, loading } = useFamilyResults();

  return (
    <div className="family-panel family-panel--results">
      <header className="family-panelIntro">
        <h1 className="family-panelIntroTitle">Results</h1>
        <p className="family-panelIntroSubtitle">
          Assessment scores and reflections for everyone in your family program.
        </p>
      </header>

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
            />
          </section>
        </>
      ) : null}
    </div>
  );
}
