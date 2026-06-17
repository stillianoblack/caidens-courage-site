import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AGE_GRADE_BAND_OPTIONS,
  ESTIMATED_STUDENT_COUNT_RANGE_OPTIONS,
  INDEPENDENT_FAMILY_STUDENT_COUNT_RANGE,
  PILOT_PROGRAM_TYPE_OPTIONS,
  type AgeGradeBand,
  type EstimatedStudentCountRange,
  type PilotProgramSignupInput,
  type PilotProgramType,
} from '../../types/pilotProgram';
import { INDEPENDENT_FAMILY_PROGRAM_TYPE } from '../../lib/independentFamilyProgram';
import { mapAgeGradeBandToLegacyAgeRange } from '../../lib/pilotProgramAgeGrade';
import { deriveEstimatedStudentsFromRange } from '../../lib/pilotProgramStudentRange';
import { clearStaleProgramSessionForIndependentSignup } from '../../lib/clearStaleProgramSession';
import { PILOT_TERMS_PATH } from '../../config/courageRoutes';
import { trackContactFormStarted } from '../../lib/analytics';

type PilotProgramSignupFormProps = {
  onSubmit: (input: PilotProgramSignupInput) => Promise<void>;
  submitting: boolean;
  error: string | null;
};

function resolveIndependentFamilyPlaceholder(firstName: string): string {
  const trimmed = firstName.trim();
  if (trimmed) return `The ${trimmed} Family`;
  return 'My Family';
}

