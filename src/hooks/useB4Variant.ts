import { useCallback, useEffect, useRef, useState } from 'react';
import { normalizeB4Variant, type B4VariantKey } from '../data/b4/variantManifest';
import {
  B4_VARIANT_UPDATED_EVENT,
  loadB4Variant,
  readCachedB4Preference,
  saveB4Variant,
} from '../lib/b4VariantService';
import { PORTAL_SESSION_CHANGED_EVENT } from '../lib/portalSessionEvents';

export function useB4Variant(participantId?: string | null) {
  const initialCache = readCachedB4Preference(participantId);
  const normalizedInitialId = participantId?.trim() || null;
  const [variant, setVariant] = useState<B4VariantKey>(initialCache?.variant ?? 'courage');
  const [selectionRequired, setSelectionRequired] = useState(
    initialCache?.selectionRequired ?? false,
  );
  const [loading, setLoading] = useState(Boolean(participantId) && !initialCache);
  const [loadedParticipantId, setLoadedParticipantId] = useState<string | null>(
    initialCache ? normalizedInitialId : null,
  );
  const [error, setError] = useState<string | null>(null);
  const requestSequenceRef = useRef(0);

  const refresh = useCallback(async () => {
    const requestSequence = ++requestSequenceRef.current;
    const id = participantId?.trim();
    if (!id) { setVariant('courage'); setSelectionRequired(false); setLoading(false); setLoadedParticipantId(null); return; }
    const cached = readCachedB4Preference(id);
    if (cached) {
      setVariant(cached.variant);
      setSelectionRequired(cached.selectionRequired);
      setLoadedParticipantId(id);
    }
    setError(null);
    setLoading(!cached);
    try {
      const preference = await loadB4Variant(id);
      if (requestSequence !== requestSequenceRef.current) return;
      setVariant(preference.variant);
      setSelectionRequired(preference.selectionRequired);
      setError(null);
    }
    catch (caught) {
      if (requestSequence === requestSequenceRef.current) {
        if (!readCachedB4Preference(id)) {
          setError(caught instanceof Error ? caught.message : 'B-4 preference could not be loaded.');
        }
      }
    }
    finally {
      if (requestSequence === requestSequenceRef.current) {
        setLoadedParticipantId(id);
        setLoading(false);
      }
    }
  }, [participantId]);

  useEffect(() => {
    void refresh();
    return () => { requestSequenceRef.current += 1; };
  }, [refresh]);
  useEffect(() => {
    const onUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ participantId: string; variant: string; selectionRequired?: boolean }>).detail;
      if (detail?.participantId === participantId) {
        setVariant(normalizeB4Variant(detail.variant));
        setSelectionRequired(Boolean(detail.selectionRequired));
        setLoadedParticipantId(detail.participantId);
        setLoading(false);
        setError(null);
      }
    };
    window.addEventListener(B4_VARIANT_UPDATED_EVENT, onUpdated);
    return () => window.removeEventListener(B4_VARIANT_UPDATED_EVENT, onUpdated);
  }, [participantId]);
  useEffect(() => {
    const onSessionChanged = () => {
      void refresh();
    };
    window.addEventListener(PORTAL_SESSION_CHANGED_EVENT, onSessionChanged);
    return () => window.removeEventListener(PORTAL_SESSION_CHANGED_EVENT, onSessionChanged);
  }, [refresh]);

  const save = useCallback(async (next: B4VariantKey) => {
    const id = participantId?.trim();
    if (!id) throw new Error('Choose a participant first.');
    setVariant(next);
    try { const saved = await saveB4Variant(id, next); setVariant(saved); setSelectionRequired(false); setError(null); return saved; }
    catch (caught) { await refresh(); throw caught; }
  }, [participantId, refresh]);

  const normalizedParticipantId = participantId?.trim() || null;
  const participantChanging = Boolean(normalizedParticipantId && loadedParticipantId !== normalizedParticipantId);
  const participantCache = readCachedB4Preference(normalizedParticipantId);
  const visibleVariant = participantChanging
    ? participantCache?.variant ?? 'courage'
    : variant;
  const visibleSelectionRequired = participantChanging
    ? participantCache?.selectionRequired ?? false
    : selectionRequired;

  return {
    variant: visibleVariant,
    selectionRequired: visibleSelectionRequired,
    loading: loading || participantChanging,
    error: participantChanging ? null : error,
    refresh,
    save,
  };
}
