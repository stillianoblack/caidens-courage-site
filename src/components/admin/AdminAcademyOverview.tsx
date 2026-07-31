import React, { useMemo, useState } from 'react';
import type { AcademyCohortRow, AcademyOutcomePayload } from '../../types/pilotOutcomes';
import {
  downloadAcademyReport,
  downloadPilotOutcomesReport,
  saveAcademyReportingOverride,
} from '../../lib/pilotOutcomesApi';
import './admin-academy-overview.css';

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString() : 'Unavailable';
}

function value(value: number | null | undefined, suffix = '') {
  return value == null ? 'Unavailable' : `${value}${suffix}`;
}

const classificationCopy: Record<AcademyCohortRow['cohortClassification'], {
  label: string;
  reason: string;
}> = {
  established: {
    label: 'Established',
    reason: 'At least 3 active days and at least 2 recognized completed activities.',
  },
  emerging: {
    label: 'Emerging',
    reason: 'At least 2 active days or 1 recognized completion, but below the established threshold.',
  },
  minimal: {
    label: 'Minimal/no engagement',
    reason: 'One-off, login-only, no recognized completion, or fewer than 2 active days.',
  },
  test_internal: {
    label: 'Test/internal',
    reason: 'Test or internal account; excluded regardless of activity.',
  },
};

