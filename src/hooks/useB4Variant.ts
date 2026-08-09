import { useCallback, useEffect, useState } from 'react';
import { normalizeB4Variant, type B4VariantKey } from '../data/b4/variantManifest';
import { B4_VARIANT_UPDATED_EVENT, loadB4Variant, saveB4Variant } from '../lib/b4VariantService';

export function useB4Variant(participantId?: string | null) {
  const [variant, setVariant] = useState<B4VariantKey>('courage');
  const [selectionRequired, setSelectionRequired] = useState(false);
  const [loading, setLoading] = useState(Boolean(participantId));
  const [loadedParticipantId, setLoadedParticipantId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const id = participantId?.trim();
    if (!id) { setVariant('courage'); setSelectionRequired(false); setLoading(false); setLoadedParticipantId(null); return; }
    setLoading(true);
    try {
      const preference = await loadB4Variant(id);
      setVariant(preference.variant);
      setSelectionRequired(preference.selectionRequired);
      setError(null);
    }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'B-4 preference could not be loaded.'); }
    finally { setLoadedParticipantId(id); setLoading(false); }
  }, [participantId]);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    const onUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ participantId: string; variant: string; selectionRequired?: boolean }>).detail;
      if (detail?.participantId === participantId) {
        setVariant(normalizeB4Variant(detail.variant));
        setSelectionRequired(Boolean(detail.selectionRequired));
      }
    };
    window.addEventListener(B4_VARIANT_UPDATED_EVENT, onUpdated);
    return () => window.removeEventListener(B4_VARIANT_UPDATED_EVENT, onUpdated);
  }, [participantId]);

  const save = useCallback(async (next: B4VariantKey) => {
    const id = participantId?.trim();
    if (!id) throw new Error('Choose a participant first.');
    setVariant(next);
    try { const saved = await saveB4Variant(id, next); setVariant(saved); setSelectionRequired(false); setError(null); return saved; }
    catch (caught) { await refresh(); throw caught; }
  }, [participantId, refresh]);

  const normalizedParticipantId = participantId?.trim() || null;
  const participantChanging = Boolean(normalizedParticipantId && loadedParticipantId !== normalizedParticipantId);

  return { variant, selectionRequired, loading: loading || participantChanging, error, refresh, save };
}
