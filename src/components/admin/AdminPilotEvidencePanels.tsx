import React from 'react';
import type { PilotImpactDomain, PilotLiveLearningCard, PilotOutcomeProgram } from '../../types/pilotOutcomes';
import { isGrowthPending } from '../../lib/buildProgramHealthModel';
import {
  formatPercentage,
  formatPoints,
  missingImpactStatus,
} from '../../lib/pilotOutcomesPresentation';
import './admin-program-health-visual.css';

function evidenceLabel(type: string): string {
  if (type === 'operational') return 'Operational';
  if (type === 'directional') return 'Directional';
  return 'Verified';
}

function EvidenceCircleCard({
  title,
  center,
  status,
  detail,
  evidenceType,
  participation = false,
  details,
}: {
  title: string;
  center: React.ReactNode;
  status: string;
  detail: string;
  evidenceType: string;
  participation?: boolean;
  details: React.ReactNode;
}) {
  return (
    <article className={`phVisual-impact${participation ? ' phVisual-impact--participation' : ''}`}>
      <p className="phVisual-evidenceBadge">{evidenceLabel(evidenceType)}</p>
      <h3>{title}</h3>
      <div className="phVisual-impactCircle" role="img" aria-label={`${title}. ${status}. ${detail}`}>
        <strong>{center}</strong>
      </div>
      <p className="phVisual-impactStatus">{status}</p>
      <p className="phVisual-impactDetail">{detail}</p>
      <details className="phVisual-calcDetails">
        <summary>View calculation details</summary>
        {details}
      </details>
    </article>
  );
}

function LiveCardDetails({ card }: { card: PilotLiveLearningCard }) {
  const d = card.details;
  return (
    <dl className="phVisual-detailList">
      <div><dt>Source</dt><dd>{d.source}</dd></div>
      <div><dt>Numerator</dt><dd>{d.numerator ?? '—'}</dd></div>
      <div><dt>Denominator</dt><dd>{d.denominator ?? '—'}</dd></div>
      <div><dt>Included students</dt><dd>{d.includedStudents ?? '—'}</dd></div>
      <div><dt>Excluded students</dt><dd>{d.excludedStudents ?? '—'}</dd></div>
      <div><dt>Data sufficiency</dt><dd>{d.dataSufficiencyRule}</dd></div>
      <div><dt>Last calculated</dt><dd>{new Date(d.lastCalculatedAt).toLocaleString()}</dd></div>
      {'studentsWithActivity' in d && d.studentsWithActivity != null ? (
        <div><dt>Students with activity</dt><dd>{d.studentsWithActivity}</dd></div>
      ) : null}
      {'missionsCompleted' in d && d.missionsCompleted != null ? (
        <div><dt>Missions completed</dt><dd>{d.missionsCompleted}</dd></div>
      ) : null}
      {'questionsAnswered' in d && d.questionsAnswered != null ? (
        <div><dt>Questions answered</dt><dd>{d.questionsAnswered}</dd></div>
      ) : null}
      {'correctAnswers' in d && d.correctAnswers != null ? (
        <div><dt>Correct answers</dt><dd>{d.correctAnswers}</dd></div>
      ) : null}
      {'trendNote' in d && d.trendNote ? (
        <div><dt>Trend</dt><dd>{d.trendNote}</dd></div>
      ) : null}
      {'skillAreasObserved' in d && Array.isArray(d.skillAreasObserved) && d.skillAreasObserved.length ? (
        <div><dt>Skill areas observed</dt><dd>{d.skillAreasObserved.join(', ')}</dd></div>
      ) : null}
    </dl>
  );
}

export function LiveLearningSignalsPanel({ program }: { program: PilotOutcomeProgram }) {
  const snapshot = program.liveLearningSnapshot;
  if (!snapshot) {
    return (
      <section className="phVisual-panel">
        <h2>Live Learning Signals</h2>
        <p className="phVisual-meta">Live signal payload is not available for this program yet.</p>
      </section>
    );
  }

  return (
    <section className="phVisual-panel" aria-labelledby="live-learning-title">
      <p className="phVisual-eyebrow">Live Learning Signals</p>
      <h2 id="live-learning-title">Live Student Progress</h2>
      <p className="phVisual-meta">{snapshot.subtitle}</p>
      <p className="phVisual-evidenceGuide">
        <strong>Operational</strong> — {snapshot.evidenceGuide.operational}{' '}
        <strong>Directional</strong> — {snapshot.evidenceGuide.directional}
      </p>
      <div className="phVisual-snapshot">
        {snapshot.cards.map((card) => (
          <EvidenceCircleCard
            key={card.key}
            title={card.label}
            center={card.centerValue}
            status={card.statusLabel}
            detail={card.summary}
            evidenceType={card.evidenceType}
            participation={card.key === 'participation'}
            details={<LiveCardDetails card={card} />}
          />
        ))}
      </div>
    </section>
  );
}

