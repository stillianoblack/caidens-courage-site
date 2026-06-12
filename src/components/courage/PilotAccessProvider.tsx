import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../ui/Button';
import { B4_PILOT_MODAL_DESCRIPTION } from '../../config/pilotAccess';
import {
  trackB4WaitlistSubmitted,
  trackFocusFlamePilotClicked,
  trackFocusFlameWaitlistSubmitted,
} from '../../lib/analytics';
import { submitPilotWaitlist } from '../../lib/pilotWaitlistService';
import { useModalScrollLock } from '../../hooks/useModalScrollLock';
import type { PilotInterestType, PilotWaitlistSource } from '../../types/pilotWaitlist';
import { PILOT_WAITLIST_SOURCE_OPTIONS } from '../../types/pilotWaitlist';
import './pilot-access.css';

export type PilotAccessModalOptions = {
  interestType?: PilotInterestType;
  description?: string;
  clickSource?: string;
};

type PilotAccessContextValue = {
  openPilotAccessModal: (options?: PilotAccessModalOptions) => void;
  closePilotAccessModal: () => void;
};

const PilotAccessContext = createContext<PilotAccessContextValue | null>(null);

const DEFAULT_DESCRIPTION =
  'Focus Flame Adventures are currently available through select schools, camps, homeschool programs, and pilot families.\n\nJoin the waitlist to be notified when new adventures become available.';

function PilotAccessModal({
  open,
  interestType,
  description,
  onClose,
}: {
  open: boolean;
  interestType: PilotInterestType;
  description?: string;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [childAge, setChildAge] = useState('');
  const [source, setSource] = useState<PilotWaitlistSource>('School');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useModalScrollLock(open);

  const resetForm = useCallback(() => {
    setParentName('');
    setParentEmail('');
    setChildAge('');
    setSource('School');
    setSubmitting(false);
    setError(null);
    setSuccess(false);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const trimmedName = parentName.trim();
    const trimmedEmail = parentEmail.trim();
    if (!trimmedEmail) {
      setError('Please enter your email.');
      return;
    }
    if (!trimmedName) {
      setError('Please enter your name.');
      return;
    }

    setSubmitting(true);
    const pagePath = `${location.pathname}${location.search}${location.hash}`;
    const result = await submitPilotWaitlist({
      parent_name: trimmedName,
      parent_email: trimmedEmail,
      child_age: childAge.trim() || null,
      source,
      interest_type: interestType,
      page_path: pagePath,
    });
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error ?? 'Something went wrong. Please try again.');
      return;
    }

    if (interestType === 'b4_tools') {
      trackB4WaitlistSubmitted({ source, interest_type: interestType });
    } else {
      trackFocusFlameWaitlistSubmitted({ source, interest_type: interestType });
    }
    setSuccess(true);
  };

  if (!open || typeof document === 'undefined') return null;

  const bodyCopy = description ?? (interestType === 'b4_tools' ? B4_PILOT_MODAL_DESCRIPTION : DEFAULT_DESCRIPTION);

  return createPortal(
    <>
      <button
        type="button"
        className="pilotAccessModalBackdrop"
        aria-label="Close pilot access dialog"
        onClick={handleClose}
      />
      <div
        className="pilotAccessModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pilot-access-modal-title"
      >
        <button type="button" className="pilotAccessModalClose" aria-label="Close" onClick={handleClose}>
          ×
        </button>

        {success ? (
          <>
            <h2 id="pilot-access-modal-title" className="pilotAccessModalTitle">
              You&apos;re On The List!
            </h2>
            <p className="pilotAccessModalDesc">
              We&apos;ll notify you when new Focus Flame Adventures become available.
            </p>
            <div className="pilotAccessModalActions">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => {
                  handleClose();
                  navigate('/kids');
                }}
              >
                Explore Resources
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2 id="pilot-access-modal-title" className="pilotAccessModalTitle">
              Join the Focus Flame Pilot
            </h2>
            <p className="pilotAccessModalDesc">{bodyCopy}</p>
            <form className="pilotAccessModalForm" onSubmit={handleSubmit}>
              <div className="pilotAccessModalField">
                <label htmlFor="pilot-parent-name">Parent Name</label>
                <input
                  id="pilot-parent-name"
                  name="parent_name"
                  type="text"
                  autoComplete="name"
                  value={parentName}
                  onChange={(event) => setParentName(event.target.value)}
                  required
                />
              </div>
              <div className="pilotAccessModalField">
                <label htmlFor="pilot-parent-email">Parent Email</label>
                <input
                  id="pilot-parent-email"
                  name="parent_email"
                  type="email"
                  autoComplete="email"
                  value={parentEmail}
                  onChange={(event) => setParentEmail(event.target.value)}
                  required
                />
              </div>
              <div className="pilotAccessModalField">
                <label htmlFor="pilot-child-age">Child Age (optional)</label>
                <input
                  id="pilot-child-age"
                  name="child_age"
                  type="text"
                  inputMode="numeric"
                  value={childAge}
                  onChange={(event) => setChildAge(event.target.value)}
                />
              </div>
              <div className="pilotAccessModalField">
                <label htmlFor="pilot-source">How did you hear about us?</label>
                <select
                  id="pilot-source"
                  name="source"
                  value={source}
                  onChange={(event) => setSource(event.target.value as PilotWaitlistSource)}
                >
                  {PILOT_WAITLIST_SOURCE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              {error ? (
                <p className="pilotAccessModalError" role="alert">
                  {error}
                </p>
              ) : null}
              <div className="pilotAccessModalActions">
                <Button variant="primary" size="lg" className="w-full" type="submit" disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Request Access'}
                </Button>
                <Button variant="secondary" size="md" className="w-full" type="button" onClick={handleClose}>
                  Maybe Later
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </>,
    document.body,
  );
}

export function PilotAccessProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<PilotAccessModalOptions>({});

  const openPilotAccessModal = useCallback((nextOptions: PilotAccessModalOptions = {}) => {
    setOptions(nextOptions);
    setOpen(true);
    if (nextOptions.interestType !== 'b4_tools') {
      trackFocusFlamePilotClicked({
        click_source: nextOptions.clickSource ?? 'unknown',
        interest_type: nextOptions.interestType ?? 'general_pilot',
      });
    }
  }, []);

  const closePilotAccessModal = useCallback(() => {
    setOpen(false);
  }, []);

  const value = useMemo(
    () => ({ openPilotAccessModal, closePilotAccessModal }),
    [closePilotAccessModal, openPilotAccessModal],
  );

  const interestType = options.interestType ?? 'general_pilot';

  return (
    <PilotAccessContext.Provider value={value}>
      {children}
      <PilotAccessModal
        open={open}
        interestType={interestType}
        description={options.description}
        onClose={closePilotAccessModal}
      />
    </PilotAccessContext.Provider>
  );
}

export function usePilotAccess(): PilotAccessContextValue {
  const context = useContext(PilotAccessContext);
  if (!context) {
    throw new Error('usePilotAccess must be used within PilotAccessProvider');
  }
  return context;
}

export function useOptionalPilotAccess(): PilotAccessContextValue | null {
  return useContext(PilotAccessContext);
}
