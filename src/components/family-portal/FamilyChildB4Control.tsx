import React, { useState } from 'react';
import { B4_VARIANTS } from '../../data/b4/variantManifest';
import { useB4Variant } from '../../hooks/useB4Variant';
import B4VariantSelector from '../b4/B4VariantSelector';
import StartChildGameButton from './StartChildGameButton';
import B4CircleAvatar from '../b4/B4CircleAvatar';

export default function FamilyChildB4Control({
  participantId,
  displayName,
}: {
  participantId: string;
  displayName: string;
}) {
  const { variant, loading } = useB4Variant(participantId);
  const [editing, setEditing] = useState(false);
  const definition = B4_VARIANTS[variant];

  return (
    <section className="family-childB4" aria-label={`B-4 Unit for ${displayName}`}>
      <div className="family-childB4Summary">
        <B4CircleAvatar
          variant={variant}
          loading={loading}
          alt={`${definition.name} for ${displayName}`}
        />
        <div className="family-childB4Copy">
          <span className="family-childB4Label">Current B-4 Unit</span>
          <strong>{loading ? 'Loading…' : definition.name}</strong>
          <span>{definition.descriptor}</span>
        </div>
      </div>
      <div className="family-childB4Actions">
        <button
          type="button"
          className="family-settingsGhostBtn"
          onClick={() => setEditing((open) => !open)}
          aria-expanded={editing}
        >
          {editing ? 'Close B-4 Picker' : 'Change B-4'}
        </button>
        <StartChildGameButton
          participantId={participantId}
          displayName={displayName}
          label={`Play as ${displayName}`}
          className="family-childB4PlayBtn"
        />
      </div>
      {editing ? (
        <div className="family-childB4Picker">
          <B4VariantSelector participantId={participantId} onSaved={() => setEditing(false)} />
        </div>
      ) : null}
    </section>
  );
}
