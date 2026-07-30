import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  downloadPilotOutcomesReport,
  fetchAcademyOutcomes,
  fetchPilotOutcomeProgram,
  fetchPilotOutcomes,
  fetchPilotRollout,
  savePilotRollout,
} from '../../../lib/pilotOutcomesApi';
import {
  formatDecimal,
  formatPercentage,
  formatPoints,
  missingImpactStatus,
} from '../../../lib/pilotOutcomesPresentation';
import AdminProgramHealthPanel from '../AdminProgramHealthPanel';
import AdminAcademyOverview from '../AdminAcademyOverview';
import {
  LiveLearningSignalsPanel,
  ProgramDetailSummary,
  VerifiedGrowthPanel,
} from '../AdminPilotEvidencePanels';
import type {
  AcademyOutcomePayload,
  PilotOutcomeProgram,
  PilotOutcomeSummary,
} from '../../../types/pilotOutcomes';
import './admin-pilot-outcomes.css';
import '../admin-program-health-visual.css';

const EMPTY_SUMMARY: PilotOutcomeSummary = {
  totalActivePilots: 0,
  totalEnrolledStudents: 0,
  completedBaseline: 0,
  completedPost: 0,
  matchedStudents: 0,
  averageProgramCompletionRate: null,
  averageWeeklyAdventureCompletion: null,
  totalCompletedAssessments: 0,
  totalCertificatesEarned: 0,
  totalFocusCoinsEarned: 0,
  mostRecentActivity: null,
};

const CHECKLIST = [
  'Program created',
  'Facilitator account active',
  'Welcome email delivered',
  'Roster added',
  'Grade levels confirmed',
  'Baseline assigned',
  'Baseline completed',
  'Weeks published',
  'Parent communication sent',
  'Post-assessment scheduled',
  'Reporting date selected',
  'Final report generated',
  'Follow-up meeting scheduled',
];

function metric(value: number | null, suffix = '') {
  if (suffix === '%') return formatPercentage(value);
  return value == null ? 'Not enough data' : formatDecimal(value) || 'Not enough data';
}

function date(value: string | null) {
  return value ? new Date(value).toLocaleDateString() : 'Not enough data';
}

function AccessibleBar({
  label,
  value,
  max = 100,
  description,
  percentage = false,
}: {
  label: string;
  value: number | null;
  max?: number;
  description: string;
  percentage?: boolean;
}) {
  const width = value == null ? 0 : Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="pilotOutcomes-barGroup">
      <div className="pilotOutcomes-barLabel"><span>{label}</span><strong>{percentage ? formatPercentage(value) : metric(value)}</strong></div>
      <div className="pilotOutcomes-barTrack" aria-hidden="true">
        <span className="pilotOutcomes-barFill" style={{ width: `${width}%` }} />
      </div>
      <span className="sr-only">{description}</span>
    </div>
  );
}

function signedPoints(value: number | null) {
  return formatPoints(value);
}

export { LiveLearningSignalsPanel, VerifiedGrowthPanel };