export default function AdminAcademyOverview({
  academy,
  token,
  onReload,
  onViewProgram,
}: {
  academy: AcademyOutcomePayload;
  token: string;
  onReload: () => Promise<void>;
  onViewProgram: (programId: string) => Promise<void>;
}) {
  const [cohortFilter, setCohortFilter] = useState('non-test');
  const [program, setProgram] = useState('all');
  const [organization, setOrganization] = useState('all');
  const [search, setSearch] = useState('');
  const [reasonById, setReasonById] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState('');
  const [message, setMessage] = useState('');
  const [reporting, setReporting] = useState(false);
  const [expandedPrograms, setExpandedPrograms] = useState<Record<string, boolean>>({});
  const rows = useMemo(() => academy.cohort.filter((row) => {
    if (cohortFilter === 'non-test' && row.testSynthetic) return false;
    if (['established', 'emerging', 'minimal', 'test_internal'].includes(cohortFilter)
      && row.cohortClassification !== cohortFilter) return false;
    if (cohortFilter === 'included' && !row.included) return false;
    if (cohortFilter === 'excluded' && row.included) return false;
    if (program !== 'all' && row.programCode !== program) return false;
    if (organization !== 'all' && row.organization !== organization) return false;
    if (search && !row.studentIdentifier.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [academy.cohort, cohortFilter, organization, program, search]);
  const programRows = useMemo(() => academy.programSummaries
    .map((summary) => ({
      ...summary,
      students: rows.filter((row) => row.programId === summary.programId),
    }))
    .filter((summary) => summary.students.length > 0), [academy.programSummaries, rows]);

  const saveOverride = async (
    row: AcademyCohortRow,
    reportingOverride: 'automatic' | 'include' | 'exclude',
  ) => {
    setSavingId(row.participantId);
    setMessage('');
    try {
      await saveAcademyReportingOverride(token, {
        participantId: row.participantId,
        reportingOverride,
        reason: reasonById[row.participantId],
      });
      setMessage(`Reporting status saved for ${row.studentIdentifier}.`);
      await onReload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The reporting status could not be saved.');
    } finally {
      setSavingId('');
    }
  };

  const generateReport = async () => {
    setReporting(true);
    setMessage('');
    try {
      const result = await downloadAcademyReport('html');
      const reportWindow = window.open('', '_blank', 'noopener,noreferrer');
      if (!reportWindow) throw new Error('Allow popups to open the Academy report.');
      reportWindow.document.write(result.html || '');
      reportWindow.document.close();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The Academy report could not be generated.');
    } finally {
      setReporting(false);
    }
  };

  const downloadPdf = async () => {
    setReporting(true);
    setMessage('');
    try {
      const result = await downloadAcademyReport('pdf');
      if (!('blob' in result) || !result.blob) throw new Error('The Academy PDF could not be generated.');
      const url = URL.createObjectURL(result.blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = result.filename || 'focus-flame-academy-overview.pdf';
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The Academy PDF could not be downloaded.');
    } finally {
      setReporting(false);
    }
  };

  const downloadExecutiveShareout = async () => {
    setReporting(true);
    setMessage('');
    try {
      const result = await downloadAcademyReport('executive');
      if (!('blob' in result) || !result.blob) throw new Error('The Executive Share-Out could not be generated.');
      const url = URL.createObjectURL(result.blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = result.filename || 'focus-flame-academy-executive-shareout.pdf';
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The Executive Share-Out could not be downloaded.');
    } finally {
      setReporting(false);
    }
  };

  const programReport = async (
    programId: string | null,
    disposition: 'inline' | 'attachment',
  ) => {
    if (!programId) {
      setMessage('This program does not have a reportable program record.');
      return;
    }
    setReporting(true);
    setMessage('');
    try {
      const result = await downloadPilotOutcomesReport(token, {
        programId,
        format: 'pdf',
        disposition,
        includeStudentAppendix: false,
        includeNotes: true,
        includeCharts: true,
      });
      const url = URL.createObjectURL(result.blob);
      if (disposition === 'inline') window.open(url, '_blank', 'noopener,noreferrer');
      else {
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = result.filename;
        anchor.click();
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The program report could not be generated.');
    } finally {
      setReporting(false);
    }
  };

  const a = academy.aggregate;
  return (
    <section className="academyOverview" aria-labelledby="academy-overview-title">
      <header className="academyOverview-hero">
        <div>
          <p className="pilotOutcomes-eyebrow">Academy reporting level</p>
          <h2 id="academy-overview-title">Focus Flame Academy Overview</h2>
          <p>{academy.eligibilityRule.statement}</p>
          <p className="academyOverview-range">
            Reporting period: {formatDate(academy.cohortSummary.earliestActivity)}–{formatDate(academy.cohortSummary.latestActivity)}
          </p>
          <p className="academyOverview-calculated">Calculated at {new Date(academy.calculatedAt).toLocaleString()}</p>
        </div>
        <div className="academyOverview-actions">
          <button type="button" disabled={reporting} onClick={() => void generateReport()}>Generate Academy Report</button>
          <button type="button" disabled={reporting} onClick={() => void downloadPdf()}>Download Academy PDF</button>
          <button type="button" disabled={reporting} onClick={() => void downloadExecutiveShareout()}>Download Executive Share-Out</button>
        </div>
      </header>

      <section className="academyOverview-summary" aria-labelledby="academy-cohort-summary">
        <div>
          <p className="pilotOutcomes-eyebrow">Formal cohort definition</p>
          <h3 id="academy-cohort-summary">Academy cohort summary</h3>
          <p>Cohort denominator: {academy.cohortSummary.canonicalStudentAccounts} canonical student accounts. Categories are mutually exclusive and total {academy.cohortSummary.canonicalStudentAccounts}.</p>
        </div>
        <div className="academyOverview-kpis">
        {[
          ['Canonical student accounts', academy.cohortSummary.canonicalStudentAccounts],
          ['Established reporting cohort', academy.cohortSummary.establishedParticipants],
          ['Emerging participants', academy.cohortSummary.emergingParticipants],
          ['Minimal/no engagement', academy.cohortSummary.minimalParticipants],
          ['Test/internal excluded', academy.cohortSummary.testInternalParticipants],
          ['Manual inclusions', academy.cohortSummary.manuallyIncludedStudents],
          ['Manual exclusions', academy.cohortSummary.manuallyExcludedStudents],
        ].map(([label, metric]) => <article key={label}><strong>{metric}</strong><span>{label}</span></article>)}
        </div>
      </section>

      <section className="academyOverview-panel" aria-labelledby="program-reporting-summary">
        <div className="academyOverview-sectionHeading">
          <div>
            <p className="pilotOutcomes-eyebrow">Program level</p>
            <h3 id="program-reporting-summary">Program Reporting Summary</h3>
            <p>Program-scoped enrollment and reporting composition. Select a program to view its own denominator, signals, and report.</p>
          </div>
          <span className="academyOverview-scopeBadge">Program-scoped</span>
        </div>
        <div className="academyOverview-programTableWrap">
          <table className="academyOverview-programTable">
            <thead><tr><th>Program</th><th>Program type</th><th>Organization</th><th>Enrolled</th><th>Established</th><th>Emerging</th><th>Minimal</th><th>Included in formal report</th><th>Latest activity</th><th>Actions</th></tr></thead>
            <tbody>{academy.programSummaries.map((summary) => (
              <tr key={summary.programCode || summary.programName}>
                <td><strong>{summary.programName}</strong>{summary.programCode ? <small>{summary.programCode}</small> : null}</td>
                <td>{summary.programType}</td><td>{summary.organization}</td><td>{summary.enrolledStudents}</td>
                <td>{summary.establishedStudents}</td><td>{summary.emergingStudents}</td><td>{summary.minimalStudents}</td>
                <td>{summary.includedStudents}</td><td>{formatDate(summary.latestActivity)}</td>
                <td><div className="academyOverview-tableActions">
                  <button type="button" disabled={!summary.programId} onClick={() => summary.programId && void onViewProgram(summary.programId)}>View Program Report</button>
                  <button type="button" onClick={() => setExpandedPrograms((current) => ({ ...current, [summary.programCode || summary.programName]: true }))}>View Students</button>
                  <button type="button" disabled={reporting || !summary.programId} onClick={() => void programReport(summary.programId, 'inline')}>Generate Program Report</button>
                  <button type="button" disabled={reporting || !summary.programId} onClick={() => void programReport(summary.programId, 'attachment')}>Download Program PDF</button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </section>

      <div className="academyOverview-populations">
        <section className="academyOverview-panel">
          <p className="pilotOutcomes-eyebrow">Academy operations</p>
          <h3>Operational participation</h3>
          <p>Describes the full Academy population and participation activity. These measures are not verified growth.</p>
          <dl>
            <div><dt>Canonical accounts</dt><dd>{academy.cohortSummary.canonicalStudentAccounts}</dd></div>
            <div><dt>Non-test learners</dt><dd>{academy.cohortSummary.nonTestLearners}</dd></div>
            <div><dt>Active learners</dt><dd>{academy.cohortSummary.activeLearners}</dd></div>
            <div><dt>Operational programs</dt><dd>{academy.cohortSummary.operationalPrograms}</dd></div>
          </dl>
        </section>
        <section className="academyOverview-panel academyOverview-panel--formal">
          <p className="pilotOutcomes-eyebrow">Formal reporting cohort</p>
          <h3>Established learners in this report</h3>
          <p>The live learning analysis below uses the {a.activeStudentCount}-student formal cohort unless otherwise labeled.</p>
          <dl>
            <div><dt>Included students</dt><dd>{a.activeStudentCount}</dd></div>
            <div><dt>Included programs</dt><dd>{academy.cohortSummary.programsRepresented}</dd></div>
            <div><dt>Included organizations</dt><dd>{academy.cohortSummary.activeOrganizations}</dd></div>
            <div><dt>Reporting period</dt><dd>{formatDate(academy.cohortSummary.earliestActivity)}–{formatDate(academy.cohortSummary.latestActivity)}</dd></div>
          </dl>
        </section>
      </div>

      <div className="academyOverview-grid">
        <section className="academyOverview-panel">
          <h3>Academy-wide Live Student Progress</h3>
          <div className="academyOverview-signalGrid">
            {(a.liveLearningSnapshot?.cards || []).map((card) => (
              <article key={card.key}>
                <span>{card.label}</span>
                <strong>{card.centerValue}</strong>
                <em>{card.statusLabel}</em>
              </article>
            ))}
          </div>
        </section>
        <section className="academyOverview-panel">
          <h3>Verified Outcomes</h3>
          <p>Verified growth requires matched baseline and post records. Activity is never presented as growth.</p>
          <dl className="academyOverview-domainList">
            {a.impactSnapshot.domains.map((domain) => (
              <div key={domain.key}>
                <dt>{domain.label}</dt>
                <dd>{value(domain.deltaPercentagePoints, ' pts')}</dd>
                <dd>{domain.displayStatus} · matched {domain.matchedStudentCount}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <section className="academyOverview-panel">
        <h3>Engagement and completion</h3>
        <div className="academyOverview-kpis academyOverview-kpis--compact">
          {[
            ['Kid Shell sessions', a.students?.reduce((sum, row) => sum + (row.kidPlaySessions || 0), 0) || 0],
            ['Completed missions', a.missionCount],
            ['Assessments', a.assessmentCount],
            ['Coins', a.focusCoins],
            ['Certificates', a.certificateCount],
            ['Baseline complete', a.baseline.count],
            ['Post complete', a.post.count],
            ['Matched students', a.matchedCount],
          ].map(([label, metric]) => <article key={label}><strong>{metric}</strong><span>{label}</span></article>)}
        </div>
      </section>

      <section className="academyOverview-panel">
        <h3>Data quality</h3>
        <dl className="academyOverview-quality">
          {Object.entries(academy.dataQuality).map(([key, metric]) => (
            <div key={key}><dt>{key.replace(/([A-Z])/g, ' $1')}</dt><dd>{typeof metric === 'boolean' ? (metric ? 'Yes' : 'No') : metric}</dd></div>
          ))}
        </dl>
      </section>

      <section className="academyOverview-panel">
        <p className="pilotOutcomes-eyebrow">Academy level</p>
        <h3>Cohort explorer</h3>
        <p>Programs are collapsed by default. Expand a program to inspect privacy-safe student classifications and reporting controls.</p>
        <div className="academyOverview-filters">
          <label>Cohort status<select value={cohortFilter} onChange={(event) => setCohortFilter(event.target.value)}><option value="non-test">All non-test learners</option><option value="established">Established</option><option value="emerging">Emerging</option><option value="minimal">Minimal/no engagement</option><option value="test_internal">Test/internal</option><option value="included">Included in formal report</option><option value="excluded">Excluded from formal report</option></select></label>
          <label>Program<select value={program} onChange={(event) => setProgram(event.target.value)}><option value="all">All programs</option>{Array.from(new Map(academy.cohort.map((row) => [row.programCode, row.programName])).entries()).filter(([code]) => code).map(([code, name]) => <option key={code || ''} value={code || ''}>{name}</option>)}</select></label>
          <label>Organization<select value={organization} onChange={(event) => setOrganization(event.target.value)}><option value="all">All organizations</option>{Array.from(new Set(academy.cohort.map((row) => row.organization))).sort().map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Privacy-safe identifier<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="FFA-…" /></label>
        </div>
        <div className="academyOverview-programGroups" role="list" aria-label="Academy reporting programs">
          {programRows.map((summary) => {
            const programKey = summary.programCode || summary.programName;
            const expanded = Boolean(expandedPrograms[programKey]);
            return (
              <article key={programKey} role="listitem" className="academyOverview-programGroup">
                <div className="academyOverview-programHeader">
                  <div>
                    <h4>{summary.programName}</h4>
                    <p>{summary.programType} · {summary.organization}</p>
                    {summary.programCode ? <small>{summary.programCode}</small> : null}
                    <strong>{summary.enrolledStudents} enrolled</strong>
                  </div>
                  <div className="academyOverview-programCounts">
                    <span><b>{summary.establishedStudents}</b>Established</span>
                    <span><b>{summary.emergingStudents}</b>Emerging</span>
                    <span><b>{summary.minimalStudents}</b>Minimal/no engagement</span>
                    {summary.testInternalStudents ? <span><b>{summary.testInternalStudents}</b>Test/internal</span> : null}
                    <span><b>{summary.includedStudents}</b>Included in formal report</span>
                  </div>
                  <button type="button" aria-expanded={expanded} onClick={() => setExpandedPrograms((current) => ({ ...current, [programKey]: !expanded }))}>{expanded ? 'Hide students' : 'View students'}</button>
                </div>
                {expanded ? (
                  <div className="academyOverview-studentGroups">
                    {(['established', 'emerging', 'minimal', 'test_internal'] as const).map((classification) => {
                      const students = summary.students.filter((row) => row.cohortClassification === classification);
                      if (!students.length) return null;
                      return <section key={classification} aria-labelledby={`${programKey}-${classification}`}>
                        <h5 id={`${programKey}-${classification}`}>{classificationCopy[classification].label} <span>{students.length}</span></h5>
                        <div className="academyOverview-cohort">{students.map((row) => (
                          <article key={row.participantId} className="academyOverview-cohortRow">
                            <div className="academyOverview-studentCell">
                              <span className="academyOverview-scopeBadge">Student-level</span>
                              <strong>Student {row.studentIdentifier}</strong>
                              <small>Focus Flame Academy / {summary.programName} / Student {row.studentIdentifier}</small>
                            </div>
                            <dl className="academyOverview-rowMetrics">
                              <div><dt>Cohort status</dt><dd>{classificationCopy[row.cohortClassification].label}</dd></div>
                              <div><dt>Active days</dt><dd>{row.distinctActiveDays}</dd></div>
                              <div><dt>Activities</dt><dd>{row.completedRecognizedActivities}</dd></div>
                              <div><dt>Assessments</dt><dd>{row.assessmentCount}</dd></div>
                              <div><dt>Latest activity</dt><dd>{formatDate(row.latestActivity)}</dd></div>
                              <div><dt>Formal reporting</dt><dd>{row.included ? 'Included' : 'Excluded'}</dd></div>
                              {!row.included ? <div className="academyOverview-rowReason"><dt>Exclusion reason</dt><dd>{row.exclusionReason || classificationCopy[row.cohortClassification].reason}</dd></div> : null}
                            </dl>
                            <div className="academyOverview-override" aria-label={`Reporting controls for ${row.studentIdentifier}`}>
                              <label>Reporting override<select value={row.reportingOverride} disabled={savingId === row.participantId} onChange={(event) => void saveOverride(row, event.target.value as AcademyCohortRow['reportingOverride'])}><option value="automatic">Automatic</option><option value="include">Force include</option><option value="exclude">Force exclude</option></select></label>
                              <label>Internal reason<input value={reasonById[row.participantId] ?? row.reportingOverrideReason ?? ''} onChange={(event) => setReasonById((current) => ({ ...current, [row.participantId]: event.target.value }))} /></label>
                            </div>
                          </article>
                        ))}</div>
                      </section>;
                    })}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
        {!programRows.length ? <p>No cohort records match these filters.</p> : null}
        {message ? <p role="status">{message}</p> : null}
      </section>
    </section>
  );
}
