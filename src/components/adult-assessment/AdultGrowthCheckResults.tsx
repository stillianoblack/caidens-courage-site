import React from 'react';
import AppLink from '../shared/AppLink';
import {
  ADULT_BASELINE_RESULTS,
  ADULT_GROWTH_RESULTS,
  ADULT_ASSESSMENT_TOTAL_QUESTIONS,
  ADULT_UNDERSTANDING_QUESTION_COUNT,
  ADULT_SUPPORT_QUESTION_COUNT,
} from '../../data/adultGrowthCheckContent';
import { trackDownload } from '../../lib/analytics';
import type { AdultAssessmentRecord } from '../../lib/adultAssessmentStorage';

type AdultGrowthCheckResultsProps = {
  record: AdultAssessmentRecord;
  syncMessage?: string | null;
  drVictoriaTrainingHref?: string;
  returnHref: string;
  continueLearningHref?: string;
  certificateHref?: string;
  onContinueToTraining?: () => void;
  onReturn?: () => void;
  onContinueLearning?: () => void;
  onDownloadCertificate?: () => void;
};

export default function AdultGrowthCheckResults({
  record,
  syncMessage,
  drVictoriaTrainingHref,
  returnHref,
  continueLearningHref,
  certificateHref = '/downloads/Certificates/focus-flame-certificate.pdf',
  onContinueToTraining,
  onReturn,
  onContinueLearning,
  onDownloadCertificate,
}: AdultGrowthCheckResultsProps) {
  const isBaseline = record.phase === 'baseline';
  const baselineTotal = record.baselineTotalScore ?? 0;
  const growthTotal = record.totalScore;
  const totalDelta = growthTotal - baselineTotal;
  const understandingDelta =
    record.understandingScore - (record.baselineUnderstandingScore ?? 0);
  const supportDelta = record.supportScore - (record.baselineSupportScore ?? 0);

  return (
    <div className="bbc-resultPanel bbc-resultPanel--detailed">
      <h2 className="bbc-title">
        {isBaseline ? ADULT_BASELINE_RESULTS.title : ADULT_GROWTH_RESULTS.title}
      </h2>

      {isBaseline ? (
        <>
          <div className="bbc-scoreGrid" role="list">
            <div role="listitem" className="bbc-scoreCard bbc-scoreCard--visible">
              <p className="bbc-scoreLabel">Understanding Score</p>
              <p className="bbc-scoreValue">
                {record.understandingScore}
                <span className="bbc-scoreMax"> / {ADULT_UNDERSTANDING_QUESTION_COUNT}</span>
              </p>
            </div>
            <div role="listitem" className="bbc-scoreCard bbc-scoreCard--visible">
              <p className="bbc-scoreLabel">Support Score</p>
              <p className="bbc-scoreValue">
                {record.supportScore}
                <span className="bbc-scoreMax"> / {ADULT_SUPPORT_QUESTION_COUNT}</span>
              </p>
            </div>
            <div role="listitem" className="bbc-scoreCard bbc-scoreCard--visible">
              <p className="bbc-scoreLabel">Overall Score</p>
              <p className="bbc-scoreValue">
                {record.totalScore}
                <span className="bbc-scoreMax"> / {ADULT_ASSESSMENT_TOTAL_QUESTIONS}</span>
              </p>
            </div>
          </div>
          <p className="bbc-body">{ADULT_BASELINE_RESULTS.copy}</p>
          <div className="bbc-finalBadge" role="status">
            ✦ {ADULT_BASELINE_RESULTS.badge}
          </div>
          <div className="bbc-resultActions">
            {drVictoriaTrainingHref ? (
              <AppLink href={drVictoriaTrainingHref} className="bbc-primaryBtn" onClick={onContinueToTraining}>
                Continue to Dr. Victoria Training
              </AppLink>
            ) : null}
            <AppLink href={returnHref} className="bbc-secondaryBtn" onClick={onReturn}>
              Return to Assessments
            </AppLink>
          </div>
        </>
      ) : (
        <>
          <div className="bbc-scoreGrid" role="list">
            <div role="listitem" className="bbc-scoreCard bbc-scoreCard--visible">
              <p className="bbc-scoreLabel">Baseline Overall</p>
              <p className="bbc-scoreValue">
                {baselineTotal}
                <span className="bbc-scoreMax"> / {ADULT_ASSESSMENT_TOTAL_QUESTIONS}</span>
              </p>
            </div>
            <div role="listitem" className="bbc-scoreCard bbc-scoreCard--visible">
              <p className="bbc-scoreLabel">Growth Overall</p>
              <p className="bbc-scoreValue">
                {growthTotal}
                <span className="bbc-scoreMax"> / {ADULT_ASSESSMENT_TOTAL_QUESTIONS}</span>
              </p>
            </div>
            <div role="listitem" className="bbc-scoreCard bbc-scoreCard--visible">
              <p className="bbc-scoreLabel">Growth</p>
              <p className="bbc-scoreValue">
                {totalDelta >= 0 ? `+${totalDelta}` : totalDelta}
                <span className="bbc-scoreMax"> points</span>
              </p>
            </div>
          </div>

          <div className="bbc-growthDeltaGrid">
            <p className="bbc-resultMeta">
              <strong>Understanding Growth:</strong>{' '}
              {understandingDelta >= 0 ? `+${understandingDelta}` : understandingDelta}
            </p>
            <p className="bbc-resultMeta">
              <strong>Support Growth:</strong>{' '}
              {supportDelta >= 0 ? `+${supportDelta}` : supportDelta}
            </p>
          </div>

          <div className="bbc-finalBadge" role="status">
            ✦ {ADULT_GROWTH_RESULTS.badge}
          </div>

          <div className="bbc-resultActions">
            <a
              href={certificateHref}
              className="bbc-primaryBtn"
              download="focus-flame-certificate.pdf"
              onClick={() => {
                trackDownload('certificate_downloaded', 'Focus Flame Certificate', 'certificate');
                onDownloadCertificate?.();
              }}
            >
              Download Certificate
            </a>
            {continueLearningHref ? (
              <AppLink href={continueLearningHref} className="bbc-secondaryBtn" onClick={onContinueLearning}>
                Continue Learning
              </AppLink>
            ) : null}
            <AppLink href={returnHref} className="bbc-secondaryBtn" onClick={onReturn}>
              Return to Assessments
            </AppLink>
          </div>
        </>
      )}

      {syncMessage ? (
        <p className="bbc-deviceNote" role="status">
          {syncMessage}
        </p>
      ) : null}
    </div>
  );
}
