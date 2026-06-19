import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FAMILY_PORTAL_PATH } from '../config/courageRoutes';
import {
  claimStudentWithFamilyClaimCode,
  lookupStudentByFamilyClaimCode,
} from '../lib/familyClaimByCodeService';
import { readActiveAccessCode } from '../config/portalContext';

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function FamilyClaimByCodePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [claimCode, setClaimCode] = useState(searchParams.get('code')?.trim().toUpperCase() || '');
  const [parentFirstName, setParentFirstName] = useState('');
  const [parentLastName, setParentLastName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [childPreview, setChildPreview] = useState<string | null>(null);
  const [programPreview, setProgramPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Connect to Your Child | Caiden\'s Courage';
  }, []);

  useEffect(() => {
    const code = claimCode.trim();
    if (code.length < 8) {
      setChildPreview(null);
      setProgramPreview(null);
      return;
    }

    let cancelled = false;
    void lookupStudentByFamilyClaimCode(code).then((result) => {
      if (cancelled) return;
      if (result.student) {
        setChildPreview(result.student.childDisplayName);
        setProgramPreview(result.student.programName || result.student.programCode);
        if (result.student.alreadyClaimed) {
          setError('This student has already been connected to a family account.');
        }
      } else {
        setChildPreview(null);
        setProgramPreview(null);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [claimCode]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setError(null);
    setSuccess(null);

    if (!isValidEmail(parentEmail)) {
      setError('Enter a valid parent email.');
      return;
    }

    setSubmitting(true);
    const result = await claimStudentWithFamilyClaimCode({
      claimCode,
      parentFirstName: parentFirstName.trim(),
      parentLastName: parentLastName.trim(),
      parentEmail: parentEmail.trim(),
      parentPhone: parentPhone.trim() || undefined,
      accessCode: readActiveAccessCode() || undefined,
    });
    setSubmitting(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    setSuccess(result.message);
    window.setTimeout(() => {
      navigate(FAMILY_PORTAL_PATH, { replace: true });
    }, 1200);
  };

  return (
    <main className="family-settingsPanel" style={{ maxWidth: '36rem', margin: '2rem auto', padding: '1rem' }}>
      <h1>Connect to your child</h1>
      <p>
        Enter the family claim code from your camp facilitator to connect your parent account to an
        existing student profile.
      </p>

      {childPreview ? (
        <p>
          <strong>{childPreview}</strong>
          {programPreview ? ` · ${programPreview}` : null}
        </p>
      ) : null}

      <form onSubmit={(event) => void handleSubmit(event)} style={{ display: 'grid', gap: '0.75rem' }}>
        <label>
          Family claim code
          <input value={claimCode} onChange={(event) => setClaimCode(event.target.value.toUpperCase())} required />
        </label>
        <label>
          Parent first name
          <input value={parentFirstName} onChange={(event) => setParentFirstName(event.target.value)} required />
        </label>
        <label>
          Parent last name
          <input value={parentLastName} onChange={(event) => setParentLastName(event.target.value)} required />
        </label>
        <label>
          Parent email
          <input type="email" value={parentEmail} onChange={(event) => setParentEmail(event.target.value)} required />
        </label>
        <label>
          Parent phone (optional)
          <input type="tel" value={parentPhone} onChange={(event) => setParentPhone(event.target.value)} />
        </label>
        {error ? <p className="pilot-syncWarning">{error}</p> : null}
        {success ? <p style={{ color: '#047857', fontWeight: 600 }}>{success}</p> : null}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Connecting…' : 'Connect child'}
        </button>
      </form>

      <p style={{ marginTop: '1rem' }}>
        <Link to={FAMILY_PORTAL_PATH}>Back to family portal</Link>
      </p>
    </main>
  );
}
