import React from 'react';
import { B4Avatar } from './B4BaselineTopBar';
import { B4_BASELINE_LANDING, B4_BASELINE_MODULES, type BaselineModuleId } from '../../data/b4BaselineCheckContent';

const MODULE_ICONS: Record<BaselineModuleId, string> = {
  feelings: '🔥',
  reading: '📖',
  'focus-moves': '⚡',
};

type B4BaselineHubProps = {
  completedModules: BaselineModuleId[];
  allComplete: boolean;
  onStartModule: (moduleId: BaselineModuleId) => void;
  onViewResults: () => void;
};

export default function B4BaselineHub({
  completedModules,
  allComplete,
  onStartModule,
  onViewResults,
}: B4BaselineHubProps) {
  return (
    <div className="bbc-hub">
      <div className="bbc-hubHero">
        <B4Avatar size="hub" />
        <div className="bbc-hubHeroText">
          <p className="bbc-eyebrow">{B4_BASELINE_LANDING.eyebrow}</p>
          <h1 className="bbc-title bbc-title--hub">{B4_BASELINE_LANDING.title}</h1>
          <p className="bbc-subtitle">{B4_BASELINE_LANDING.subtitle}</p>
        </div>
      </div>
      <p className="bbc-hubIntro">{B4_BASELINE_LANDING.body}</p>
      <div className="bbc-moduleList bbc-moduleList--horizontal">
        {B4_BASELINE_MODULES.map((mod) => {
          const done = completedModules.includes(mod.id);
          return (
            <button
              key={mod.id}
              type="button"
              className={`bbc-moduleCard bbc-moduleSelector${done ? ' bbc-moduleCard--done' : ''}`}
              onClick={() => onStartModule(mod.id)}
            >
              <span className="bbc-moduleCard-icon" aria-hidden="true">
                {MODULE_ICONS[mod.id]}
              </span>
              <span className="bbc-moduleCard-body">
                <span className="bbc-moduleCard-head">
                  <span className="bbc-moduleCard-title">{mod.title}</span>
                  {done ? (
                    <span className="bbc-moduleCheck" aria-label="Completed">
                      ✓
                    </span>
                  ) : null}
                </span>
                <span className="bbc-moduleCard-meta">{mod.questionCount} questions</span>
                <span className="bbc-moduleCard-desc">{mod.description}</span>
              </span>
            </button>
          );
        })}
      </div>
      {allComplete ? (
        <>
          <p className="bbc-hubComplete" role="status">
            All modules complete! View your baseline summary.
          </p>
          <div className="bbc-hubActions">
            <button type="button" className="bbc-primaryBtn" onClick={onViewResults}>
              View Baseline Results
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
