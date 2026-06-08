import React from 'react';
import { Link } from 'react-router-dom';
import { ADULT_GROWTH_RESULTS } from '../../data/adultGrowthCheckContent';
import type { AdultLearningStatus } from '../../hooks/useAdultLearningStatus';
import '../family-portal/weekly-adventures-unlock-card.css';

export type AdultLearningBannerPlacement = 'parent' | 'facilitator' | 'weekly-modules';

type AdultLearningStatusBannerProps = {
  placement: AdultLearningBannerPlacement;
  status: AdultLearningStatus;
};

const CERTIFICATE_HREF = '/downloads/Certificates/focus-flame-certificate.pdf';

export default function AdultLearningStatusBanner({
  placement,
  status,
}: AdultLearningStatusBannerProps) {
  const {
    bannerVariant,
    baselineHref,
    growthHref,
    drVictoriaHref,
    uncleTHref,
    drVictoriaComplete,
    uncleTComplete,
    baselineRecord,
    growthRecord,
  } = status;

  if (bannerVariant === 'unlock') {
    const isParent = placement === 'parent';
    const isWeeklyModules = placement === 'weekly-modules';

    return (
      <section
        className="weeklyAdventuresUnlockCard"
        aria-labelledby="adult-learning-unlock-title"
      >
        <div className="weeklyAdventuresUnlockCardBody">
          <p className="weeklyAdventuresUnlockCardEyebrow">Focus Flame Academy</p>
          <h2 id="adult-learning-unlock-title" className="weeklyAdventuresUnlockCardTitle">
            {isParent ? 'Unlock Parent Resources' : 'Unlock Adult Training'}
          </h2>
          <p className="weeklyAdventuresUnlockCardCopy">
            {isParent
              ? 'Complete a quick reflection check to unlock Dr. Victoria and Uncle T learning activities. You\u2019ll also receive a growth certificate after completing the program.'
              : isWeeklyModules
                ? 'Complete a quick reflection check to unlock Dr. Victoria and Uncle T learning modules and track your growth throughout the program.'
                : 'Complete a quick reflection check to unlock Dr. Victoria and Uncle T training modules. This helps measure growth before and after the program.'}
          </p>
          <Link to={baselineHref} className="weeklyAdventuresUnlockCardBtn">
            Start Adult Check-In
          </Link>
          <p className="weeklyAdventuresUnlockCardNote">Takes about 3–5 minutes.</p>
        </div>
      </section>
    );
  }

  if (bannerVariant === 'unlocked') {
    const isWeeklyModules = placement === 'weekly-modules';

    if (isWeeklyModules) {
      return (
        <section
          className="weeklyAdventuresUnlockCard weeklyAdventuresUnlockCard--unlocked"
          aria-labelledby="adult-learning-unlocked-title"
        >
          <div className="weeklyAdventuresUnlockCardBody">
            <p className="weeklyAdventuresUnlockCardEyebrow">Adult Learning Unlocked</p>
            <h2 id="adult-learning-unlocked-title" className="weeklyAdventuresUnlockCardTitle">
              Your Adult Learning Path is Ready
            </h2>
            <p className="weeklyAdventuresUnlockCardCopy">
              Complete Dr. Victoria and Uncle T training modules to strengthen your understanding
              and support strategies.
            </p>
            <div className="weeklyAdventuresUnlockCardProgress">
              <p className="weeklyAdventuresUnlockCardProgressLabel">Progress</p>
              <ul className="weeklyAdventuresUnlockCardProgressList">
                <li className="weeklyAdventuresUnlockCardProgressItem weeklyAdventuresUnlockCardProgressItem--done">
                  ✓ Adult Baseline Complete
                </li>
              </ul>
            </div>
            <div className="weeklyAdventuresUnlockCardActions">
              <Link to={drVictoriaHref} className="weeklyAdventuresUnlockCardBtn">
                Open Dr. Victoria Training
              </Link>
              <Link to={uncleTHref} className="weeklyAdventuresUnlockCardBtnSecondary">
                Open Uncle T Training
              </Link>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section
        className="weeklyAdventuresUnlockCard weeklyAdventuresUnlockCard--unlocked"
        aria-labelledby="adult-learning-unlocked-title"
      >
        <div className="weeklyAdventuresUnlockCardBody">
          <p className="weeklyAdventuresUnlockCardEyebrow">Adult Learning</p>
          <h2 id="adult-learning-unlocked-title" className="weeklyAdventuresUnlockCardTitle">
            Adult Learning Unlocked
          </h2>
          <p className="weeklyAdventuresUnlockCardCopy">
            Great work. Your learning modules are now available.
          </p>
          <div className="weeklyAdventuresUnlockCardProgress">
            <p className="weeklyAdventuresUnlockCardProgressLabel">Progress</p>
            <ul className="weeklyAdventuresUnlockCardProgressList">
              <li className="weeklyAdventuresUnlockCardProgressItem weeklyAdventuresUnlockCardProgressItem--done">
                Baseline Complete ✓
              </li>
              <li
                className={`weeklyAdventuresUnlockCardProgressItem${
                  drVictoriaComplete ? ' weeklyAdventuresUnlockCardProgressItem--done' : ''
                }`}
              >
                Dr. Victoria{drVictoriaComplete ? ' ✓' : ''}
              </li>
              <li
                className={`weeklyAdventuresUnlockCardProgressItem${
                  uncleTComplete ? ' weeklyAdventuresUnlockCardProgressItem--done' : ''
                }`}
              >
                Uncle T{uncleTComplete ? ' ✓' : ''}
              </li>
            </ul>
          </div>
        </div>
      </section>
    );
  }

  if (bannerVariant === 'ready-for-growth') {
    const isWeeklyModules = placement === 'weekly-modules';

    return (
      <section
        className="weeklyAdventuresUnlockCard weeklyAdventuresUnlockCard--ready"
        aria-labelledby="adult-learning-ready-title"
      >
        <div className="weeklyAdventuresUnlockCardBody">
          <p className="weeklyAdventuresUnlockCardEyebrow">
            {isWeeklyModules ? 'Ready for Growth Check' : 'Growth Check'}
          </p>
          <h2 id="adult-learning-ready-title" className="weeklyAdventuresUnlockCardTitle">
            {isWeeklyModules ? 'Measure Your Growth' : 'Ready for Your Growth Check'}
          </h2>
          <p className="weeklyAdventuresUnlockCardCopy">
            {isWeeklyModules
              ? 'You have completed both training modules. Take the Growth Assessment to compare your results.'
              : 'You\u2019ve completed both learning modules. Take the Growth Assessment to see how your understanding has improved.'}
          </p>
          <Link to={growthHref} className="weeklyAdventuresUnlockCardBtn">
            {isWeeklyModules ? 'Start Growth Assessment' : 'Start Growth Check'}
          </Link>
        </div>
      </section>
    );
  }

  const baselineScore = growthRecord?.baselineTotalScore ?? baselineRecord?.totalScore ?? 0;
  const growthScore = growthRecord?.totalScore ?? 0;
  const totalQuestions = growthRecord?.totalQuestions ?? baselineRecord?.totalQuestions ?? 12;
  const improvement = growthScore - baselineScore;

  return (
    <section
      className="weeklyAdventuresUnlockCard weeklyAdventuresUnlockCard--complete"
      aria-labelledby="adult-learning-complete-title"
    >
      <div className="weeklyAdventuresUnlockCardBody">
        <p className="weeklyAdventuresUnlockCardEyebrow">Growth Journey</p>
        <h2 id="adult-learning-complete-title" className="weeklyAdventuresUnlockCardTitle">
          Growth Journey Complete
        </h2>

        <div className="weeklyAdventuresUnlockCardScores" role="list">
          <div role="listitem" className="weeklyAdventuresUnlockCardScore">
            <p className="weeklyAdventuresUnlockCardScoreLabel">Baseline</p>
            <p className="weeklyAdventuresUnlockCardScoreValue">
              {baselineScore} / {totalQuestions}
            </p>
          </div>
          <div role="listitem" className="weeklyAdventuresUnlockCardScore">
            <p className="weeklyAdventuresUnlockCardScoreLabel">Growth</p>
            <p className="weeklyAdventuresUnlockCardScoreValue">
              {growthScore} / {totalQuestions}
            </p>
          </div>
          <div role="listitem" className="weeklyAdventuresUnlockCardScore">
            <p className="weeklyAdventuresUnlockCardScoreLabel">Growth</p>
            <p className="weeklyAdventuresUnlockCardScoreValue weeklyAdventuresUnlockCardScoreValue--delta">
              {improvement >= 0 ? `+${improvement}` : improvement}
            </p>
          </div>
        </div>

        <div className="weeklyAdventuresUnlockCardBadge" role="status">
          ✦ {ADULT_GROWTH_RESULTS.badge}
        </div>

        <div className="weeklyAdventuresUnlockCardActions">
          <a
            href={CERTIFICATE_HREF}
            className="weeklyAdventuresUnlockCardBtn"
            download="focus-flame-certificate.pdf"
          >
            Download Certificate
          </a>
          <Link to={growthHref} className="weeklyAdventuresUnlockCardBtnSecondary">
            Retake Growth Check
          </Link>
        </div>
      </div>
    </section>
  );
}
