import React, { useMemo, useState } from 'react';
import type { AcademyCohortRow, AcademyOutcomePayload } from '../../types/pilotOutcomes';
import {
  downloadAcademyReport,
  saveAcademyReportingOverride,
} from '../../lib/pilotOutcomesApi';
import './admin-academy-overview.css';

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString() : 'Unavailable';
}

function value(value: number | null | undefined, suffix = '') {
  return value == null ? 'Unavailable' : `${value}${suffix}`;
}

export default function AdminAcademyOverview({
  academy,
  token,
  onReload,
}: {
  academy: AcademyOutcomePayload;
  token: string;
  onReload: () => Promise<void>;
}) {
  const [eligibility, setEligibility] = useState('all');
  const [program, setProgram] = useState('all');
  const [organization, setOrganization] = useState('all');
  const [search, setSearch] = useState('');
  const [reasonById, setReasonById] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState('');
  const [message, setMessage] = useState('');
  const [reporting, setReporting] = useState(false);
  const rows = useMemo(() => academy.cohort.filter((row) => {
    if (eligibility === 'eligible' && !row.included) return false;
    if (eligibility === 'ineligible' && row.included) return false;
    if (program !== 'all' && row.programCode !== program) return false;
    if (organization !== 'all' && row.organization !== organization) return false;
    if (search && !row.studentIdentifier.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [academy.cohort, eligibility, organization, program, search]);

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
        </div>
        <div className="academyOverview-actions">
          <button type="button" disabled={reporting} onClick={() => void generateReport()}>Generate Academy Report</button>
          <button type="button" disabled={reporting} onClick={() => void downloadPdf()}>Download Academy PDF</button>
        </div>
      </header>

      <div className="academyOverview-kpis" aria-label="Academy cohort summary">
        {[
          ['Participant accounts', academy.cohortSummary.totalParticipantAccounts],
          ['Automatically eligible', academy.cohortSummary.automaticallyEligibleStudents],
          ['Manually included', academy.cohortSummary.manuallyIncludedStudents],
          ['Manually excluded', academy.cohortSummary.manuallyExcludedStudents],
          ['Low-engagement exclusions', academy.cohortSummary.lowEngagementExclusions],
          ['Programs represented', academy.cohortSummary.programsRepresented],
          ['Active organizations', academy.cohortSummary.activeOrganizations],
          ['Included students', a.activeStudentCount],
        ].map(([label, metric]) => <article key={label}><strong>{metric}</strong><span>{label}</span></article>)}
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
        <h3>Cohort management</h3>
        <div className="academyOverview-filters">
          <label>Inclusion status<select value={eligibility} onChange={(event) => setEligibility(event.target.value)}><option value="all">All students</option><option value="eligible">Included</option><option value="ineligible">Excluded</option></select></label>
          <label>Program<select value={program} onChange={(event) => setProgram(event.target.value)}><option value="all">All programs</option>{Array.from(new Map(academy.cohort.map((row) => [row.programCode, row.programName])).entries()).filter(([code]) => code).map(([code, name]) => <option key={code || ''} value={code || ''}>{name}</option>)}</select></label>
          <label>Organization<select value={organization} onChange={(event) => setOrganization(event.target.value)}><option value="all">All organizations</option>{Array.from(new Set(academy.cohort.map((row) => row.organization))).sort().map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Privacy-safe identifier<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="FFA-…" /></label>
        </div>
        <div className="academyOverview-cohort" role="list" aria-label="Academy reporting cohort">
          {rows.map((row) => (
            <article key={row.participantId} role="listitem" className="academyOverview-cohortRow">
              <div><strong>{row.studentIdentifier}</strong><span>{row.programName} · {row.programType}</span><span>{row.organization}</span></div>
              <dl>
                <div><dt>Active days</dt><dd>{row.distinctActiveDays}</dd></div>
                <div><dt>Activities</dt><dd>{row.completedRecognizedActivities}</dd></div>
                <div><dt>First activity</dt><dd>{formatDate(row.firstActivity)}</dd></div>
                <div><dt>Latest activity</dt><dd>{formatDate(row.latestActivity)}</dd></div>
                <div><dt>Automatic result</dt><dd>{row.automaticEligible ? 'Eligible' : 'Below threshold'}</dd></div>
                <div><dt>Final status</dt><dd>{row.included ? 'Included' : `Excluded — ${row.exclusionReason || 'No reason recorded'}`}</dd></div>
              </dl>
              <div className="academyOverview-override">
                <label>Reporting override<select value={row.reportingOverride} disabled={savingId === row.participantId} onChange={(event) => void saveOverride(row, event.target.value as AcademyCohortRow['reportingOverride'])}><option value="automatic">Automatic</option><option value="include">Force include</option><option value="exclude">Force exclude</option></select></label>
                <label>Internal reason<input value={reasonById[row.participantId] ?? row.reportingOverrideReason ?? ''} onChange={(event) => setReasonById((current) => ({ ...current, [row.participantId]: event.target.value }))} /></label>
              </div>
            </article>
          ))}
        </div>
        {!rows.length ? <p>No cohort records match these filters.</p> : null}
        {message ? <p role="status">{message}</p> : null}
      </section>
    </section>
  );
}
