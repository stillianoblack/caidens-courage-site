import React from 'react';
import { Link } from 'react-router-dom';
import { FOCUS_FLAME_LAB_PATH } from '../../../config/courageRoutes';
import B4GuidePanel from '../B4GuidePanel';
import Week0ModuleCard from './Week0ModuleCard';
import { WEEK_0_HUB, WEEK_0_MODULES, type Week0ModuleId } from '../../../data/week0AssessmentContent';

type Week0HubProps = {
  completedModules: Week0ModuleId[];
  allComplete: boolean;
  onStartModule: (moduleId: Week0ModuleId) => void;
  onViewFinal: () => void;
};

export default function Week0Hub({ completedModules, allComplete, onStartModule, onViewFinal }: Week0HubProps) {
  return (
    <div className="ffl-screen ffl-screen--sceneSelect ffl-grid">
      <div className="ffl-zone-hud ffl-sceneSelectHudRail">
        <B4GuidePanel
          message="Let's see where your Focus Flame starts. Pick a check-in — there are no bad answers."
          className="ffl-gameB4 ffl-b4-panel"
        />
      </div>
      <div className="ffl-scene-select-main">
        <div className="ffl-sceneSelectTitleBlock ffl-sceneSelectTitleBlock--desktop">
          <p className="ffl-missionSelectKicker">{WEEK_0_HUB.eyebrow}</p>
          <h2 className="ffl-sceneSelectTitle">{WEEK_0_HUB.title}</h2>
          <p className="ffl-sceneSelectSubtitle">{WEEK_0_HUB.subtitle}</p>
        </div>
        <p className="ffl-week0-hubIntro">{WEEK_0_HUB.intro}</p>
        <div className="ffl-week0-moduleList">
          {WEEK_0_MODULES.map((mod) => (
            <Week0ModuleCard
              key={mod.id}
              title={mod.title}
              description={mod.description}
              questionCount={mod.questionCount}
              typeLabel={mod.typeLabel}
              complete={completedModules.includes(mod.id)}
              onStart={() => onStartModule(mod.id)}
            />
          ))}
        </div>
        {allComplete ? (
          <>
            <p className="ffl-week0-hubComplete" role="status">
              {WEEK_0_HUB.allComplete}
            </p>
            <div className="ffl-stepActions" style={{ marginTop: '1rem' }}>
              <button type="button" className="ffl-ctaPrimary" onClick={onViewFinal}>
                View baseline summary
              </button>
            </div>
          </>
        ) : null}
        <div className="ffl-stepActions" style={{ marginTop: '1.25rem' }}>
          <Link to={FOCUS_FLAME_LAB_PATH} className="ffl-nav-button">
            ← Back to Focus Flame Lab
          </Link>
        </div>
      </div>
    </div>
  );
}
