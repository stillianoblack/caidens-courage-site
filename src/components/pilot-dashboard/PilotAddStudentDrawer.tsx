import React, { useEffect, useRef, useState } from 'react';
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
import FacilitatorDrawer from './FacilitatorDrawer';

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
  const wasOpenRef = useRef(false);
  const childFirstNameRef = useRef<HTMLInputElement>(null);
  const childLastNameRef = useRef<HTMLInputElement>(null);
  const parentFirstNameRef = useRef<HTMLInputElement>(null);
  const parentLastNameRef = useRef<HTMLInputElement>(null);
  const parentEmailRef = useRef<HTMLInputElement>(null);
  const gradeLevelRef = useRef<HTMLSelectElement>(null);

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

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      resetForm();
    }
    wasOpenRef.current = open;
  }, [open]);

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
      childFirstNameRef.current?.focus();
      return;
    }
    if (!childLastName.trim() && !childNickname.trim()) {
      setError('Add a last name or nickname for the student.');
      childLastNameRef.current?.focus();
      return;
    }
    if (trimmedParentEmail) {
      if (!parentFirstName.trim() || !parentLastName.trim()) {
        setError('Parent/guardian first and last name are required when adding a parent email.');
        (!parentFirstName.trim() ? parentFirstNameRef.current : parentLastNameRef.current)?.focus();
        return;
      }
      if (!isValidEmail(trimmedParentEmail)) {
        setError('Enter a valid parent/guardian email or leave it blank.');
        parentEmailRef.current?.focus();
        return;
      }
    } else if (parentEmail.trim() && !isValidEmail(trimmedParentEmail)) {
      setError('Enter a valid parent email or leave it blank.');
      parentEmailRef.current?.focus();
      return;
    }
    if (!isGradeLevel(gradeLevel)) {
      setError('Grade level is required so missions match the student profile.');
      gradeLevelRef.current?.focus();
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
      parentFirstName: trimmedParentEmail ? parentFirstName.trim() || undefined : undefined,
      parentLastName: trimmedParentEmail ? parentLastName.trim() || undefined : undefined,
      parentEmail: trimmedParentEmail || undefined,
      parentPhone: trimmedParentEmail ? parentPhone.trim() || undefined : undefined,
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
      <FacilitatorDrawer
        open={open}
        onClose={handleClose}
        eyebrow="NEW LEARNER"
        title="Student ready"
        description={`${successResult.displayName} can log in now. Copy the PIN and claim link before closing.`}
        characterSrc="/images/Choose-Your-Guide/b-4facilitator.webp"
        size="wide"
        titleId="pilot-add-student-success-title"
      >
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
      </FacilitatorDrawer>
    );
  }

  return (
    <FacilitatorDrawer
      open={open}
      onClose={handleClose}
      eyebrow="NEW LEARNER"
      title="Add a Student"
      description="Create a student profile and prepare their path into the Focus Flame experience."
      characterSrc="/images/Choose-Your-Guide/b-4facilitator.webp"
      size="wide"
      titleId="pilot-add-student-title"
      initialFocusRef={childFirstNameRef}
    >
      <form className="pilot-drawerFormShell" onSubmit={(event) => void handleSubmit(event)}>
        <div className="pilot-drawerBody pilot-drawerBody--form">
          <div className="pilot-drawerForm">
            <label className="pilot-drawerField">
              <span>Child first name</span>
              <input
                ref={childFirstNameRef}
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
                ref={childLastNameRef}
                type="text"
                value={childLastName}
                onChange={(event) => setChildLastName(event.target.value)}
                autoComplete="family-name"
              />
            </label>
            <label className="pilot-drawerField">
              <span>Child nickname (optional if last name provided)</span>
              <input
                ref={parentFirstNameRef}
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
                ref={parentLastNameRef}
                type="text"
                value={parentFirstName}
                onChange={(event) => setParentFirstName(event.target.value)}
                autoComplete="off"
              />
            </label>
            <label className="pilot-drawerField">
              <span>Parent/Guardian last name (optional)</span>
              <input
                type="text"
                value={parentLastName}
                onChange={(event) => setParentLastName(event.target.value)}
                autoComplete="off"
              />
            </label>
            <label className="pilot-drawerField">
              <span>Parent/Guardian email (optional)</span>
              <input
                ref={parentEmailRef}
                type="email"
                value={parentEmail}
                onChange={(event) => setParentEmail(event.target.value)}
                autoComplete="off"
              />
            </label>
            <label className="pilot-drawerField">
              <span>Parent/Guardian phone (optional)</span>
              <input
                type="tel"
                value={parentPhone}
                onChange={(event) => setParentPhone(event.target.value)}
                autoComplete="off"
              />
            </label>
            <label className="pilot-drawerField">
              <span>{GRADE_LEVEL_LABEL}</span>
              <select
                ref={gradeLevelRef}
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
    </FacilitatorDrawer>
  );
}
