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
  const { selectionRequired, loading, error } = useB4Variant(participantId);
  const [confirmedVariant, setConfirmedVariant] = useState<B4VariantKey | null>(null);
  const showSelector = Boolean(
    participantId && !confirmedVariant && !loading && !error && selectionRequired,
  );

  useDocumentModalScrollLock(showSelector);

  useEffect(() => setConfirmedVariant(null), [participantId]);

  if (!participantId || confirmedVariant) return null;

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
