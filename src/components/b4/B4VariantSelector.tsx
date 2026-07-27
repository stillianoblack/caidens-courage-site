import React, { useEffect, useId, useRef, useState } from 'react';
import {
  B4_VARIANT_KEYS,
  B4_VARIANTS,
  type B4StateKey,
  type B4VariantKey,
} from '../../data/b4/variantManifest';
import { useB4Variant } from '../../hooks/useB4Variant';
import B4CircleAvatar from './B4CircleAvatar';
import './b4-variant-selector.css';

const ONBOARDING_STRENGTHS: Record<B4VariantKey, string> = {
  courage: 'Brave ideas',
  pattern: 'Spots connections',
  shield: 'Protects your calm',
  anchor: 'Helps you steady',
  fusion: 'Brings skills together',
};

type Props = {
  participantId?: string | null;
  mode?: 'settings' | 'onboarding';
  theme?: 'light' | 'game';
  onSaved?: (variant: B4VariantKey) => void;
};

function SafeB4Image({
  variant,
  state,
  alt,
  className,
}: {
  variant: B4VariantKey;
  state: B4StateKey;
  alt: string;
  className?: string;
}) {
  return <B4CircleAvatar variant={variant} state={state} alt={alt} className={className} />;
}

export default function B4VariantSelector({
  participantId,
  mode = 'settings',
  theme = 'light',
  onSaved,
}: Props) {
  const hasParticipant = Boolean(participantId?.trim());
  const { variant, loading, error, save } = useB4Variant(participantId);
  const [draft, setDraft] = useState<B4VariantKey>(variant);
  const [previewState, setPreviewState] = useState<B4StateKey>('idle');
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [draftTouched, setDraftTouched] = useState(mode !== 'onboarding');
  const timersRef = useRef<number[]>([]);
  const headingId = useId();

  useEffect(() => {
    setDraft(variant);
    setDraftTouched(mode !== 'onboarding');
  }, [mode, participantId, variant]);
  useEffect(() => () => timersRef.current.forEach((timer) => window.clearTimeout(timer)), []);

  const handleSave = async () => {
    if (!hasParticipant) return;
    setSaving(true);
    setStatus(null);
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
    try {
      const saved = await save(draft);
      setStatus(mode === 'onboarding' ? 'Your B-4 is ready!' : 'Your B-4 is saved.');
      setPreviewState('happy');
      timersRef.current.push(window.setTimeout(() => setPreviewState('blinking'), 700));
      timersRef.current.push(window.setTimeout(() => setPreviewState('idle'), 1050));
      timersRef.current.push(window.setTimeout(() => onSaved?.(saved), mode === 'onboarding' ? 1200 : 0));
    } catch (caught) {
      console.warn('[B4_VARIANT_SAVE_FAILED]', {
        error: caught instanceof Error ? caught.message : 'unknown_error',
      });
      setPreviewState('idle');
      setStatus("We couldn't save this B-4 choice. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      className={`b4VariantSelector b4VariantSelector--${mode} b4VariantSelector--${theme}`}
      aria-labelledby={headingId}
    >
      {!hasParticipant ? (
        <div className="b4VariantSelector__empty" role="status">
          <h2 id={headingId}>Choose Your B-4</h2>
          <p>Add or recover a child profile before choosing and saving their B-4.</p>
        </div>
      ) : (
        <>
          <div className="b4VariantSelector__header">
            <div>
              <h2 id={headingId}>{mode === 'onboarding' ? 'Select Your B-4 Unit' : 'Choose Your B-4'}</h2>
              <p>
                {mode === 'onboarding'
                  ? 'Every Focus Flame hero needs a B-4 companion. Choose the unit that feels most like you.'
                  : 'Pick the B-4 that feels most like you. You can change it anytime.'}
              </p>
            </div>
            <SafeB4Image
              variant={draft}
              state={previewState}
              alt={`${B4_VARIANTS[draft].name} selected preview`}
              className="b4VariantSelector__previewAvatar"
            />
          </div>
          <div className="b4VariantSelector__grid" role="radiogroup" aria-label="B-4 variants">
            {B4_VARIANT_KEYS.map((key) => {
              const item = B4_VARIANTS[key];
              const selected = draft === key;
              const descriptor = mode === 'onboarding' ? ONBOARDING_STRENGTHS[key] : item.descriptor;
              return (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={`${item.name} — ${descriptor}`}
                  className={`b4VariantSelector__card${selected ? ' is-selected' : ''}`}
                  style={{ '--b4-accent': item.accentToken } as React.CSSProperties}
                  onClick={() => {
                    setDraft(key);
                    setDraftTouched(true);
                    setPreviewState('idle');
                    setStatus(null);
                  }}
                  disabled={loading || saving}
                >
                  <SafeB4Image
                    variant={key}
                    state="idle"
                    alt=""
                    className="b4VariantSelector__cardAvatar"
                  />
                  <span className="b4VariantSelector__name">{item.name}</span>
                  <span className="b4VariantSelector__descriptor">{descriptor}</span>
                  <span className="b4VariantSelector__check" aria-hidden="true">
                    {selected ? '✓ Selected' : 'Choose'}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="b4VariantSelector__actions">
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={
                loading ||
                saving ||
                (mode === 'onboarding' && !draftTouched) ||
                (mode === 'settings' && draft === variant)
              }
            >
              {saving ? 'Saving…' : mode === 'onboarding' ? 'Choose This B-4' : 'Save B-4'}
            </button>
            {status || error ? <p role="status">{status || error}</p> : null}
          </div>
        </>
      )}
    </section>
  );
}

export { ONBOARDING_STRENGTHS, SafeB4Image };
