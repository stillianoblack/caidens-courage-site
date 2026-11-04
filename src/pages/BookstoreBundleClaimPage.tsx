import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FAMILY_PORTAL_PATH, PILOT_PROGRAM_SIGNUP_PATH } from '../config/courageRoutes';
import { readSignedInFamilyForActivation } from '../lib/academyBundleActivationSession';
import { captureAcademyClaimToken, releaseAcademyClaimToken } from '../lib/academyClaimHandoff';

type Phase = 'checking' | 'ready' | 'expired' | 'claimed' | 'activated' | 'mismatch';

type ReadyInvitation = {
  days: number;
};

const buttonClass = 'inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-[#F2D06B] px-5 py-3 text-base font-bold text-[#16284a] disabled:opacity-60 sm:w-auto';
const secondaryButtonClass = 'inline-flex min-h-[48px] w-full items-center justify-center rounded-full border-2 border-[#16284a] bg-white px-5 py-3 text-base font-bold text-[#16284a] disabled:opacity-60 sm:w-auto';
const inputClass = 'mt-1 w-full rounded-xl border-2 border-[#203864] bg-white px-3 py-3 text-base text-[#16284a]';

const BookstoreBundleClaimPage: React.FC = () => {
  const [phase, setPhase] = useState<Phase>('checking');
  const [invitation, setInvitation] = useState<ReadyInvitation | null>(null);
  const [family, setFamily] = useState(readSignedInFamilyForActivation);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [pending, setPending] = useState(false);
  const [endsAt, setEndsAt] = useState('');

  useEffect(() => {
    const refreshFamily = () => setFamily(readSignedInFamilyForActivation());
    window.addEventListener('focus', refreshFamily);
    window.addEventListener('storage', refreshFamily);
    return () => {
      window.removeEventListener('focus', refreshFamily);
      window.removeEventListener('storage', refreshFamily);
    };
  }, []);

  useEffect(() => {
    const token = captureAcademyClaimToken();
    releaseAcademyClaimToken();
    let cancelled = false;
    fetch('/.netlify/functions/academy-bundle-exchange', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(token ? { token } : {}),
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (cancelled) return;
        if (payload.granted && payload.duplicate) {
          setPhase('claimed');
          return;
        }
        if (!response.ok) {
          setPhase(payload.error === 'already_claimed' ? 'claimed' : 'expired');
          return;
        }
        setInvitation({ days: Number(payload.days) });
        setPhase('ready');
      })
      .catch(() => {
        if (!cancelled) setPhase('expired');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const activate = async () => {
    const signedIn = readSignedInFamilyForActivation();
    if (!signedIn) {
      setFamily(null);
      return;
    }
    setPending(true);
    try {
      const response = await fetch('/.netlify/functions/academy-bundle-claim', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentEmail: signedIn.parentEmail,
          familyAccessCode: signedIn.familyAccessCode,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (payload.error === 'email_mismatch') {
        setPhase('mismatch');
        return;
      }
      if (!response.ok || !payload.granted) {
        setPhase('expired');
        return;
      }
      setEndsAt(payload.endsAt || '');
      setPhase(payload.duplicate ? 'claimed' : 'activated');
      setInvitation(null);
    } finally {
      setPending(false);
    }
  };

  const recover = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    try {
      const response = await fetch('/.netlify/functions/academy-bundle-recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recoveryEmail }),
      });
      const payload = await response.json().catch(() => ({}));
      setRecoveryEmail('');
      setPhase('expired');
      setInvitation(null);
      setEndsAt(payload.message || 'If an unclaimed Academy invitation matches that email, a new one-time link is on its way.');
    } finally {
      setPending(false);
    }
  };

  const days = invitation?.days;
  let message = 'Checking your invitation.';
  if (phase === 'ready' && family && days) {
    message = `This purchase includes ${days} days of Academy access for the family signed in on this browser. The included days start when you activate access.`;
  } else if (phase === 'ready' && days) {
    message = `This purchase includes ${days} days of Academy access. Create a family account or sign in with the email that received the invitation. Choose Independent Family if this is a new family. This browser keeps the invitation ready. Return to this page to activate access.`;
  } else if (phase === 'mismatch') {
    message = 'This invitation can only be added to the family account for the purchase email. Sign in with that email, then return to this page.';
  } else if (phase === 'activated') {
    message = endsAt
      ? `Academy access is active through ${new Date(endsAt).toLocaleDateString()}.`
      : 'Academy access is active.';
  } else if (phase === 'claimed') {
    message = 'This Academy access is already on the family account.';
  } else if (phase === 'expired') {
    message = endsAt || 'This invitation is no longer ready. Request a new link for the purchase email. That sends an invitation only and does not create another order.';
  }

  return (
    <main className="min-h-screen bg-[#faf9f7] px-4 py-10 text-[#16284a] sm:py-14">
      <div className="mx-auto max-w-xl">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#16284a]">Focus Flame Academy</p>
        <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-[#16284a]">Activate included Academy access</h1>
        <p className="mt-4 text-base leading-relaxed text-[#16284a]" role="status">{message}</p>
        {phase === 'ready' && family ? (
          <div className="mt-6">
            <button className={buttonClass} type="button" onClick={activate} disabled={pending}>
              Activate included access
            </button>
          </div>
        ) : null}
        {phase === 'ready' && !family ? (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link className={buttonClass} to={PILOT_PROGRAM_SIGNUP_PATH}>Create a family account</Link>
            <Link className={secondaryButtonClass} to={FAMILY_PORTAL_PATH}>Sign in to your family</Link>
          </div>
        ) : null}
        {phase === 'mismatch' ? (
          <p className="mt-6">
            <Link className={secondaryButtonClass} to={FAMILY_PORTAL_PATH}>Sign in to your family</Link>
          </p>
        ) : null}
        {phase === 'expired' ? (
          <form className="mt-8 space-y-3" onSubmit={recover}>
            <label className="block text-base font-bold" htmlFor="bundle-recovery-email">
              Purchase email
              <input
                id="bundle-recovery-email"
                className={inputClass}
                type="email"
                autoComplete="email"
                value={recoveryEmail}
                onChange={(event) => setRecoveryEmail(event.target.value)}
                required
              />
            </label>
            <button className={secondaryButtonClass} type="submit" disabled={pending}>
              Email a new invitation
            </button>
          </form>
        ) : null}
        {phase === 'activated' || phase === 'claimed' ? (
          <p className="mt-6">
            <Link className={buttonClass} to={FAMILY_PORTAL_PATH}>Enter Focus Flame Academy</Link>
          </p>
        ) : null}
      </div>
    </main>
  );
};

export default BookstoreBundleClaimPage;