function SummaryCards({ summary }: { summary: PilotOutcomeSummary }) {
  const metrics = [
    ['Active pilots', summary.totalActivePilots],
    ['Enrolled students', summary.totalEnrolledStudents],
    ['Baseline complete', summary.completedBaseline],
    ['Post complete', summary.completedPost],
    ['Matched students', summary.matchedStudents],
    ['Weekly completion', metric(summary.averageWeeklyAdventureCompletion, '%')],
    ['Assessments', summary.totalCompletedAssessments],
    ['Certificates', summary.totalCertificatesEarned],
    ['Focus Coins', summary.totalFocusCoinsEarned],
    ['Recent activity', date(summary.mostRecentActivity)],
  ];
  return (
    <section aria-labelledby="outcomes-summary-title">
      <h3 id="outcomes-summary-title">Portfolio summary</h3>
      <div className="pilotOutcomes-summaryGrid">
        {metrics.map(([label, value]) => (
          <article className="pilotOutcomes-metric" key={label}>
            <span>{label}</span><strong>{value}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

function DataQuality({ program }: { program: PilotOutcomeProgram }) {
  const items = [
    ['Missing baseline', program.quality.missingBaseline],
    ['Missing post', program.quality.missingPost],
    ['Unmatched records', program.quality.unmatchedRecords],
    ['Duplicate assessments', program.quality.duplicateAssessmentWarnings],
    ['Invalid score ranges', program.quality.invalidScoreRanges],
    ['Students without grade', program.quality.studentsWithoutGrade],
    ['Missing start date', program.quality.programWithoutStartDate ? 1 : 0],
    ['Stale program', program.quality.staleProgram ? 1 : 0],
  ];
  return (
    <section className="pilotOutcomes-panel" aria-labelledby="quality-title">
      <h3 id="quality-title">Data quality</h3>
      <div className="pilotOutcomes-qualityGrid">
        {items.map(([label, value]) => <p key={label}><span>{label}</span><strong>{value}</strong></p>)}
      </div>
      <h4>Report blockers</h4>
      {program.reportBlockers.length ? (
        <ul>{program.reportBlockers.map((blocker) => <li key={blocker}>{blocker}</li>)}</ul>
      ) : <p>No report blockers detected.</p>}
    </section>
  );
}

function OutcomeCharts({ program }: { program: PilotOutcomeProgram }) {
  return (
    <section className="pilotOutcomes-panel" aria-labelledby="outcomes-charts-title">
      <h3 id="outcomes-charts-title">Outcomes and engagement</h3>
      <div className="pilotOutcomes-chartGrid">
        <div>
          <h4>Baseline vs post average</h4>
          <AccessibleBar label="Baseline" value={program.baselineAverage} description={`Baseline average ${metric(program.baselineAverage)}, matched n equals ${program.matchedCount}.`} />
          <AccessibleBar label="Post" value={program.postAverage} description={`Post average ${metric(program.postAverage)}, matched n equals ${program.matchedCount}.`} />
          <p>Absolute delta: <strong>{metric(program.absoluteDelta)}</strong>. Percentage delta: <strong>{program.percentageDeltaAvailable ? metric(program.percentageDelta, '%') : 'Unavailable'}</strong>. Matched n={program.matchedCount}.</p>
        </div>
        <div>
          <h4>Assessment and weekly completion</h4>
          <AccessibleBar percentage label="Baseline" value={program.baseline.total ? (program.baseline.count / program.baseline.total) * 100 : null} description={`Baseline completion ${program.baseline.count} of ${program.baseline.total}.`} />
          <AccessibleBar percentage label="Post" value={program.post.total ? (program.post.count / program.post.total) * 100 : null} description={`Post completion ${program.post.count} of ${program.post.total}.`} />
          <AccessibleBar percentage label="Weekly" value={program.weeklyCompletion.rate} description={`Weekly completion ${program.weeklyCompletion.count} of ${program.weeklyCompletion.total}.`} />
        </div>
      </div>
      <h4>Category-level gains</h4>
      {program.categories.length ? (
        <div className="pilotOutcomes-categoryList">
          {program.categories.map((category) => (
            <AccessibleBar
              key={category.category}
              label={category.category}
              value={category.delta}
              max={100}
              description={`${category.category} delta ${metric(category.delta)} with matched n equals ${category.n}.`}
            />
          ))}
        </div>
      ) : <p className="pilotOutcomes-empty">Not enough category-level data.</p>}
    </section>
  );
}

function ProgramDetail({
  program,
  token,
  onClose,
}: {
  program: PilotOutcomeProgram;
  token: string;
  onClose(): void;
}) {
  const [includeAppendix, setIncludeAppendix] = useState(false);
  const [includeNotes, setIncludeNotes] = useState(true);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [reportState, setReportState] = useState<'draft' | 'final'>('draft');
  const [reportingStart, setReportingStart] = useState('');
  const [reportingEnd, setReportingEnd] = useState('');
  const [educatorNotes, setEducatorNotes] = useState('');
  const [reportError, setReportError] = useState('');
  const [generating, setGenerating] = useState(false);

  const generate = async (format: 'pdf' | 'html', disposition: 'inline' | 'attachment') => {
    setGenerating(true);
    setReportError('');
    try {
      const result = await downloadPilotOutcomesReport(token, {
        programId: program.id,
        format,
        disposition,
        status: reportState,
        includeStudentAppendix: includeAppendix,
        includeNotes,
        includeCharts,
        reportingStart,
        reportingEnd,
        notes: { whatWorked: educatorNotes },
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
      setReportError(error instanceof Error ? error.message : 'The report could not be generated.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="phVisual pilotOutcomes-detail">
      <nav aria-label="Reporting breadcrumb" className="pilotOutcomes-breadcrumb">
        <span>Focus Flame Academy</span><span>/</span><strong>{program.programName}</strong>
      </nav>
      <div className="pilotOutcomes-detailHeader">
        <div><p className="phVisual-eyebrow">Program-scoped</p><h2>{program.programName} Report</h2><p>Program-scoped enrollment, engagement, live learning signals, cohort status, and verified outcomes.</p><p className="phVisual-meta">{program.programType} · {program.facilitator}</p></div>
        <button type="button" className="adminPortal-btn adminPortal-btn--ghost" onClick={onClose}>Back to Academy Overview</button>
      </div>
      <ProgramDetailSummary program={program} />
      {program.reportingCohort ? (
        <section className="pilotOutcomes-panel" aria-labelledby="program-cohort-title">
          <p className="phVisual-eyebrow">Program-scoped denominator</p>
          <h3 id="program-cohort-title">{program.programName} cohort</h3>
          <p>This program contains {program.reportingCohort.enrolledStudents} enrolled students. These counts do not use the Academy-wide formal-report denominator.</p>
          <div className="pilotOutcomes-summaryGrid">
            {[
              ['Enrolled', program.reportingCohort.enrolledStudents],
              ['Established', program.reportingCohort.establishedStudents],
              ['Emerging', program.reportingCohort.emergingStudents],
              ['Minimal/no engagement', program.reportingCohort.minimalStudents],
              ['Test/internal', program.reportingCohort.testInternalStudents],
              ['Included in formal report', program.reportingCohort.includedStudents],
            ].map(([label, count]) => <article className="pilotOutcomes-metric" key={label}><span>{label}</span><strong>{count}</strong></article>)}
          </div>
        </section>
      ) : null}
      <AdminProgramHealthPanel program={program} />
      <LiveLearningSignalsPanel program={program} />
      <VerifiedGrowthPanel program={program} />
      <OutcomeCharts program={program} />
      <DataQuality program={program} />
      <section className="pilotOutcomes-panel">
        <h3>Grade distribution</h3>
        {program.gradeDistribution.length
          ? <ul>{program.gradeDistribution.map((item) => <li key={item.grade}>{item.grade}: {item.count}</li>)}</ul>
          : <p>Not enough data.</p>}
      </section>
      <section className="pilotOutcomes-panel">
        <p className="phVisual-eyebrow">Student-level</p>
        <h3>Student Reporting Detail</h3>
        <p>Privacy-safe student activity, classification, and reporting status.</p>
        <div className="pilotOutcomes-tableWrap">
          <table>
            <thead><tr><th>Student</th><th>Grade</th><th>Baseline</th><th>Post</th><th>Delta</th><th>Weeks</th><th>Missions</th><th>Coins</th><th>Certificates</th><th>State</th></tr></thead>
            <tbody>{program.students?.map((student) => (
              <tr key={student.studentLabel}>
                <td>{student.studentLabel}</td><td>{student.grade}</td><td>{metric(student.baselineScore)}</td>
                <td>{metric(student.postScore)}</td><td>{metric(student.delta)}</td><td>{student.weeklyAdventuresCompleted}</td>
                <td>{student.missionsCompleted}</td><td>{student.focusCoins}</td><td>{student.certificates}</td><td>{student.dataCompleteness}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </section>
      <section className="pilotOutcomes-panel">
        <h3>Branded report</h3>
        <div className="pilotOutcomes-controls">
          <label><input type="checkbox" checked={includeAppendix} onChange={(event) => setIncludeAppendix(event.target.checked)} /> Student appendix</label>
          <label><input type="checkbox" checked={includeNotes} onChange={(event) => setIncludeNotes(event.target.checked)} /> Educator notes</label>
          <label><input type="checkbox" checked={includeCharts} onChange={(event) => setIncludeCharts(event.target.checked)} /> Charts</label>
          <label>Report status<select value={reportState} onChange={(event) => setReportState(event.target.value as 'draft' | 'final')}><option value="draft">Draft</option><option value="final">Final</option></select></label>
          <label>Reporting start<input type="date" value={reportingStart} onChange={(event) => setReportingStart(event.target.value)} /></label>
          <label>Reporting end<input type="date" value={reportingEnd} onChange={(event) => setReportingEnd(event.target.value)} /></label>
        </div>
        <label className="pilotOutcomes-notes">Educator observations<textarea value={educatorNotes} onChange={(event) => setEducatorNotes(event.target.value)} placeholder="What worked, student response, challenges, and approved next steps" /></label>
        <div className="pilotOutcomes-actions">
          <button disabled={generating} type="button" className="adminPortal-btn adminPortal-btn--ghost" onClick={() => void generate('pdf', 'inline')}>Generate Program Report</button>
          <button disabled={generating} type="button" className="adminPortal-btn adminPortal-btn--primary" onClick={() => void generate('pdf', 'attachment')}>Download Program PDF</button>
          <button disabled={generating} type="button" className="adminPortal-btn adminPortal-btn--ghost" onClick={() => void generate('html', 'inline')}>Program HTML print view</button>
        </div>
        {reportError ? <p className="adminPortal-error">{reportError}</p> : null}
      </section>
    </div>
  );
}

function Rollout({
  token,
  programs,
}: {
  token: string;
  programs: PilotOutcomeProgram[];
}) {
  const [programId, setProgramId] = useState(programs[0]?.id || '');
  const [status, setStatus] = useState('Draft');
  const [reason, setReason] = useState('');
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState('');
  const [persistenceAvailable, setPersistenceAvailable] = useState(true);
  const [noteType, setNoteType] = useState('Facilitator follow-up');
  const [note, setNote] = useState('');
  const [nextActionDate, setNextActionDate] = useState('');
  useEffect(() => {
    if (!programId) return;
    void fetchPilotRollout(token, programId).then((payload) => {
      setPersistenceAvailable(payload.persistenceAvailable);
      const state = payload.state || {};
      if (typeof state.status === 'string') setStatus(state.status);
      if (typeof state.status_reason === 'string') setReason(state.status_reason);
      if (state.checklist && typeof state.checklist === 'object') setChecklist(state.checklist as Record<string, boolean>);
    }).catch(() => setPersistenceAvailable(false));
  }, [programId, token]);
  const save = async () => {
    setMessage('');
    try {
      await savePilotRollout(token, { action: 'save_state', programId, status, statusReason: reason, checklist });
      setMessage('Rollout readiness saved.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Rollout readiness could not be saved.');
    }
  };
  const addNote = async () => {
    setMessage('');
    try {
      await savePilotRollout(token, {
        action: 'add_note',
        programId,
        noteType,
        note,
        nextActionDate: nextActionDate || null,
        ownerName: 'Admin',
      });
      setNote('');
      setMessage('Follow-up note saved.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The follow-up note could not be saved.');
    }
  };
  const current = programs.find((program) => program.id === programId);
  const rolloutMetrics = [
    ['Ready to launch', programs.filter((program) => program.status.toLowerCase() === 'ready').length],
    ['Currently active', programs.filter((program) => program.status === 'active').length],
    ['Missing baseline', programs.filter((program) => program.quality.missingBaseline > 0).length],
    ['Reports ready', programs.filter((program) => program.reportStatus === 'Ready').length],
    ['Needs attention', programs.filter((program) => program.reportBlockers.length > 0).length],
    ['Expansion review', programs.filter((program) => program.matchedCount >= 5 && !program.reportBlockers.length).length],
  ];
  return (
    <section className="pilotOutcomes-panel" aria-labelledby="rollout-title">
      <h3 id="rollout-title">Pilot Rollout</h3>
      <p>Use one canonical readiness checklist per program. Status changes are always explicit.</p>
      <div className="pilotOutcomes-summaryGrid">
        {rolloutMetrics.map(([label, value]) => <article className="pilotOutcomes-metric" key={label}><span>{label}</span><strong>{value}</strong></article>)}
      </div>
      {!persistenceAvailable ? <p className="pilotOutcomes-warning">Rollout persistence requires the additive rollout metadata migration. No existing data was changed.</p> : null}
      <div className="pilotOutcomes-controls">
        <label>Program<select value={programId} onChange={(event) => setProgramId(event.target.value)}>{programs.map((program) => <option key={program.id} value={program.id}>{program.programName}</option>)}</select></label>
        <label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}>{['Draft','Setup','Ready','Active','Needs attention','Reporting','Complete','Archived'].map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Status reason<input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Explain Needs attention or another status" /></label>
      </div>
      <div className="pilotOutcomes-checklist">
        {CHECKLIST.map((item) => <label key={item}><input type="checkbox" checked={Boolean(checklist[item])} onChange={(event) => setChecklist((currentChecklist) => ({ ...currentChecklist, [item]: event.target.checked }))} /> {item}</label>)}
      </div>
      <p>Current matched count: <strong>{current?.matchedCount ?? 0}</strong>. Current weekly completion: <strong>{metric(current?.weeklyCompletion.rate ?? null, '%')}</strong>.</p>
      <button type="button" className="adminPortal-btn adminPortal-btn--primary" onClick={() => void save()}>Save rollout readiness</button>
      <h4>Outreach and follow-up note</h4>
      <div className="pilotOutcomes-controls">
        <label>Note type<select value={noteType} onChange={(event) => setNoteType(event.target.value)}>{['Facilitator follow-up','Principal follow-up','Parent communication','Technical issue','Training need','Expansion opportunity'].map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Next action date<input type="date" value={nextActionDate} onChange={(event) => setNextActionDate(event.target.value)} /></label>
      </div>
      <label className="pilotOutcomes-notes">Note<textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Record the follow-up without triggering an email." /></label>
      <button disabled={!note.trim()} type="button" className="adminPortal-btn adminPortal-btn--ghost" onClick={() => void addNote()}>Add note</button>
      {message ? <p role="status">{message}</p> : null}
      <p className="pilotOutcomes-docLinks">Existing references: Facilitator onboarding checklist · Family onboarding checklist · Pilot data collection plan.</p>
    </section>
  );
}

export default function AdminPilotOutcomesTab({ token }: { token: string }) {
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [academy, setAcademy] = useState<AcademyOutcomePayload | null>(null);
  const [programs, setPrograms] = useState<PilotOutcomeProgram[]>([]);
  const [selected, setSelected] = useState<PilotOutcomeProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [programType, setProgramType] = useState('all');
  const [programId, setProgramId] = useState('all');
  const [grade, setGrade] = useState('all');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [status, setStatus] = useState('all');
  const [assessmentStatus, setAssessmentStatus] = useState('all');
  const [completionStatus, setCompletionStatus] = useState('all');
  const [minimumMatched, setMinimumMatched] = useState(0);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [result, academyResult] = await Promise.all([
        fetchPilotOutcomes(token),
        fetchAcademyOutcomes(token),
      ]);
      setSummary(result.summary); setPrograms(result.programs); setAcademy(academyResult.academy);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Pilot outcomes could not be loaded.');
    } finally { setLoading(false); }
  }, [token]);
  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => programs.filter((program) => {
    if (programId !== 'all' && program.id !== programId) return false;
    if (programType !== 'all' && program.programType !== programType) return false;
    if (grade !== 'all' && !program.gradeDistribution.some((item) => item.grade === grade)) return false;
    if (status !== 'all' && program.status !== status) return false;
    if (dateStart && (!program.lastActivity || new Date(program.lastActivity) < new Date(dateStart))) return false;
    if (dateEnd && (!program.lastActivity || new Date(program.lastActivity) > new Date(`${dateEnd}T23:59:59`))) return false;
    if (program.matchedCount < minimumMatched) return false;
    if (assessmentStatus === 'matched' && !program.matchedCount) return false;
    if (assessmentStatus === 'baseline-only' && !(program.baseline.count && !program.post.count)) return false;
    if (assessmentStatus === 'post-only' && !(program.post.count && !program.baseline.count)) return false;
    if (assessmentStatus === 'incomplete' && program.baseline.count === program.baseline.total && program.post.count === program.post.total) return false;
    if (completionStatus === 'complete' && program.weeklyCompletion.rate !== 100) return false;
    if (completionStatus === 'in-progress' && !(program.weeklyCompletion.rate != null && program.weeklyCompletion.rate > 0 && program.weeklyCompletion.rate < 100)) return false;
    if (completionStatus === 'not-started' && program.weeklyCompletion.count !== 0) return false;
    return true;
  }), [assessmentStatus, completionStatus, dateEnd, dateStart, grade, minimumMatched, programId, programType, programs, status]);

  const openProgram = async (programId: string) => {
    setError('');
    try {
      const result = await fetchPilotOutcomeProgram(token, programId);
      setSelected(result.program);
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : 'Program outcomes could not be loaded.');
    }
  };

  if (selected) return <ProgramDetail program={selected} token={token} onClose={() => setSelected(null)} />;
  return (
    <div className="pilotOutcomes">
      <header className="pilotOutcomes-header"><div><p className="pilotOutcomes-eyebrow">Academy-wide</p><h2>Academy and Program Reporting</h2><p>Academy-wide operational participation and formal reporting across all qualifying programs.</p></div><button type="button" className="adminPortal-btn adminPortal-btn--ghost" onClick={() => void load()}>Refresh reporting</button></header>
      {loading ? <p role="status">Loading pilot outcomes…</p> : null}
      {error ? <div className="pilotOutcomes-warning"><p>{error}</p><button type="button" className="adminPortal-btn adminPortal-btn--primary" onClick={() => void load()}>Try Again</button></div> : null}
      {academy ? <AdminAcademyOverview academy={academy} token={token} onReload={load} onViewProgram={openProgram} /> : null}
      <SummaryCards summary={summary} />
      <section className="pilotOutcomes-panel" aria-labelledby="filters-title">
        <h3 id="filters-title">Filters</h3>
        <div className="pilotOutcomes-controls">
          <label>Program<select value={programId} onChange={(event) => setProgramId(event.target.value)}><option value="all">All programs</option>{programs.map((program) => <option key={program.id} value={program.id}>{program.programName}</option>)}</select></label>
          <label>Program type<select value={programType} onChange={(event) => setProgramType(event.target.value)}><option value="all">All types</option>{Array.from(new Set(programs.map((program) => program.programType))).map((type) => <option key={type}>{type}</option>)}</select></label>
          <label>Grade<select value={grade} onChange={(event) => setGrade(event.target.value)}><option value="all">All grades</option>{Array.from(new Set(programs.flatMap((program) => program.gradeDistribution.map((item) => item.grade)))).sort().map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Activity from<input type="date" value={dateStart} onChange={(event) => setDateStart(event.target.value)} /></label>
          <label>Activity through<input type="date" value={dateEnd} onChange={(event) => setDateEnd(event.target.value)} /></label>
          <label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Active and archived</option>{Array.from(new Set(programs.map((program) => program.status))).map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Assessment status<select value={assessmentStatus} onChange={(event) => setAssessmentStatus(event.target.value)}><option value="all">All states</option><option value="matched">Matched</option><option value="baseline-only">Baseline only</option><option value="post-only">Post only</option><option value="incomplete">Incomplete</option></select></label>
          <label>Completion status<select value={completionStatus} onChange={(event) => setCompletionStatus(event.target.value)}><option value="all">All completion states</option><option value="complete">Complete</option><option value="in-progress">In progress</option><option value="not-started">Not started</option></select></label>
          <label>Minimum matched students<input type="number" min="0" value={minimumMatched} onChange={(event) => setMinimumMatched(Number(event.target.value))} /></label>
        </div>
      </section>
      <section className="pilotOutcomes-panel" aria-labelledby="program-table-title">
        <h3 id="program-table-title">Programs</h3>
        <div className="pilotOutcomes-tableWrap">
          <table className="pilotOutcomes-programTable"><thead><tr><th>Program</th><th>Overall matched growth</th><th>Matched students</th><th>Weekly completion</th><th>Data quality</th><th>Action</th></tr></thead>
          <tbody>{filtered.map((program) => {
            const overall = program.impactSnapshot.overallMatchedGrowth;
            return <tr key={program.id}><td data-label="Program"><strong>{program.programName}</strong><br /><span>{program.programType}</span></td><td data-label="Overall matched growth">{signedPoints(overall.deltaPercentagePoints)}<br /><span>{overall.deltaPercentagePoints == null ? missingImpactStatus('overall') : overall.displayStatus}</span></td><td data-label="Matched students">{program.matchedCount}</td><td data-label="Weekly completion">{metric(program.weeklyCompletion.rate, '%')}</td><td data-label="Data quality">{overall.dataQualityStatus}</td><td data-label="Action"><button type="button" onClick={() => void openProgram(program.id)}>View Details</button></td></tr>;
          })}</tbody></table>
        </div>
        {!filtered.length && !loading ? <p className="pilotOutcomes-empty">No programs match these filters.</p> : null}
      </section>
      <Rollout token={token} programs={programs} />
    </div>
  );
}
