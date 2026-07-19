import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useB4Variant } from '../../hooks/useB4Variant';
import { useDocumentModalScrollLock } from '../../hooks/useDocumentModalScrollLock';
import type { B4VariantKey } from '../../data/b4/variantManifest';
import B4VariantSelector from './B4VariantSelector';

export default function B4UnitOnboardingModal({
  participantId,
  enforce = false,
}: {
  participantId?: string | null;
  enforce?: boolean;
}) {
  const { selectionRequired, loading, error, refresh } = useB4Variant(participantId);
  const [confirmedVariant, setConfirmedVariant] = useState<B4VariantKey | null>(null);
  const showLoading = Boolean(participantId && !confirmedVariant && enforce && loading);
  const showError = Boolean(participantId && !confirmedVariant && enforce && error);
  const showSelector = Boolean(
    participantId && !confirmedVariant && !loading && !error && selectionRequired,
  );

  useDocumentModalScrollLock(showLoading || showError || showSelector);

  useEffect(() => setConfirmedVariant(null), [participantId]);

  if (!participantId || confirmedVariant) return null;

  if (enforce && loading) {
    return createPortal(
      <div className="b4OnboardingBackdrop" role="presentation">
        <div className="b4OnboardingLoading" role="status" aria-live="polite">
          <span className="b4OnboardingLoading__avatar" aria-hidden="true" />
          <p>Loading your B-4 companion…</p>
        </div>
      </div>,
      document.body,
    );
  }

  if (enforce && error) {
    return createPortal(
      <div className="b4OnboardingBackdrop" role="presentation">
        <div className="b4OnboardingLoading" role="alert">
          <p>We couldn’t load your B-4 choice yet.</p>
          <button type="button" disabled={loading} onClick={() => void refresh()}>
            Try Again
          </button>
        </div>
      </div>,
      document.body,
    );
  }

  if (loading || error || !selectionRequired) return null;

  return createPortal(
    <div className="b4OnboardingBackdrop" role="presentation">
      <div
        className="b4OnboardingModal"
        role="dialog"
        aria-modal="true"
        aria-label="Select Your B-4 Unit"
      >
        <B4VariantSelector
          participantId={participantId}
          mode="onboarding"
          theme="game"
          onSaved={setConfirmedVariant}
        />
      </div>
    </div>,
    document.body,
  );
}
