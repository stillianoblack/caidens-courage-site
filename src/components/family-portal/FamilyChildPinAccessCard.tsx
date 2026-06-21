import React, { useCallback, useEffect, useState } from 'react';
import { readParentClaimContext } from '../../config/parentClaimContext';
import {
  copyStudentPinWithAudit,
  resetStudentPinViaFunction,
  revealStudentPinViaFunction,
} from '../../lib/studentPinService';
import { useToast } from '../portal-design-system/ToastProvider';
import FamilyStudentPinRegenerateModal from './FamilyStudentPinRegenerateModal';

type FamilyChildPinAccessCardProps = {
  participantId: string;
  displayName: string;
  programCode: string;
  hasPin?: boolean;
  scrollAnchorId?: string;
  scrollAnchorRef?: React.Ref<HTMLElement>;
};

export default function FamilyChildPinAccessCard({
  participantId,
  displayName,
  programCode,
  hasPin = true,
  scrollAnchorId,
  scrollAnchorRef,
}: FamilyChildPinAccessCardProps) {
  const { showToast } = useToast();
  const [pinReady, setPinReady] = useState(hasPin);
  const [pinVisible, setPinVisible] = useState(false);
  const [revealedPin, setRevealedPin] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const parentEmail = readParentClaimContext()?.email?.trim() || '';

  useEffect(() => {
    setPinReady(hasPin);
  }, [hasPin]);

  const resolvePin = useCallback(async (): Promise<string | null> => {
    if (revealedPin) return revealedPin;
    if (!parentEmail) {
      showToast('Confirm your parent email in settings first.', 'error');
      return null;
    }

    setLoading(true);
    const result = await revealStudentPinViaFunction({
      participantId,
      programCode,
      parentEmail,
      actorRole: 'parent',
    });
    setLoading(false);

    if (!('pin' in result)) {
      if (result.needsRefresh) {
        setNeedsRefresh(true);
      }
      showToast(
        result.needsRefresh
          ? 'PIN needs refresh. Generate a new PIN below.'
          : result.error,
        'error',
      );
      return null;
    }

    setRevealedPin(result.pin);
    return result.pin;
  }, [parentEmail, participantId, programCode, revealedPin, showToast]);

  const handleTogglePinVisibility = async () => {
    if (pinVisible) {
      setPinVisible(false);
      return;
    }

    const pin = await resolvePin();
    if (pin) {
      setPinVisible(true);
    }
  };

  const handleCopyPin = async () => {
    const pin = pinVisible && revealedPin ? revealedPin : await resolvePin();
    if (!pin) return;
    const copied = await copyStudentPinWithAudit({ pin, participantId, programCode });
    showToast(copied ? 'PIN copied.' : 'Copy failed.', copied ? 'success' : 'error');
  };

  const handleGeneratePin = async () => {
    if (!parentEmail) {
      showToast('Confirm your parent email in settings first.', 'error');
      return;
    }

    setRegenerating(true);
    const result = await resetStudentPinViaFunction({
      participantId,
      programCode,
      parentEmail,
      actorRole: 'parent',
    });
    setRegenerating(false);
    setConfirmOpen(false);

    if (!('pin' in result)) {
      showToast(result.error, 'error');
      return;
    }

    setNeedsRefresh(false);
    setPinReady(true);
    setRevealedPin(result.pin);
    setPinVisible(true);
    showToast(`New PIN generated for ${displayName}.`, 'success');
  };

  if (!pinReady) {
    return (
      <section
        className="family-settingsStudentAccess"
        id={scrollAnchorId}
        ref={scrollAnchorRef}
        aria-label={`Student access for ${displayName}`}
      >
        <h4 className="family-settingsStudentAccessTitle">Student Access</h4>
        <p className="family-childPinHelper">
          Student PIN is not ready yet. Generate one when your child is added to the program roster.
        </p>
        <button
          type="button"
          className="family-settingsPrimaryBtn"
          disabled={loading || regenerating}
          onClick={() => setConfirmOpen(true)}
        >
          Generate New PIN
        </button>
        <FamilyStudentPinRegenerateModal
          open={confirmOpen}
          submitting={regenerating}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => void handleGeneratePin()}
        />
      </section>
    );
  }

  if (needsRefresh) {
    return (
      <section
        className="family-settingsStudentAccess"
        id={scrollAnchorId}
        ref={scrollAnchorRef}
        aria-label={`Student access for ${displayName}`}
      >
        <h4 className="family-settingsStudentAccessTitle">Student Access</h4>
        <p className="family-childPinHelper family-childPinHelper--warn">
          This PIN needs refresh. Generate a new PIN to restore student login.
        </p>
        <button
          type="button"
          className="family-settingsPrimaryBtn"
          disabled={regenerating}
          onClick={() => setConfirmOpen(true)}
        >
          Generate New PIN
        </button>
        <FamilyStudentPinRegenerateModal
          open={confirmOpen}
          submitting={regenerating}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => void handleGeneratePin()}
        />
      </section>
    );
  }

  const displayedPin = pinVisible && revealedPin ? revealedPin : '••••';

  return (
    <section
      className="family-settingsStudentAccess"
      id={scrollAnchorId}
      ref={scrollAnchorRef}
      aria-label={`Student access for ${displayName}`}
    >
      <h4 className="family-settingsStudentAccessTitle">Student Access</h4>
      <div className="family-childPinAccess">
        <div className="family-childPinRow">
          <span className="family-childPinLabel">Student PIN</span>
          <span className="family-childPinValue" aria-live="polite">
            {displayedPin}
          </span>
        </div>
        <div className="family-childPinActions">
          <button
            type="button"
            className="family-settingsGhostBtn"
            onClick={() => void handleTogglePinVisibility()}
            disabled={loading || regenerating}
          >
            {loading ? 'Loading…' : pinVisible ? 'Hide PIN' : 'Show PIN'}
          </button>
          <button
            type="button"
            className="family-settingsGhostBtn"
            onClick={() => void handleCopyPin()}
            disabled={loading || regenerating}
          >
            Copy PIN
          </button>
          <button
            type="button"
            className="family-settingsGhostBtn"
            onClick={() => setConfirmOpen(true)}
            disabled={loading || regenerating}
          >
            Generate New PIN
          </button>
        </div>
      </div>
      <FamilyStudentPinRegenerateModal
        open={confirmOpen}
        submitting={regenerating}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void handleGeneratePin()}
      />
    </section>
  );
}
