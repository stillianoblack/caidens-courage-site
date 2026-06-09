import React, { useState } from 'react';
import { createFamilyChildParticipant } from '../../lib/childProfileService';

type AddChildFormProps = {
  onAdded?: () => void;
  compact?: boolean;
};

export default function AddChildForm({ onAdded, compact = false }: AddChildFormProps) {
  const [firstName, setFirstName] = useState('');
  const [nickname, setNickname] = useState('');
  const [ageGrade, setAgeGrade] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = firstName.trim().length > 0 && !submitting;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setMessage(null);
    setError(null);

    const result = await createFamilyChildParticipant({
      firstName: firstName.trim(),
      nickname: nickname.trim() || undefined,
      ageGrade: ageGrade.trim() || undefined,
    });

    setSubmitting(false);

    if (result.success) {
      setMessage(result.message);
      setFirstName('');
      setNickname('');
      setAgeGrade('');
      onAdded?.();
      return;
    }

    setError(result.message);
  };

  return (
    <section
      className={`family-panelBlock family-addChild${compact ? ' family-addChild--compact' : ''}`}
      aria-labelledby="family-add-child-title"
    >
      <div className="family-panelBlockHead">
        <h2 id="family-add-child-title" className="family-panelBlockTitle">
          Add a Child
        </h2>
        {!compact ? (
          <p className="family-panelHelper">
            Add your child before their Before Check-In so progress shows on your family dashboard.
          </p>
        ) : null}
      </div>

      <form className="family-addChildForm" onSubmit={(event) => void handleSubmit(event)}>
        <label className="family-addChildField">
          <span className="family-addChildLabel">First name</span>
          <input
            type="text"
            className="family-addChildInput"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            autoComplete="off"
            maxLength={32}
            required
            placeholder="Alex"
          />
        </label>

        <label className="family-addChildField">
          <span className="family-addChildLabel">Nickname (optional)</span>
          <input
            type="text"
            className="family-addChildInput"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            autoComplete="off"
            maxLength={32}
            placeholder="Ace"
          />
        </label>

        <label className="family-addChildField">
          <span className="family-addChildLabel">Age or grade (optional)</span>
          <input
            type="text"
            className="family-addChildInput"
            value={ageGrade}
            onChange={(event) => setAgeGrade(event.target.value)}
            autoComplete="off"
            maxLength={24}
            placeholder="8 or 3rd grade"
          />
        </label>

        {message ? (
          <p className="family-addChildMessage family-addChildMessage--success" role="status">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="family-addChildMessage family-addChildMessage--error" role="alert">
            {error}
          </p>
        ) : null}

        <button type="submit" className="family-addChildBtn" disabled={!canSubmit}>
          {submitting ? 'Saving…' : 'Add Child'}
        </button>
      </form>
    </section>
  );
}
