import React, { useState } from 'react';
import {
  createCampChildWithOptionalParent,
  type CampChildOnboardingResult,
} from '../../lib/campChildOnboardingService';
import {
  buildFamilyClaimUrl,
  buildStudentLoginInstructions,
  buildStudentLoginUrl,
} from '../../lib/familyClaimCode';
import {
  GRADE_LEVEL_ENCOURAGE,
  GRADE_LEVEL_LABEL,
  GRADE_LEVEL_OPTIONS,
  isGradeLevel,
  type GradeLevel,
} from '../../data/gradeLevelOptions';
import { useToast } from '../portal-design-system/ToastProvider';
import PilotDrawer from './PilotDrawer';

type PilotAddStudentDrawerProps = {
  open: boolean;
  onClose: () => void;
  programCode: string;
  programName?: string;
  onSuccess: (message: string) => void;
};

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function PilotAddStudentDrawer({
  open,
  onClose,
  programCode,
  programName,
  onSuccess,
}: PilotAddStudentDrawerProps) {
  const { showToast } = useToast();
  const [childFirstName, setChildFirstName] = useState('');
  const [childLastName, setChildLastName] = useState('');
  const [childNickname, setChildNickname] = useState('');
  const [parentFirstName, setParentFirstName] = useState('');
  const [parentLastName, setParentLastName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [gradeLevel, setGradeLevel] = useState<GradeLevel | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<CampChildOnboardingResult | null>(null);

  const trimmedProgramCode = programCode.trim();

  const resetForm = () => {
    setChildFirstName('');
    setChildLastName('');
    setChildNickname('');
    setParentFirstName('');
    setParentLastName('');
    setParentEmail('');
    setParentPhone('');
    setGradeLevel('');
    setError(null);
    setSuccessResult(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const copyText = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      showToast(`${label} copied.`, 'success');
    } catch {
      showToast('Copy failed.', 'error');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setError(null);

    const trimmedParentEmail = parentEmail.trim();

    if (!childFirstName.trim()) {
      setError('Child first name is required.');
      return;
    }
    if (!childLastName.trim() && !childNickname.trim()) {
      setError('Add a last name or nickname for the student.');
      return;
    }
    if (trimmedParentEmail) {
      if (!parentFirstName.trim() || !parentLastName.trim()) {
        setError('Parent/guardian first and last name are required when adding a parent email.');
        return;
      }
      if (!isValidEmail(trimmedParentEmail)) {
        setError('Enter a valid parent/guardian email or leave it blank.');
        return;
      }
    } else if (parentEmail.trim() && !isValidEmail(trimmedParentEmail)) {
      setError('Enter a valid parent email or leave it blank.');
      return;
    }
    if (!isGradeLevel(gradeLevel)) {
      setError('Grade level is required so missions match the student profile.');
      return;
    }
    if (!trimmedProgramCode) {
      setError('Program is not loaded yet. Refresh the dashboard and try again.');
      return;
    }

    setSubmitting(true);

    const result = await createCampChildWithOptionalParent({
      childFirstName: childFirstName.trim(),
      childLastName: childLastName.trim() || undefined,
      childNickname: childNickname.trim() || undefined,
      connectParentLater: !trimmedParentEmail,
      parentFirstName: parentFirstName.trim() || undefined,
      parentLastName: parentLastName.trim() || undefined,
      parentEmail: trimmedParentEmail || undefined,
      parentPhone: parentPhone.trim() || undefined,
      gradeLevel,
      campProgramCode: trimmedProgramCode,
    });

    setSubmitting(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    if (result.studentPin || result.familyClaimCode) {
      setSuccessResult(result);
      onSuccess(result.message);
      return;
    }

    const successMessage = result.message;
    resetForm();
    onSuccess(successMessage);
    onClose();
  };

  if (successResult?.studentPin) {
    const claimUrl =
      successResult.familyClaimUrl ||
      (successResult.familyClaimCode ? buildFamilyClaimUrl(successResult.familyClaimCode) : '');
    const loginInstructions = buildStudentLoginInstructions({
      studentName: successResult.displayName,
      programName: programName?.trim() || trimmedProgramCode,
      programCode: trimmedProgramCode,
      pin: successResult.studentPin,
    });

    return (
      <PilotDrawer
        open={open}
        onClose={handleClose}
        className="pilot-drawer pilot-drawer--form"
        titleId="pilot-add-student-success-title"
      >
        <div className="pilot-drawerHead">
          <div>
            <h2 id="pilot-add-student-success-title" className="pilot-drawerTitle">
              Student ready
            </h2>
            <p className="pilot-drawerSubtitle">
              {successResult.displayName} can log in now. Copy the PIN and claim link before closing.
            </p>
          </div>
          <button type="button" className="pilot-drawerClose" onClick={handleClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="pilot-drawerBody pilot-drawerBody--form">
          <div className="pilot-drawerForm">
            <p>
              <strong>Student PIN:</strong> {successResult.studentPin}
            </p>
            <div className="pilot-drawerActions">
              <button
                type="button"
                className="pilot-drawerBtnSecondary"
                onClick={() => void copyText(successResult.studentPin || '', 'PIN')}
              >
                Copy PIN
              </button>
              <button
                type="button"
                className="pilot-drawerBtnSecondary"
                onClick={() => void copyText(loginInstructions, 'Login instructions')}
              >
                Copy login instructions
              </button>
            </div>
            {claimUrl ? (
              <>
                <p>
                  <strong>Family claim link:</strong> {claimUrl}
                </p>
                <button
                  type="button"
                  className="pilot-drawerBtnSecondary"
                  onClick={() => void copyText(claimUrl, 'Family claim link')}
                >
                  Copy claim link
                </button>
              </>
            ) : null}
            <p className="pilot-drawerFieldHint">Login URL: {buildStudentLoginUrl()}</p>
          </div>
        </div>
        <div className="pilot-drawerFooter">
          <button type="button" className="pilot-drawerBtnPrimary" onClick={handleClose}>
            Done
          </button>
        </div>
      </PilotDrawer>
    );
  }

  return (
    <PilotDrawer
      open={open}
      onClose={handleClose}
      className="pilot-drawer pilot-drawer--form"
      titleId="pilot-add-student-title"
    >
      <div className="pilot-drawerHead">
        <div>
          <h2 id="pilot-add-student-title" className="pilot-drawerTitle">
            Add Student
          </h2>
          <p className="pilot-drawerSubtitle">
            Creates a student profile for this program. Parent contact is optional.
          </p>
        </div>
        <button type="button" className="pilot-drawerClose" onClick={handleClose} aria-label="Close">
          ×
        </button>
      </div>

      <form className="pilot-drawerFormShell" onSubmit={(event) => void handleSubmit(event)}>
        <div className="pilot-drawerBody pilot-drawerBody--form">
          <div className="pilot-drawerForm">
            <label className="pilot-drawerField">
              <span>Child first name</span>
              <input
                type="text"
                value={childFirstName}
                onChange={(event) => setChildFirstName(event.target.value)}
                required
                autoComplete="given-name"
              />
            </label>
            <label className="pilot-drawerField">
              <span>Child last name</span>
              <input
                type="text"
                value={childLastName}
                onChange={(event) => setChildLastName(event.target.value)}
                autoComplete="family-name"
              />
            </label>
            <label className="pilot-drawerField">
              <span>Child nickname (optional if last name provided)</span>
              <input
                type="text"
                value={childNickname}
                onChange={(event) => setChildNickname(event.target.value)}
                autoComplete="nickname"
              />
            </label>
            <p className="pilot-drawerFieldHint">
              You can add a student now and connect a parent later. A student PIN will be created for
              kid access.
            </p>
            <label className="pilot-drawerField">
              <span>Parent/Guardian first name (optional)</span>
              <input
                type="text"
                value={parentFirstName}
                onChange={(event) => setParentFirstName(event.target.value)}
                autoComplete="given-name"
              />
            </label>
            <label className="pilot-drawerField">
              <span>Parent/Guardian last name (optional)</span>
              <input
                type="text"
                value={parentLastName}
                onChange={(event) => setParentLastName(event.target.value)}
                autoComplete="family-name"
              />
            </label>
            <label className="pilot-drawerField">
              <span>Parent/Guardian email (optional)</span>
              <input
                type="email"
                value={parentEmail}
                onChange={(event) => setParentEmail(event.target.value)}
                autoComplete="email"
              />
            </label>
            <label className="pilot-drawerField">
              <span>Parent/Guardian phone (optional)</span>
              <input
                type="tel"
                value={parentPhone}
                onChange={(event) => setParentPhone(event.target.value)}
                autoComplete="tel"
              />
            </label>
            <label className="pilot-drawerField">
              <span>{GRADE_LEVEL_LABEL}</span>
              <select
                value={gradeLevel}
                onChange={(event) => {
                  const next = event.target.value;
                  setGradeLevel(isGradeLevel(next) ? next : '');
                }}
                required
              >
                <option value="">Choose grade…</option>
                {GRADE_LEVEL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="pilot-drawerFieldHint">{GRADE_LEVEL_ENCOURAGE}</span>
            </label>
            {error ? <p className="pilot-syncWarning">{error}</p> : null}
          </div>
        </div>

        <div className="pilot-drawerFooter">
          <div className="pilot-drawerActions">
            <button type="button" className="pilot-drawerBtnSecondary" onClick={handleClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="pilot-drawerBtnPrimary"
              disabled={submitting}
              aria-disabled={submitting}
            >
              {submitting ? 'Saving…' : 'Add Student'}
            </button>
          </div>
        </div>
      </form>
    </PilotDrawer>
  );
}
