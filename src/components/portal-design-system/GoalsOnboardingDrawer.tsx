import React, { useEffect, useState } from 'react';
import {
  getProgramGoalOptions,
  getProgramGoalsCopy,
  type ProgramGoalsPortalType,
} from '../../data/programGoalsOptions';
import type { ProgramGoalsRecord } from '../../lib/programGoalsService';
import SlideOutDrawer from './SlideOutDrawer';
import { useToast } from './ToastProvider';
import './portal-design-system.css';

type GoalsOnboardingDrawerProps = {
  open: boolean;
  onClose: () => void;
  portalType: ProgramGoalsPortalType;
  programCode: string;
  initialRecord?: ProgramGoalsRecord | null;
  onSave: (selectedGoals: string[]) => Promise<void>;
  onRemindLater: () => Promise<void>;
  onSkip: () => Promise<void>;
};

export default function GoalsOnboardingDrawer({
  open,
  onClose,
  portalType,
  programCode,
  initialRecord,
  onSave,
  onRemindLater,
  onSkip,
}: GoalsOnboardingDrawerProps) {
  const { showToast } = useToast();
  const copy = getProgramGoalsCopy(portalType);
  const options = getProgramGoalOptions(portalType);
  const [selected, setSelected] = useState<string[]>(initialRecord?.selected_goals ?? []);
  const [saving, setSaving] = useState(false);
  const [limitHint, setLimitHint] = useState(false);

  useEffect(() => {
    if (open) {
      setSelected(initialRecord?.selected_goals ?? []);
      setLimitHint(false);
    }
  }, [open, initialRecord?.selected_goals]);

  const toggleGoal = (goal: string) => {
    setSelected((prev) => {
      if (prev.includes(goal)) {
        setLimitHint(false);
        return prev.filter((item) => item !== goal);
      }
      if (prev.length >= copy.maxGoals) {
        setLimitHint(true);
        return prev;
      }
      setLimitHint(false);
      return [...prev, goal];
    });
  };

  const handleSave = async () => {
    if (selected.length === 0) return;
    setSaving(true);
    try {
      await onSave(selected);
      showToast('Nice — your program goals are saved.', 'success');
    } finally {
      setSaving(false);
    }
  };

  const handleRemindLater = async () => {
    await onRemindLater();
    showToast("Okay — I'll remind you tomorrow.", 'info');
  };

  const handleSkip = async () => {
    await onSkip();
    const skipMessage =
      portalType === 'family'
        ? 'No worries — you can set family goals anytime from the header.'
        : 'No worries — you can set goals anytime from Program Settings.';
    showToast(skipMessage, 'info');
  };

  const handleDismiss = () => {
    onClose();
    const dismissMessage =
      portalType === 'family'
        ? 'Okay — you can set goals anytime from Family Goals.'
        : 'Okay — you can set goals anytime from Program Goals.';
    showToast(dismissMessage, 'info');
  };

  return (
    <SlideOutDrawer
      open={open}
      onClose={handleDismiss}
      className="pilot-drawer pilot-drawer--settings ds-goalsDrawer"
      titleId="program-goals-drawer-title"
    >
      <div className="ds-goalsDrawerHead">
        <div className="ds-goalsDrawerHeadText">
          <h2 id="program-goals-drawer-title" className="ds-goalsDrawerTitle">
            {copy.title}
          </h2>
          <p className="ds-goalsDrawerSubtext">{copy.subtext}</p>
        </div>
        <button type="button" className="ds-goalsDrawerClose" onClick={handleDismiss} aria-label="Close">
          ×
        </button>
      </div>

      <div className="ds-goalsDrawerBody">
        <p className="ds-goalsLimitNote">
          Choose up to {copy.maxGoals} ({selected.length}/{copy.maxGoals} selected)
        </p>
        {limitHint ? (
          <p className="ds-goalsLimitHint" role="alert">
            Choose up to {copy.maxGoals} goals.
          </p>
        ) : null}
        <div className="ds-goalsGrid" role="group" aria-label="Program goals">
          {options.map((goal) => {
            const isSelected = selected.includes(goal);
            return (
              <label
                key={goal}
                className={`ds-goalsOption${isSelected ? ' ds-goalsOption--selected' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleGoal(goal)}
                />
                <span>{goal}</span>
              </label>
            );
          })}
        </div>
        {programCode ? (
          <p className="ds-goalsProgramNote">Saved for program: {programCode}</p>
        ) : null}
      </div>

      <footer className="ds-goalsFooter">
        <button
          type="button"
          className="ds-goalsBtnPrimary"
          disabled={selected.length === 0 || saving}
          onClick={() => void handleSave()}
        >
          {saving ? 'Saving…' : 'Save Goals'}
        </button>
        <button
          type="button"
          className="ds-goalsBtnSecondary"
          onClick={() => void handleRemindLater()}
        >
          Remind Me Later
        </button>
        <button type="button" className="ds-goalsBtnGhost" onClick={() => void handleSkip()}>
          Skip for Now
        </button>
      </footer>
    </SlideOutDrawer>
  );
}
