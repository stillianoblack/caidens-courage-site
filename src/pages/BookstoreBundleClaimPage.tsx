import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PILOT_PROGRAM_SIGNUP_PATH, FAMILY_PORTAL_PATH } from '../config/courageRoutes';
import { captureAcademyClaimToken } from '../lib/academyClaimHandoff';

type Exchange = {
  activationToken: string;
  days: number;
  productKey: string;
};

const BookstoreBundleClaimPage: React.FC = () => {
  const [exchange, setExchange] = useState<Exchange | null>(null);
  const [message, setMessage] = useState('Checking your invitation.');
  const [parentEmail, setParentEmail] = useState('');
  const [programCode, setProgramCode] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const token = captureAcademyClaimToken();
    if (!token) {
      setMessage('Enter the purchase email to receive a new one-time invitation.');
      return;
    }
    let cancelled = false;
    fetch('/.netlify/functions/academy-bundle-exchange', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || 'invitation_unavailable');
        return payload as Exchange;
      })
      .then((payload) => {
        if (!cancelled) {
          setExchange(payload);
          setMessage(`This purchase includes ${payload.days} days of Academy access. Sign in with the purchase email to activate it. Access starts now and does not begin a paid membership.`);
        }
      })
      .catch(() => {
        if (!cancelled) setMessage('This invitation is invalid, expired, or already used. Request a new one below.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const activate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!exchange) return;
    setPending(true);
    try {
      const response = await fetch('/.netlify/functions/academy-bundle-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activationToken: exchange.activationToken,
          parentEmail,
          programCode,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(payload.error === 'email_mismatch'
          ? 'This invitation can only be added to the family account for the purchase email.'
          : 'The invitation could not be activated.');
        return;
      }
      setMessage(payload.duplicate
        ? 'This Academy access is already on the family account.'
        : `Academy access is active through ${new Date(payload.endsAt).toLocaleDateString()}.`);
      setExchange(null);
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
      setMessage(payload.message || 'If an unclaimed Academy invitation matches that email, a new one-time link is on its way.');
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="mx-auto max-w-xl px-4 py-12 text-navy-600">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#b0892e]">Focus Flame Academy</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-navy-500">Activate included Academy access</h1>
      <p className="mt-4 leading-relaxed">{message}</p>
      {exchange ? (
        <form className="mt-6 space-y-3" onSubmit={activate}>
          <label className="block text-sm font-semibold">
            Parent email
            <input className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2" type="email" value={parentEmail} onChange={(event) => setParentEmail(event.target.value)} required />
          </label>
          <label className="block text-sm font-semibold">
            Family access code
            <input className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2" value={programCode} onChange={(event) => setProgramCode(event.target.value)} required />
          </label>
          <button className="rounded-full bg-[#F2D06B] px-5 py-3 font-semibold text-navy-600 disabled:opacity-60" type="submit" disabled={pending}>
            Activate access
          </button>
        </form>
      ) : null}
      <form className="mt-8 space-y-3" onSubmit={recover}>
        <label className="block text-sm font-semibold">
          Purchase email
          <input className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2" type="email" value={recoveryEmail} onChange={(event) => setRecoveryEmail(event.target.value)} required />
        </label>
        <button className="rounded-full border border-navy-500 px-5 py-3 font-semibold disabled:opacity-60" type="submit" disabled={pending}>
          Email a new invitation
        </button>
      </form>
      <p className="mt-6 text-sm">
        New families can <Link className="font-semibold underline" to={PILOT_PROGRAM_SIGNUP_PATH}>create a family account</Link> first, then return with the invitation.
        Existing families can <Link className="font-semibold underline" to={FAMILY_PORTAL_PATH}>open the family portal</Link> with the same parent email.
      </p>
    </main>
  );
};

export default BookstoreBundleClaimPage;
