import React, { useEffect, useState } from 'react';
import { readActivePilotProgram } from '../../config/activePilotProgram';
import { resolveFamilyPortalDisplayName } from '../../lib/familyPortalDisplayName';
import { updateProgramDisplayNameByCode } from '../../lib/familyProgramDisplayNameService';
import { isIndependentFamilyProgram } from '../../lib/independentFamilyProgram';
import { useToast } from '../portal-design-system/ToastProvider';
import SettingsCard from './settings/SettingsCard';

type FamilyDisplayNameEditorProps = {
  programCode: string;
  campProgramName?: string | null;
  campProgramCode?: string | null;
  onSaved?: () => void;
};

export default function FamilyDisplayNameEditor({
  programCode,
  campProgramName,
  campProgramCode,
  onSaved,
}: FamilyDisplayNameEditorProps) {
  const { showToast } = useToast();
  const activeProgram = readActivePilotProgram();
  const resolvedCode = programCode.trim() || activeProgram?.programCode?.trim() || '';
  const isIndependent = isIndependentFamilyProgram(activeProgram);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedTick, setSavedTick] = useState(0);
  void savedTick;

  const displayName = resolveFamilyPortalDisplayName({
    program: readActivePilotProgram(),
    campProgramName,
    campProgramCode,
  });

  const [draft, setDraft] = useState(displayName);

  useEffect(() => {
    if (!editing) {
      setDraft(displayName);
    }
  }, [displayName, editing]);

  const handleSave = async () => {
    const nextName = draft.trim();
    if (!nextName) {
      showToast('Enter a family display name.', 'error');
      return;
    }
    if (!resolvedCode) {
      showToast('Could not resolve your family program. Please refresh and try again.', 'error');
      return;
    }

    setSaving(true);
    const result = await updateProgramDisplayNameByCode(resolvedCode, {
      displayName: nextName,
      groupName: nextName,
    });
    setSaving(false);

    if (!result.success) {
      showToast(result.message, 'error');
      return;
    }

    setSavedTick((value) => value + 1);
    showToast('Family display name saved.', 'success');
    setEditing(false);
    onSaved?.();
  };

  return (
    <SettingsCard
      title="Family Display Name"
      subtitle={
        isIndependent
          ? 'This name appears on your family dashboard. You can change it anytime.'
          : 'Your family dashboard label. Camp program details stay linked separately.'
      }
    >
      {!editing ? (
        <>
          <p className="family-settingsDisplayName">{displayName}</p>
          <button
            type="button"
            className="family-settingsPrimaryBtn"
            onClick={() => setEditing(true)}
          >
            Edit Display Name
          </button>
        </>
      ) : (
        <form
          className="family-settingsParentForm"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSave();
          }}
        >
          <label className="family-addChildField">
            <span className="family-addChildLabel">Family Display Name</span>
            <input
              className="family-addChildInput"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="The Johnson Family"
              maxLength={80}
              autoComplete="organization"
            />
            <span className="family-addChildHint">
              Shown in your family dashboard. Internal program codes stay the same.
            </span>
          </label>
          <div className="family-settingsActions">
            <button type="submit" className="family-settingsPrimaryBtn" disabled={saving}>
              {saving ? 'Saving…' : 'Save Display Name'}
            </button>
            <button
              type="button"
              className="family-settingsGhostBtn"
              onClick={() => {
                setEditing(false);
                setDraft(displayName);
              }}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </SettingsCard>
  );
}
