import React, { useEffect, useState } from 'react';
import { readActivePilotProgram } from '../../config/activePilotProgram';

type MembershipDecision = {
  enforced?: boolean;
  allowed?: boolean;
  reason?: string;
  progressRetained?: boolean;
};

type AcademyMembershipGateProps = {
  programCode: string;
  children: React.ReactNode;
};

const buttonClass =
  'inline-flex w-full items-center justify-center rounded-full bg-[#F2D06B] px-6 py-3 text-center text-[15px] font-semibold text-navy-600 disabled:cursor-not-allowed disabled:opacity-60';

function MembershipRequired({
  programCode,
  parentEmail,
}: {
  programCode: string;
  parentEmail: string;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [claimCode, setClaimCode] = useState('');
  const [pending, setPending] = useState(false);

  const startCheckout = async (interval: 'month' | 'year') => {
    setPending(true);
    setMessage(null);
    try {
      const response = await fetch('/.netlify/functions/academy-membership-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interval, programCode, parentEmail }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.url) {
        setMessage(payload.message || 'Membership checkout is not open yet. Nothing was charged.');
        return;
      }
      window.location.assign(payload.url);
    } catch {
      setMessage('Membership checkout is not open yet. Nothing was charged.');
    } finally {
      setPending(false);
    }
  };

  const claimIncludedAccess = async () => {
    setPending(true);
    setMessage(null);
    try {
      const response = await fetch('/.netlify/functions/academy-bundle-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimCode, programCode, parentEmail }),
      });
      if (!response.ok) {
        setMessage('That claim code could not be verified. Nothing was charged.');
        return;
      }
      window.location.reload();
    } catch {
      setMessage('That claim code could not be verified. Nothing was charged.');
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="mx-auto max-w-xl rounded-2xl border-2 border-[#E5C06A] bg-white p-5 sm:p-6">
      <h2 className="font-display text-2xl font-bold text-navy-500">Membership required</h2>
      <p className="mt-3 text-sm leading-relaxed text-navy-600">
        Focus Flame Family is $9.99/month or $99/year. Your family profile and learning progress stay saved.
        Starting a membership is optional, and this screen does not charge you.
      </p>
      <div className="mt-4 grid gap-3">
        <button type="button" className={buttonClass} disabled={pending || !parentEmail} onClick={() => void startCheckout('month')}>
          Continue monthly — $9.99
        </button>
        <button type="button" className={buttonClass} disabled={pending || !parentEmail} onClick={() => void startCheckout('year')}>
          Continue annually — $99
        </button>
      </div>
      <form
        className="mt-5 grid gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          void claimIncludedAccess();
        }}
      >
        <label className="text-sm font-semibold text-navy-600" htmlFor="academy-claim-code">
          Bundle claim code
        </label>
        <input
          id="academy-claim-code"
          value={claimCode}
          onChange={(event) => setClaimCode(event.target.value)}
          className="rounded-xl border border-gray-300 px-3 py-3 text-base text-navy-600"
          autoComplete="off"
        />
        <button type="submit" className={buttonClass} disabled={pending || claimCode.trim().length < 8}>
          Activate included access
        </button>
      </form>
      {message ? <p className="mt-3 text-sm font-semibold text-navy-600">{message}</p> : null}
    </section>
  );
}

export default function AcademyMembershipGate({ programCode, children }: AcademyMembershipGateProps) {
  const [decision, setDecision] = useState<MembershipDecision>({ allowed: true, enforced: false });
  const parentEmail = readActivePilotProgram()?.adminEmail || '';

  useEffect(() => {
    if (!programCode) return undefined;
    let cancelled = false;
    fetch('/.netlify/functions/academy-membership-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ programCode }),
    })
      .then((response) => response.json())
      .then((payload: MembershipDecision) => {
        if (!cancelled) setDecision(payload || { allowed: true });
      })
      .catch(() => {
        if (!cancelled) setDecision({ allowed: true, enforced: false, reason: 'status_unavailable' });
      });
    return () => {
      cancelled = true;
    };
  }, [programCode]);

  if (decision.enforced === true && decision.allowed === false) {
    return <MembershipRequired programCode={programCode} parentEmail={parentEmail} />;
  }
  return <>{children}</>;
}
