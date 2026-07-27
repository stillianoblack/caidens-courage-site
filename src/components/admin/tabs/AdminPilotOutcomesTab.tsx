import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  downloadPilotOutcomesReport,
  fetchPilotOutcomeProgram,
  fetchPilotOutcomes,
  fetchPilotRollout,
  savePilotRollout,
} from '../../../lib/pilotOutcomesApi';
import type { PilotOutcomeProgram, PilotOutcomeSummary } from '../../../types/pilotOutcomes';
import './admin-pilot-outcomes.css';

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

function percent(count: number, total: number) {
  return total ? `${Math.round((count / total) * 100)}% (${count}/${total})` : `0% (${count}/${total})`;
}

function metric(value: number | null, suffix = '') {
  return value == null ? 'Not enough data' : `${value}${suffix}`;
}

function date(value: string | null) {
  return value ? new Date(value).toLocaleDateString() : 'Not enough data';
}

function AccessibleBar({
  label,
  value,
  max = 100,
  description,
}: {
  label: string;
  value: number | null;
  max?: number;
  description: string;
}) {
  const width = value == null ? 0 : Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="pilotOutcomes-barGroup">
      <div className="pilotOutcomes-barLabel"><span>{label}</span><strong>{metric(value)}</strong></div>
      <div className="pilotOutcomes-barTrack" aria-hidden="true">
        <span className="pilotOutcomes-barFill" style={{ width: `${width}%` }} />
      </div>
      <span className="sr-only">{description}</span>
    </div>
  );
}

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
          <AccessibleBar label="Baseline" value={program.baseline.total ? (program.baseline.count / program.baseline.total) * 100 : null} description={`Baseline completion ${program.baseline.count} of ${program.baseline.total}.`} />
          <AccessibleBar label="Post" value={program.post.total ? (program.post.count / program.post.total) * 100 : null} description={`Post completion ${program.post.count} of ${program.post.total}.`} />
          <AccessibleBar label="Weekly" value={program.weeklyCompletion.rate} description={`Weekly completion ${program.weeklyCompletion.count} of ${program.weeklyCompletion.total}.`} />
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
    <div className="pilotOutcomes-detail">
      <div className="pilotOutcomes-detailHeader">
        <div><p className="pilotOutcomes-eyebrow">Program detail</p><h2>{program.programName}</h2><p>{program.programType} · {program.facilitator}</p></div>
        <button type="button" className="adminPortal-btn adminPortal-btn--ghost" onClick={onClose}>Back to portfolio</button>
      </div>
      <div className="pilotOutcomes-summaryGrid">
        <article className="pilotOutcomes-metric"><span>Students</span><strong>{program.activeStudentCount}</strong></article>
        <article className="pilotOutcomes-metric"><span>Matched</span><strong>{program.matchedCount}</strong></article>
        <article className="pilotOutcomes-metric"><span>Absolute delta</span><strong>{metric(program.absoluteDelta)}</strong></article>
        <article className="pilotOutcomes-metric"><span>Weekly completion</span><strong>{metric(program.weeklyCompletion.rate, '%')}</strong></article>
      </div>
      <OutcomeCharts program={program} />
      <DataQuality program={program} />
      <section className="pilotOutcomes-panel">
        <h3>Grade distribution</h3>
        {program.gradeDistribution.length
          ? <ul>{program.gradeDistribution.map((item) => <li key={item.grade}>{item.grade}: {item.count}</li>)}</ul>
          : <p>Not enough data.</p>}
      </section>
      <section className="pilotOutcomes-panel">
        <h3>Privacy-safe student roster</h3>
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
          <button disabled={generating} type="button" className="adminPortal-btn adminPortal-btn--ghost" onClick={() => void generate('pdf', 'inline')}>Preview report</button>
          <button disabled={generating} type="button" className="adminPortal-btn adminPortal-btn--primary" onClick={() => void generate('pdf', 'attachment')}>Download PDF</button>
          <button disabled={generating} type="button" className="adminPortal-btn adminPortal-btn--ghost" onClick={() => void generate('html', 'inline')}>HTML print view</button>
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
  const [programs, setPrograms] = useState<PilotOutcomeProgram[]>([]);
  const [selected, setSelected] = useState<PilotOutcomeProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [programType, setProgramType] = useState('all');
  const [status, setStatus] = useState('all');
  const [assessmentStatus, setAssessmentStatus] = useState('all');
  const [minimumMatched, setMinimumMatched] = useState(0);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const result = await fetchPilotOutcomes(token);
      setSummary(result.summary); setPrograms(result.programs);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Pilot outcomes could not be loaded.');
    } finally { setLoading(false); }
  }, [token]);
  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => programs.filter((program) => {
    if (programType !== 'all' && program.programType !== programType) return false;
    if (status !== 'all' && program.status !== status) return false;
    if (program.matchedCount < minimumMatched) return false;
    if (assessmentStatus === 'matched' && !program.matchedCount) return false;
    if (assessmentStatus === 'baseline-only' && !(program.baseline.count && !program.post.count)) return false;
    if (assessmentStatus === 'post-only' && !(program.post.count && !program.baseline.count)) return false;
    if (assessmentStatus === 'incomplete' && program.baseline.count === program.baseline.total && program.post.count === program.post.total) return false;
    return true;
  }), [assessmentStatus, minimumMatched, programType, programs, status]);

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
      <header className="pilotOutcomes-header"><div><p className="pilotOutcomes-eyebrow">Pilot analytics</p><h2>Pilot Outcomes</h2><p>Participation, matched growth, engagement, readiness, and reporting across every pilot.</p></div><button type="button" className="adminPortal-btn adminPortal-btn--ghost" onClick={() => void load()}>Refresh</button></header>
      {loading ? <p role="status">Loading pilot outcomes…</p> : null}
      {error ? <div className="pilotOutcomes-warning"><p>{error}</p><button type="button" className="adminPortal-btn adminPortal-btn--primary" onClick={() => void load()}>Try Again</button></div> : null}
      <SummaryCards summary={summary} />
      <section className="pilotOutcomes-panel" aria-labelledby="filters-title">
        <h3 id="filters-title">Filters</h3>
        <div className="pilotOutcomes-controls">
          <label>Program type<select value={programType} onChange={(event) => setProgramType(event.target.value)}><option value="all">All types</option>{Array.from(new Set(programs.map((program) => program.programType))).map((type) => <option key={type}>{type}</option>)}</select></label>
          <label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Active and archived</option>{Array.from(new Set(programs.map((program) => program.status))).map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Assessment status<select value={assessmentStatus} onChange={(event) => setAssessmentStatus(event.target.value)}><option value="all">All states</option><option value="matched">Matched</option><option value="baseline-only">Baseline only</option><option value="post-only">Post only</option><option value="incomplete">Incomplete</option></select></label>
          <label>Minimum matched students<input type="number" min="0" value={minimumMatched} onChange={(event) => setMinimumMatched(Number(event.target.value))} /></label>
        </div>
      </section>
      <section className="pilotOutcomes-panel" aria-labelledby="program-table-title">
        <h3 id="program-table-title">Programs</h3>
        <div className="pilotOutcomes-tableWrap">
          <table><thead><tr><th>Program</th><th>Type</th><th>Facilitator</th><th>Start</th><th>Students</th><th>Baseline</th><th>Post</th><th>Matched</th><th>Baseline avg.</th><th>Post avg.</th><th>Delta</th><th>Weekly</th><th>Certificates</th><th>Last activity</th><th>Report</th><th>Actions</th></tr></thead>
          <tbody>{filtered.map((program) => <tr key={program.id}><td>{program.programName}</td><td>{program.programType}</td><td>{program.facilitator}</td><td>{date(program.startDate)}</td><td>{program.activeStudentCount}</td><td>{percent(program.baseline.count, program.baseline.total)}</td><td>{percent(program.post.count, program.post.total)}</td><td>{program.matchedCount}</td><td>{metric(program.baselineAverage)}</td><td>{metric(program.postAverage)}</td><td>{metric(program.absoluteDelta)} / {program.percentageDeltaAvailable ? metric(program.percentageDelta, '%') : 'Unavailable'}</td><td>{metric(program.weeklyCompletion.rate, '%')}</td><td>{program.certificateCount}</td><td>{date(program.lastActivity)}</td><td>{program.reportStatus}</td><td><button type="button" onClick={() => void openProgram(program.id)}>View details</button></td></tr>)}</tbody></table>
        </div>
        {!filtered.length && !loading ? <p className="pilotOutcomes-empty">No programs match these filters.</p> : null}
      </section>
      <Rollout token={token} programs={programs} />
    </div>
  );
}
