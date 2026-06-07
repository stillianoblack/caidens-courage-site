import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  CHARACTER_IMAGE_PATHS,
  FAMILY_NEXT_STEP,
  FAMILY_OVERVIEW_KPIS,
  FAMILY_PROGRESS_ROWS,
  FAMILY_RECENT_ACTIVITY,
} from '../../../data/familyPortalContent';
import FamilyValueCards from '../FamilyValueCards';
import FocusSkillsSnapshot from '../../focus-skills/FocusSkillsSnapshot';
import '../../focus-skills/focus-skills-snapshot.css';

export default function FamilyOverviewPanel() {
  const location = useLocation();

  return (
    <div className="family-panel family-panel--overview">
      <div className="family-kpiRow">
        {FAMILY_OVERVIEW_KPIS.map((kpi) => (
          <article
            key={kpi.label}
            className={`family-kpiCard${'highlight' in kpi && kpi.highlight ? ' family-kpiCard--highlight' : ''}`}
          >
            <p className="family-kpiLabel">{kpi.label}</p>
            <p className="family-kpiValue">{kpi.value}</p>
          </article>
        ))}
      </div>

      <FamilyValueCards />

      <section className="family-panelBlock">
        <div className="family-panelBlockHead">
          <h2 className="family-panelBlockTitle">Family Progress</h2>
        </div>
        <div className="family-growthChart">
          {FAMILY_PROGRESS_ROWS.map(({ key, label, pct, tone }) => (
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
      </section>

      <FocusSkillsSnapshot className="family-overviewSkills" />

      <div className="family-overviewSplit">
        <section className="family-panelBlock">
          <div className="family-panelBlockHead">
            <h2 className="family-panelBlockTitle">Recent Activity</h2>
          </div>
          <ul className="family-activityList">
            {FAMILY_RECENT_ACTIVITY.map((item) => (
              <li key={item} className="family-activityItem">
                <span className="family-activityDot" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
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
              />
              <div>
                <h3 className="family-nextTitle">{FAMILY_NEXT_STEP.headline}</h3>
                <p className="family-nextCopy">{FAMILY_NEXT_STEP.body}</p>
              </div>
            </div>
            <Link to={FAMILY_NEXT_STEP.href} state={{ from: location.pathname }} className="family-nextCta">
              {FAMILY_NEXT_STEP.cta}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
