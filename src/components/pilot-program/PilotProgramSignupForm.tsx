import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PILOT_AGE_RANGE_OPTIONS,
  PILOT_PROGRAM_TYPE_OPTIONS,
  type PilotAgeRange,
  type PilotProgramSignupInput,
  type PilotProgramType,
} from '../../types/pilotProgram';
import { INDEPENDENT_FAMILY_PROGRAM_TYPE } from '../../lib/independentFamilyProgram';
import { clearStaleProgramSessionForIndependentSignup } from '../../lib/clearStaleProgramSession';
import { PILOT_TERMS_PATH } from '../../config/courageRoutes';
import { trackContactFormStarted } from '../../lib/analytics';

type PilotProgramSignupFormProps = {
  onSubmit: (input: PilotProgramSignupInput) => Promise<void>;
  submitting: boolean;
  error: string | null;
};

export default function PilotProgramSignupForm({
  onSubmit,
  submitting,
  error,
}: PilotProgramSignupFormProps) {
  const [programType, setProgramType] = useState<PilotProgramType>('Camp / Youth Program');
  const [programName, setProgramName] = useState('');
  const [adminFirstName, setAdminFirstName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [estimatedStudents, setEstimatedStudents] = useState('');
  const [ageRange, setAgeRange] = useState<PilotAgeRange>('Mixed Ages');
  const [groupName, setGroupName] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const isIndependentFamily = programType === INDEPENDENT_FAMILY_PROGRAM_TYPE;

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
      const students = Number.parseInt(estimatedStudents, 10);
      if (!Number.isFinite(students) || students < 1) {
        return;
      }
      if (!programName.trim() || !groupName.trim()) {
        return;
      }
    }

    const students = isIndependentFamily
      ? 1
      : Number.parseInt(estimatedStudents, 10);

    await onSubmit({
      programType,
      programName,
      adminFirstName,
      adminEmail,
      estimatedStudents: students,
      ageRange,
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

      <div className="pilotSignup-field">
        <label htmlFor="pilot-program-name">
          {isIndependentFamily ? 'Family Name (Optional)' : 'Program Name'}
        </label>
        <input
          id="pilot-program-name"
          type="text"
          value={programName}
          onChange={(event) => setProgramName(event.target.value)}
          onFocus={() => trackContactFormStarted('/pilot-program-signup')}
          placeholder={isIndependentFamily ? 'The Martinez Family' : 'Sunshine Valley Day Camp'}
          required={!isIndependentFamily}
        />
      </div>

      <div className="pilotSignup-field">
        <label htmlFor="pilot-admin-first">
          {isIndependentFamily ? 'Parent / Guardian First Name' : 'Admin First Name'}
        </label>
        <input
          id="pilot-admin-first"
          type="text"
          value={adminFirstName}
          onChange={(event) => setAdminFirstName(event.target.value)}
          required
        />
      </div>

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
          <label htmlFor="pilot-estimated-students">Estimated Number of Students</label>
          <input
            id="pilot-estimated-students"
            type="number"
            min={1}
            value={estimatedStudents}
            onChange={(event) => setEstimatedStudents(event.target.value)}
            required
          />
        </div>
      )}

      <div className="pilotSignup-field">
        <label htmlFor="pilot-age-range">Age Range</label>
        <select
          id="pilot-age-range"
          value={ageRange}
          onChange={(event) => setAgeRange(event.target.value as PilotAgeRange)}
          required
        >
          {PILOT_AGE_RANGE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
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
