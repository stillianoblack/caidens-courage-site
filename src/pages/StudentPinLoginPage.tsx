import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KIDS_PORTAL_PATH, STUDENT_PIN_LOGIN_PATH } from '../config/courageRoutes';
import { readActivePilotProgram } from '../config/activePilotProgram';
import { hasActiveStudentPinSession, readStudentPinSession, clearStudentPinSession } from '../lib/studentPinSession';
import { verifyStudentPinLogin } from '../lib/studentPinService';
import { launchStudentPinKidPlay } from '../lib/studentPinLoginLaunch';
import { kidShellAwareNavigate } from '../lib/kidShellNav';
import '../components/kid-play-shell/student-pin-login.css';

export default function StudentPinLoginPage() {
  const navigate = useNavigate();
  const [programCode, setProgramCode] = useState('');
  const [pin, setPin] = useState('');
  const [firstNameHint, setFirstNameHint] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Student Login | Caiden\'s Courage';
    const existing = readStudentPinSession();
    if (existing?.programCode) {
      setProgramCode(existing.programCode);
    } else {
      const program = readActivePilotProgram();
      if (program?.programCode?.trim()) {
        setProgramCode(program.programCode.trim());
      }
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);

    const result = await verifyStudentPinLogin({
      programCode: programCode.trim(),
      pin,
      firstNameHint: firstNameHint.trim() || undefined,
    });

    if (!result.success) {
      setSubmitting(false);
      setError(result.error);
      return;
    }

    const program = readActivePilotProgram();
    const launch = await launchStudentPinKidPlay({
      participantId: result.participantId,
      programCode: result.programCode,
      displayName: result.displayName,
      organizationId: program?.id ?? null,
    });

    setSubmitting(false);

    if (launch.kind === 'error') {
      setError(launch.message);
      return;
    }

    kidShellAwareNavigate(navigate, launch.path, { replace: true });
  };

  const resumeSession = readStudentPinSession();
  const canResume = hasActiveStudentPinSession() && resumeSession;

  return (
    <main className="studentPinLoginPage">
      <div className="studentPinLoginCard">
        <p className="studentPinLoginEyebrow">Kids Portal</p>
        <h1 className="studentPinLoginTitle">Enter your camp login</h1>
        <p className="studentPinLoginIntro">
          Use the program code and PIN from your facilitator. No email needed.
        </p>

        {canResume ? (
          <div className="studentPinLoginResume">
            <p>
              Welcome back, <strong>{resumeSession.displayName}</strong>.
            </p>
            <button
              type="button"
              className="studentPinLoginBtnSecondary"
              onClick={() => {
                void launchStudentPinKidPlay({
                  participantId: resumeSession.participantId,
                  programCode: resumeSession.programCode,
                  displayName: resumeSession.displayName,
                }).then((launch) => {
                  if (launch.kind !== 'error') {
                    kidShellAwareNavigate(navigate, launch.path, { replace: true });
                  }
                });
              }}
            >
              Continue as {resumeSession.displayName}
            </button>
          </div>
        ) : null}

        <form className="studentPinLoginForm" onSubmit={(event) => void handleSubmit(event)}>
          <label className="studentPinLoginField">
            <span>Program code</span>
            <input
              type="text"
              value={programCode}
              onChange={(event) => setProgramCode(event.target.value.toUpperCase())}
              autoComplete="off"
              required
            />
          </label>
          <label className="studentPinLoginField">
            <span>Student PIN</span>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={pin}
              onChange={(event) => setPin(event.target.value.replace(/\D/g, ''))}
              autoComplete="off"
              required
            />
          </label>
          <label className="studentPinLoginField">
            <span>First name (only if needed)</span>
            <input
              type="text"
              value={firstNameHint}
              onChange={(event) => setFirstNameHint(event.target.value)}
              autoComplete="given-name"
            />
          </label>
          {error ? <p className="studentPinLoginError">{error}</p> : null}
          <button type="submit" className="studentPinLoginBtnPrimary" disabled={submitting}>
            {submitting ? 'Checking…' : 'Start Adventure'}
          </button>
        </form>

        <p className="studentPinLoginFootnote">
          Parents can connect later with a family claim link from your camp.
        </p>
        <a className="studentPinLoginLink" href={KIDS_PORTAL_PATH}>
          Back to Kids Hub
        </a>
        <a
          className="studentPinLoginLink"
          href={STUDENT_PIN_LOGIN_PATH}
          onClick={(event) => {
            event.preventDefault();
            clearStudentPinSession();
            window.location.assign(STUDENT_PIN_LOGIN_PATH);
          }}
        >
          Switch student
        </a>
      </div>
    </main>
  );
}
