import React, { useCallback, useEffect, useState } from 'react';
import { readParentClaimContext } from '../../config/parentClaimContext';
import { resolveParentEmailFromSources } from '../../lib/portalIdentity';
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
  parentEmail?: string;
  parentConnected?: boolean;
  scrollAnchorId?: string;
  scrollAnchorRef?: React.Ref<HTMLElement>;
};

export default function FamilyChildPinAccessCard({
  participantId,
  displayName,
  programCode,
  hasPin = true,
  parentEmail: parentEmailProp,
  parentConnected: parentConnectedProp,
  scrollAnchorId,
  scrollAnchorRef,
}: FamilyChildPinAccessCardProps) {
  const { showToast } = useToast();
  const programCodeValue = programCode.trim();
  const parentClaim = readParentClaimContext({ programCode: programCodeValue });
  const parentEmail =
    parentEmailProp?.trim() ||
    resolveParentEmailFromSources({
      programCode: programCodeValue,
      parentClaim,
    });
  const parentConnected = parentConnectedProp ?? Boolean(parentEmail);

  const [pinReady, setPinReady] = useState(hasPin);
  const [pinVisible, setPinVisible] = useState(false);
  const [revealedPin, setRevealedPin] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [needsRefresh, setNeedsRefresh] = useState(false);

  useEffect(() => {
    setPinReady(hasPin);
  }, [hasPin]);

  const resolvePin = useCallback(async (): Promise<string | null> => {
    if (revealedPin) return revealedPin;
    if (!parentConnected || !parentEmail) {
      showToast('Connect a parent email before viewing the student PIN.', 'error');
      return null;
    }

    setLoading(true);
    const result = await revealStudentPinViaFunction({
      participantId,
      programCode: programCodeValue,
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
          ? 'PIN needs refresh. Reset the PIN below.'
          : result.error,
        'error',
      );
      return null;
    }

    setRevealedPin(result.pin);
    return result.pin;
  }, [parentConnected, parentEmail, participantId, programCodeValue, revealedPin, showToast]);

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
    const copied = await copyStudentPinWithAudit({ pin, participantId, programCode: programCodeValue });
    showToast(copied ? 'PIN copied.' : 'Copy failed.', copied ? 'success' : 'error');
  };

  const handleResetPin = async () => {
    if (!parentConnected || !parentEmail) {
      showToast('Connect a parent email before resetting the student PIN.', 'error');
      return;
    }

    setRegenerating(true);
    const result = await resetStudentPinViaFunction({
      participantId,
      programCode: programCodeValue,
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
    showToast(`PIN reset for ${displayName}.`, 'success');
  };

  const handleGeneratePin = async () => {
    await handleResetPin();
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
          disabled={loading || regenerating || !parentConnected}
          onClick={() => setConfirmOpen(true)}
        >
          Generate PIN
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
          This PIN needs refresh. Reset the PIN to restore student login.
        </p>
        <button
          type="button"
          className="family-settingsPrimaryBtn"
          disabled={regenerating || !parentConnected}
          onClick={() => setConfirmOpen(true)}
        >
          Reset PIN
        </button>
        <FamilyStudentPinRegenerateModal
          open={confirmOpen}
          submitting={regenerating}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => void handleResetPin()}
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
            disabled={loading || regenerating || !parentConnected}
          >
            {loading ? 'Loading…' : pinVisible ? 'Hide PIN' : 'Reveal PIN'}
          </button>
          <button
            type="button"
            className="family-settingsGhostBtn"
            onClick={() => void handleCopyPin()}
            disabled={loading || regenerating || !parentConnected}
          >
            Copy PIN
          </button>
          <button
            type="button"
            className="family-settingsGhostBtn"
            onClick={() => setConfirmOpen(true)}
            disabled={loading || regenerating || !parentConnected}
          >
            Reset PIN
          </button>
        </div>
      </div>
      <FamilyStudentPinRegenerateModal
        open={confirmOpen}
        submitting={regenerating}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void handleResetPin()}
      />
    </section>
  );
}
