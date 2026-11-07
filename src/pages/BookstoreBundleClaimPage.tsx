import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FAMILY_PORTAL_PATH, PILOT_PROGRAM_SIGNUP_PATH } from '../config/courageRoutes';
import { readSignedInFamilyForActivation } from '../lib/academyBundleActivationSession';
import { captureAcademyClaimToken, releaseAcademyClaimToken } from '../lib/academyClaimHandoff';

type Phase = 'checking' | 'ready' | 'expired' | 'claimed' | 'activated' | 'mismatch';

type ReadyInvitation = {
  days: number;
  productKey: string;
};

type RecoveryNotice = 'acknowledged' | 'error' | null;
type RecoveryBundle = 'paperback' | 'hardcover' | '';
type VerificationStep = 'needed' | 'code' | 'verified';

const buttonClass = 'inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-[#F2D06B] px-5 py-3 text-base font-bold text-[#16284a] disabled:opacity-60';
const secondaryButtonClass = 'inline-flex min-h-[48px] w-full items-center justify-center rounded-full border-2 border-[#16284a] bg-white px-5 py-3 text-base font-bold text-[#16284a] disabled:opacity-60';
const inputClass = 'mt-2 w-full rounded-xl border-2 border-[#203864] bg-white px-3 py-3 text-base text-[#16284a]';

const EXPIRED_MESSAGE = 'Your invitation link has expired or is no longer available. Choose the bundle and enter the purchase email to request another one-time link.';
const RECOVERY_ACK = 'If an eligible purchase matches this request, a new one-time link is emailed to that purchase email.';
const RECOVERY_ERROR = "We couldn't send a new invitation just now. Try again in a moment.";

function bundleName(productKey: string): string {
  if (productKey === 'courage_adventure_bundle') return "Founder's Reserve";
  if (productKey === 'courage_adventure_paperback_bundle') return 'Paperback Adventure Bundle';
  return 'This bundle';
}

