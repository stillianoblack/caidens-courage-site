import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  CHARACTER_IMAGE_PATHS,
  FAMILY_NEXT_STEP,
} from '../../../data/familyPortalContent';
import { useFamilyDashboardMetrics } from '../../../hooks/useFamilyDashboardMetrics';
import { readActivePilotProgram } from '../../../config/activePilotProgram';
import { resolvePortalKidsBasePath } from '../../../lib/portalGamePaths';
import FamilyAccessCodeCard from '../FamilyAccessCodeCard';
import FamilyChildrenSection from '../FamilyChildrenSection';
import FamilyValueCards from '../FamilyValueCards';
import FocusSkillsSnapshot from '../../focus-skills/FocusSkillsSnapshot';
import '../../focus-skills/focus-skills-snapshot.css';

export default function FamilyOverviewPanel() {
  const location = useLocation();
  const programCode = readActivePilotProgram()?.programCode;
  const { children, metrics, assessmentCount, loading } = useFamilyDashboardMetrics(programCode);
  const nextStepHref = `${resolvePortalKidsBasePath(location.pathname)}${FAMILY_NEXT_STEP.hrefPath}`;

  const overallPct = metrics.rows.find((row) => row.tone === 'overall')?.pct ?? 0;

  const kpis = useMemo(
    () => [
      {
        label: 'Children',
        value: loading ? '—' : String(children.length),
      },
      {
        label: 'Assessments',
        value: loading ? '—' : String(assessmentCount),
      },
      {
        label: 'Overall Progress',
        value: loading ? '—' : metrics.hasActivity ? `${overallPct}%` : '0%',
      },
      {
        label: 'Status',
        value: loading ? '—' : metrics.overallLabel,
        highlight: true as const,
      },
    ],
    [assessmentCount, children.length, loading, metrics.hasActivity, metrics.overallLabel, overallPct],
  );

  return (
    <div className="family-panel family-panel--overview">
      <div className="family-kpiRow">
        {kpis.map((kpi) => (
          <article
            key={kpi.label}
            className={`family-kpiCard${'highlight' in kpi && kpi.highlight ? ' family-kpiCard--highlight' : ''}`}
          >
            <p className="family-kpiLabel">{kpi.label}</p>
            <p className="family-kpiValue">{kpi.value}</p>
          </article>
        ))}
      </div>

      <FamilyAccessCodeCard />

      <FamilyValueCards />

      <FamilyChildrenSection childSummaries={children} loading={loading} />

      <section className="family-panelBlock">
        <div className="family-panelBlockHead">
          <h2 className="family-panelBlockTitle">Family Progress</h2>
        </div>
        {loading ? (
          <div className="family-progressSkeleton" aria-busy="true" aria-label="Loading progress">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="family-skeletonBar" />
            ))}
          </div>
        ) : null}
        {!loading && !metrics.hasActivity ? (
          <p className="family-panelHelper">
            Progress will appear here after your family completes activities.
          </p>
        ) : null}
        {!loading ? (
        <div className="family-growthChart">
          {metrics.rows.map(({ key, label, pct, tone }) => (
            <div key={key} className="family-growthRow">
              <div className="family-growthMeta">
                <span className="family-growthLabel">{label}</span>
                <span className="family-growthPct">{pct}%</span>
              </div>
              <div className="family-growthTrack" aria-hidden="true">
                <div
                  className={`family-growthFill family-growthFill--${tone}`}
                  style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        ) : null}
      </section>

      <FocusSkillsSnapshot
        className="family-overviewSkills"
        skills={metrics.focusSkills}
        hasActivity={metrics.hasActivity}
      />

      <div className="family-overviewSplit">
        <section className="family-panelBlock">
          <div className="family-panelBlockHead">
            <h2 className="family-panelBlockTitle">Recent Activity</h2>
          </div>
          {metrics.recentActivity.length > 0 ? (
            <ul className="family-activityList">
              {metrics.recentActivity.map((item) => (
                <li key={item} className="family-activityItem">
                  <span className="family-activityDot" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="family-panelHelper">
              Completed games and check-ins will show up here.
            </p>
          )}
        </section>

        <section className="family-panelBlock family-nextStepCard family-charCard--caiden">
          <div className="family-charCardStrip" aria-hidden="true" />
          <div className="family-panelBlockHead">
            <h2 className="family-panelBlockTitle">Next Recommended Step</h2>
          </div>
          <div className="family-nextCard">
            <div className="family-nextStepHero">
              <img
                src={CHARACTER_IMAGE_PATHS.caiden ?? undefined}
                alt=""
                className="family-charCardAvatar family-charCardAvatar--sm family-charCardAvatar--caiden"
                width={72}
                height={72}
                loading="lazy"
                decoding="async"
              />
              <div>
                <h3 className="family-nextTitle">{FAMILY_NEXT_STEP.headline}</h3>
                <p className="family-nextCopy">{FAMILY_NEXT_STEP.body}</p>
              </div>
            </div>
            <Link to={nextStepHref} state={{ from: location.pathname }} className="family-nextCta">
              {FAMILY_NEXT_STEP.cta}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