function verifiedCenter(domain: PilotImpactDomain, growthPending: boolean) {
  if (domain.deltaPercentagePoints != null) return formatPoints(domain.deltaPercentagePoints);
  if (growthPending && domain.baselineNumerator > 0) {
    return (
      <>
        Verified
        <br />
        growth pending
      </>
    );
  }
  return 'Not enough data';
}

function VerifiedDomainDetails({ domain }: { domain: PilotImpactDomain }) {
  return (
    <dl className="phVisual-detailList">
      <div><dt>Source</dt><dd>{domain.source}</dd></div>
      <div><dt>Baseline</dt><dd>{formatPercentage(domain.baselinePercentage, 'Awaiting data')} ({domain.baselineNumerator}/{domain.baselineDenominator})</dd></div>
      <div><dt>Post</dt><dd>{formatPercentage(domain.postPercentage, 'Awaiting data')} ({domain.postNumerator}/{domain.postDenominator})</dd></div>
      <div><dt>Matched students</dt><dd>{domain.matchedStudentCount}</dd></div>
      <div><dt>Excluded students</dt><dd>{domain.excludedRecordCount}</dd></div>
      <div><dt>Data quality</dt><dd>{domain.dataQualityStatus}</dd></div>
    </dl>
  );
}

export function VerifiedGrowthPanel({ program }: { program: PilotOutcomeProgram }) {
  const snapshot = program.verifiedGrowthSnapshot || program.impactSnapshot;
  const growthPending = isGrowthPending(program);
  const overall = snapshot.overallMatchedGrowth;

  return (
    <section className="phVisual-panel" aria-labelledby="verified-growth-title">
      <p className="phVisual-eyebrow">Pilot Impact · matched assessments</p>
      <h2 id="verified-growth-title">Verified Outcomes</h2>
      <p className="phVisual-meta">Confirmed change based on matched baseline and post-assessments.</p>
      {growthPending ? (
        <p className="phVisual-notice" role="status">
          Live learning signals are available above. Verified growth will appear after matched post-assessments are recorded.
        </p>
      ) : null}
      <div className="phVisual-snapshot">
        {snapshot.domains.map((domain) => (
          <EvidenceCircleCard
            key={domain.key}
            title={`${domain.label.replace(' growth', '')} verified growth`}
            center={verifiedCenter(domain, growthPending)}
            status={
              domain.deltaPercentagePoints != null
                ? domain.displayStatus
                : growthPending && domain.baselineNumerator > 0
                  ? 'Verified growth pending'
                  : missingImpactStatus('domain')
            }
            detail={
              domain.deltaPercentagePoints != null
                ? `${formatPoints(domain.deltaPercentagePoints)} from matched baseline and post scores.`
                : growthPending && domain.baselineNumerator > 0
                  ? `${domain.baselineNumerator} baseline assessments recorded; matched post scores are not complete.`
                  : domain.missingReason || 'Awaiting matched assessment data.'
            }
            evidenceType="verified"
            details={<VerifiedDomainDetails domain={domain} />}
          />
        ))}
        <EvidenceCircleCard
          title="Overall matched growth"
          center={
            overall.deltaPercentagePoints != null
              ? formatPoints(overall.deltaPercentagePoints)
              : growthPending
                ? <>Verified<br />growth pending</>
                : formatPoints(overall.deltaPercentagePoints)
          }
          status={
            overall.deltaPercentagePoints != null
              ? overall.displayStatus
              : growthPending
                ? 'Verified growth pending'
                : missingImpactStatus('overall')
          }
          detail={
            overall.deltaPercentagePoints != null
              ? `${overall.includedDomainCount} of ${overall.totalDomainCount} domains included. ${overall.weighting}.`
              : overall.missingReason || 'Awaiting matched post data.'
          }
          evidenceType="verified"
          details={(
            <dl className="phVisual-detailList">
              <div><dt>Included domains</dt><dd>{overall.includedDomainCount} of {overall.totalDomainCount}</dd></div>
              <div><dt>Matched sample</dt><dd>{overall.matchedStudentCount}</dd></div>
              <div><dt>Weighting</dt><dd>{overall.weighting}</dd></div>
              <div><dt>Data quality</dt><dd>{overall.dataQualityStatus}</dd></div>
            </dl>
          )}
        />
      </div>
    </section>
  );
}

export function ProgramDetailSummary({ program }: { program: PilotOutcomeProgram }) {
  return (
    <section className="phVisual-panel" aria-labelledby="program-detail-summary">
      <p className="phVisual-eyebrow">Program detail summary</p>
      <h2 id="program-detail-summary">{program.programName}</h2>
      <div className="phVisual-health">
        <article className="phVisual-healthCard"><strong>{program.activeStudentCount}</strong><span>Students</span></article>
        <article className="phVisual-healthCard"><strong>{program.baseline.count}</strong><span>Baseline</span></article>
        <article className="phVisual-healthCard"><strong>{program.post.count}</strong><span>Post</span></article>
        <article className="phVisual-healthCard"><strong>{formatPercentage(program.impactSnapshot.participation.percentage)}</strong><span>Participation</span></article>
      </div>
    </section>
  );
}