const BookstoreBundleClaimPage: React.FC = () => {
  const [phase, setPhase] = useState<Phase>('checking');
  const [invitation, setInvitation] = useState<ReadyInvitation | null>(null);
  const [family, setFamily] = useState(readSignedInFamilyForActivation);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryBundle, setRecoveryBundle] = useState<RecoveryBundle>('');
  const [recoveryDate, setRecoveryDate] = useState('');
  const [recoveryNotice, setRecoveryNotice] = useState<RecoveryNotice>(null);
  const [recoveryMessage, setRecoveryMessage] = useState('');
  const [pending, setPending] = useState(false);
  const [endsAt, setEndsAt] = useState('');
  const [verificationStep, setVerificationStep] = useState<VerificationStep>('needed');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationMessage, setVerificationMessage] = useState('');

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
        const days = Number(payload.days);
        if (!Number.isFinite(days) || days <= 0) {
          setPhase('expired');
          return;
        }
        setInvitation({ days, productKey: String(payload.productKey || '') });
        setPhase('ready');
      })
      .catch(() => {
        if (!cancelled) setPhase('expired');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const sendVerification = async () => {
    const signedIn = readSignedInFamilyForActivation();
    if (!signedIn) {
      setFamily(null);
      return;
    }
    setPending(true);
    setVerificationMessage('');
    try {
      const response = await fetch('/.netlify/functions/academy-bundle-verification', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          familyAccessCode: signedIn.familyAccessCode,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (payload.error === 'email_mismatch') {
        setPhase('mismatch');
        return;
      }
      if (payload.error === 'resend_limited') {
        setVerificationMessage('Please wait before requesting another verification code.');
        return;
      }
      if (!response.ok || !payload.sent) {
        setVerificationMessage("We couldn't send a verification code just now. Try again in a moment.");
        return;
      }
      setVerificationCode('');
      setVerificationStep('code');
      setVerificationMessage('Enter the verification code sent to your Family account email.');
    } catch {
      setVerificationMessage("We couldn't send a verification code just now. Try again in a moment.");
    } finally {
      setPending(false);
    }
  };

  const confirmVerification = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    setVerificationMessage('');
    try {
      const response = await fetch('/.netlify/functions/academy-bundle-verification', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'confirm', code: verificationCode }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.verified) {
        setVerificationMessage('That verification code is not valid.');
        return;
      }
      setVerificationCode('');
      setVerificationStep('verified');
      setVerificationMessage('Your Family email is verified. The included days start when you activate access.');
    } catch {
      setVerificationMessage('That verification code is not valid.');
    } finally {
      setPending(false);
    }
  };

  const activate = async () => {
    setPending(true);
    try {
      const response = await fetch('/.netlify/functions/academy-bundle-claim', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const payload = await response.json().catch(() => ({}));
      if (payload.error === 'email_mismatch') {
        setPhase('mismatch');
        return;
      }
      if (payload.error === 'verification_required') {
        setVerificationStep('needed');
        setVerificationMessage('Verify your Family email before activating access.');
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
        body: JSON.stringify({
          email: recoveryEmail,
          bundle: recoveryBundle,
          ...(recoveryDate ? { purchaseDate: recoveryDate } : {}),
        }),
      });
      const payload = await response.json().catch(() => ({}));
      setPhase('expired');
      setInvitation(null);
      if (!response.ok) {
        setRecoveryNotice('error');
        setRecoveryMessage(RECOVERY_ERROR);
        return;
      }
      setRecoveryNotice('acknowledged');
      setRecoveryMessage(payload.message || RECOVERY_ACK);
    } catch {
      setRecoveryNotice('error');
      setRecoveryMessage(RECOVERY_ERROR);
    } finally {
      setPending(false);
    }
  };

  const days = invitation?.days;
  const duration = days
    ? `${bundleName(invitation?.productKey || '')} includes ${days} days of Focus Flame Academy. These days start when you activate access.`
    : '';
  let headline = 'Activate included Academy access';
  let message = 'Checking your invitation.';
  if (phase === 'ready') {
    headline = 'Your Adventure Starts Here!';
    message = family
      ? 'Your book bundle includes access to Focus Flame Academy. We verify the email on your Family account before access starts.'
      : 'Your book bundle includes access to Focus Flame Academy. Create or sign into your Family account to begin your adventure.';
  } else if (phase === 'mismatch') {
    message = 'This invitation can only be added to the family account for the purchase email. Sign in with that email, then return to this page.';
  } else if (phase === 'activated') {
    headline = 'Welcome to Focus Flame Academy!';
    message = endsAt
      ? `Your included Academy access is now active. It runs through ${new Date(endsAt).toLocaleDateString()}.`
      : 'Your included Academy access is now active.';
  } else if (phase === 'claimed') {
    message = 'This Academy access is already on the family account.';
  } else if (phase === 'expired') {
    headline = 'Invitation unavailable';
    message = EXPIRED_MESSAGE;
  }

  return (
    <main className="min-h-screen bg-[#faf9f7] px-4 py-12 text-[#16284a] sm:px-6 sm:py-16">
      <div className="mx-auto max-w-xl">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#16284a]">Focus Flame Academy</p>
        <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-[#16284a] sm:text-4xl">{headline}</h1>
        <p className="mt-4 text-base leading-relaxed text-[#16284a]" role="status">{message}</p>
        {phase === 'ready' && duration ? (
          <p className="mt-3 text-base font-bold leading-relaxed text-[#16284a]">{duration}</p>
        ) : null}
        {phase === 'ready' && family && verificationStep === 'needed' ? (
          <div className="mt-8 space-y-4">
            {verificationMessage ? (
              <p className="text-base leading-relaxed text-[#16284a]" role="status">{verificationMessage}</p>
            ) : null}
            <button className={buttonClass} type="button" onClick={sendVerification} disabled={pending}>
              Email verification code
            </button>
          </div>
        ) : null}
        {phase === 'ready' && family && verificationStep === 'code' ? (
          <form className="mt-8 space-y-4" onSubmit={confirmVerification}>
            {verificationMessage ? (
              <p className="text-base leading-relaxed text-[#16284a]" role="status">{verificationMessage}</p>
            ) : null}
            <label className="block text-base font-bold" htmlFor="academy-verification-code">
              Verification code
              <input
                id="academy-verification-code"
                className={inputClass}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={8}
                value={verificationCode}
                onChange={(event) => setVerificationCode(event.target.value)}
                required
              />
            </label>
            <button className={buttonClass} type="submit" disabled={pending}>
              Verify email
            </button>
          </form>
        ) : null}
        {phase === 'ready' && family && verificationStep === 'verified' ? (
          <div className="mt-8 space-y-4">
            {verificationMessage ? (
              <p className="text-base leading-relaxed text-[#16284a]" role="status">{verificationMessage}</p>
            ) : null}
            <button className={buttonClass} type="button" onClick={activate} disabled={pending}>
              Activate My Academy Access
            </button>
          </div>
        ) : null}
        {phase === 'ready' && !family ? (
          <div className="mt-8 flex flex-col gap-3">
            <Link className={buttonClass} to={PILOT_PROGRAM_SIGNUP_PATH}>Create a Family Account</Link>
            <Link className={secondaryButtonClass} to={FAMILY_PORTAL_PATH}>Already Have an Account? Sign In</Link>
          </div>
        ) : null}
        {phase === 'mismatch' ? (
          <p className="mt-8">
            <Link className={secondaryButtonClass} to={FAMILY_PORTAL_PATH}>Already Have an Account? Sign In</Link>
          </p>
        ) : null}
        {phase === 'expired' ? (
          <form className="mt-8 space-y-4" onSubmit={recover}>
            {recoveryNotice ? (
              <p className="text-base leading-relaxed text-[#16284a]" role="status">{recoveryMessage}</p>
            ) : null}
            <fieldset className="space-y-2">
              <legend className="text-base font-bold">Bundle</legend>
              <label className="flex items-center gap-2 text-base" htmlFor="bundle-recovery-paperback">
                <input
                  id="bundle-recovery-paperback"
                  name="recovery-bundle"
                  type="radio"
                  value="paperback"
                  checked={recoveryBundle === 'paperback'}
                  onChange={() => setRecoveryBundle('paperback')}
                  required
                />
                Paperback Adventure Bundle
              </label>
              <label className="flex items-center gap-2 text-base" htmlFor="bundle-recovery-hardcover">
                <input
                  id="bundle-recovery-hardcover"
                  name="recovery-bundle"
                  type="radio"
                  value="hardcover"
                  checked={recoveryBundle === 'hardcover'}
                  onChange={() => setRecoveryBundle('hardcover')}
                  required
                />
                Founder's Reserve
              </label>
            </fieldset>
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
            <label className="block text-base font-bold" htmlFor="bundle-recovery-date">
              Purchase date
              <input
                id="bundle-recovery-date"
                className={inputClass}
                type="date"
                value={recoveryDate}
                onChange={(event) => setRecoveryDate(event.target.value)}
              />
            </label>
            <p className="text-sm leading-relaxed text-[#16284a]">Add the purchase date if you bought the same bundle more than once.</p>
            <button className={buttonClass} type="submit" disabled={pending || !recoveryBundle}>
              Request a new invitation
            </button>
          </form>
        ) : null}
        {phase === 'activated' || phase === 'claimed' ? (
          <p className="mt-8">
            <Link className={buttonClass} to={FAMILY_PORTAL_PATH}>Enter Family Portal</Link>
          </p>
        ) : null}
      </div>
    </main>
  );
};

export default BookstoreBundleClaimPage;