export default function PilotProgramSignupForm({
  onSubmit,
  submitting,
  error,
}: PilotProgramSignupFormProps) {
  const [programType, setProgramType] = useState<PilotProgramType>('Camp / Youth Program');
  const [programName, setProgramName] = useState('');
  const [adminFirstName, setAdminFirstName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [estimatedStudentCountRange, setEstimatedStudentCountRange] = useState<
    EstimatedStudentCountRange | ''
  >('');
  const [ageGradeBand, setAgeGradeBand] = useState<AgeGradeBand>('Mixed Ages');
  const [ageGradeNotes, setAgeGradeNotes] = useState('');
  const [groupName, setGroupName] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const isIndependentFamily = programType === INDEPENDENT_FAMILY_PROGRAM_TYPE;

  const independentFamilyPlaceholder = useMemo(
    () => resolveIndependentFamilyPlaceholder(adminFirstName),
    [adminFirstName],
  );

  useEffect(() => {
    if (programType !== INDEPENDENT_FAMILY_PROGRAM_TYPE) return;
    clearStaleProgramSessionForIndependentSignup();
    setProgramName('');
    setGroupName('');
  }, [programType]);

  const handleProgramTypeChange = (nextType: PilotProgramType) => {
    setProgramType(nextType);
    if (nextType === INDEPENDENT_FAMILY_PROGRAM_TYPE) {
      setProgramName('');
      setGroupName('');
    }
  };

  const orderedProgramTypes = useMemo(() => {
    const options = [...PILOT_PROGRAM_TYPE_OPTIONS];
    const homeschoolIndex = options.indexOf('Homeschool Group');
    const independentIndex = options.indexOf(INDEPENDENT_FAMILY_PROGRAM_TYPE);
    if (
      homeschoolIndex >= 0 &&
      independentIndex >= 0 &&
      independentIndex !== homeschoolIndex + 1
    ) {
      options.splice(independentIndex, 1);
      options.splice(homeschoolIndex + 1, 0, INDEPENDENT_FAMILY_PROGRAM_TYPE);
    }
    return options;
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isIndependentFamily) {
      if (!programName.trim() || !groupName.trim()) {
        return;
      }
    }

    const studentCountRange = isIndependentFamily
      ? INDEPENDENT_FAMILY_STUDENT_COUNT_RANGE
      : estimatedStudentCountRange || null;
    const students =
      studentCountRange != null ? deriveEstimatedStudentsFromRange(studentCountRange) : null;
    const legacyAgeRange = mapAgeGradeBandToLegacyAgeRange(ageGradeBand);

    await onSubmit({
      programType,
      programName,
      adminFirstName,
      adminEmail,
      estimatedStudents: students,
      estimatedStudentCountRange: studentCountRange,
      ageGradeBand,
      ageGradeNotes,
      ageRange: legacyAgeRange,
      groupName: isIndependentFamily ? '' : groupName,
      agreedToTerms,
    });
  };

  return (
    <form className="pilotSignup-form" onSubmit={handleSubmit} noValidate>
      <div className="pilotSignup-field">
        <label htmlFor="pilot-program-type">Program Type</label>
        <select
          id="pilot-program-type"
          value={programType}
          onChange={(event) => handleProgramTypeChange(event.target.value as PilotProgramType)}
          required
        >
          {orderedProgramTypes.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {isIndependentFamily ? (
        <>
          <div className="pilotSignup-field">
            <label htmlFor="pilot-admin-first">Parent / Guardian First Name</label>
            <input
              id="pilot-admin-first"
              type="text"
              value={adminFirstName}
              onChange={(event) => setAdminFirstName(event.target.value)}
              required
            />
          </div>

          <div className="pilotSignup-field">
            <label htmlFor="pilot-program-name">Family Display Name</label>
            <input
              id="pilot-program-name"
              type="text"
              value={programName}
              onChange={(event) => setProgramName(event.target.value)}
              onFocus={() => trackContactFormStarted('/pilot-program-signup')}
              placeholder={independentFamilyPlaceholder}
            />
            <p className="pilotSignup-fieldHint">
              This is the name shown in your family dashboard. You can change it later in Settings.
            </p>
          </div>
        </>
      ) : (
        <div className="pilotSignup-field">
          <label htmlFor="pilot-program-name">Program Name</label>
          <input
            id="pilot-program-name"
            type="text"
            value={programName}
            onChange={(event) => setProgramName(event.target.value)}
            onFocus={() => trackContactFormStarted('/pilot-program-signup')}
            placeholder="Sunshine Valley Day Camp"
            required
          />
        </div>
      )}

      {!isIndependentFamily ? (
        <div className="pilotSignup-field">
          <label htmlFor="pilot-admin-first">Admin First Name</label>
          <input
            id="pilot-admin-first"
            type="text"
            value={adminFirstName}
            onChange={(event) => setAdminFirstName(event.target.value)}
            required
          />
        </div>
      ) : null}

      <div className="pilotSignup-field">
        <label htmlFor="pilot-admin-email">
          {isIndependentFamily ? 'Parent / Guardian Email' : 'Admin Email'}
        </label>
        <input
          id="pilot-admin-email"
          type="email"
          value={adminEmail}
          onChange={(event) => setAdminEmail(event.target.value)}
          required
        />
      </div>

      {isIndependentFamily ? null : (
        <div className="pilotSignup-field">
          <label htmlFor="pilot-estimated-students">Estimated Number of Students (optional)</label>
          <select
            id="pilot-estimated-students"
            value={estimatedStudentCountRange}
            onChange={(event) =>
              setEstimatedStudentCountRange(event.target.value as EstimatedStudentCountRange | '')
            }
          >
            <option value="">Prefer not to say</option>
            {ESTIMATED_STUDENT_COUNT_RANGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="pilotSignup-field">
        <label htmlFor="pilot-age-grade-band">Age / Grade Range</label>
        <select
          id="pilot-age-grade-band"
          value={ageGradeBand}
          onChange={(event) => setAgeGradeBand(event.target.value as AgeGradeBand)}
          required
        >
          {AGE_GRADE_BAND_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="pilotSignup-field">
        <label htmlFor="pilot-age-grade-notes">Age / Grade Notes (optional)</label>
        <input
          id="pilot-age-grade-notes"
          type="text"
          value={ageGradeNotes}
          onChange={(event) => setAgeGradeNotes(event.target.value)}
          placeholder={
            ageGradeBand === 'Other'
              ? 'Describe your age or grade mix'
              : 'e.g. mostly 2nd graders with one 4th grader'
          }
        />
      </div>

      {isIndependentFamily ? null : (
        <div className="pilotSignup-field">
          <label htmlFor="pilot-group-name">Group / Classroom Name</label>
          <input
            id="pilot-group-name"
            type="text"
            value={groupName}
            onChange={(event) => setGroupName(event.target.value)}
            placeholder="Morning Group, Room 12, Blue Group"
            required
          />
        </div>
      )}

      <div className="pilotSignup-terms">
        <label className="pilotSignup-termsLabel">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(event) => setAgreedToTerms(event.target.checked)}
            required
          />
          <span>
            I agree to the Focus Flame Academy Pilot License Terms and understand these materials
            are licensed for use within this program only.{' '}
            <Link to={PILOT_TERMS_PATH} target="_blank" rel="noopener noreferrer">
              View Pilot Terms
            </Link>
          </span>
        </label>
      </div>

      {error ? (
        <p className="pilotSignup-error" role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" className="pilotSignup-submit" disabled={submitting || !agreedToTerms}>
        {submitting
          ? isIndependentFamily
            ? 'Creating Family Access…'
            : 'Creating Program…'
          : isIndependentFamily
            ? 'Create Family Access'
            : 'Create Pilot Program'}
      </button>
    </form>
  );
}
