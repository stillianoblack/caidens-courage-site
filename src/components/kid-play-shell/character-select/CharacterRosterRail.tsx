import React from 'react';
import type { CharacterRosterEntry } from './types';
import './character-select.css';

type CharacterRosterRailProps = {
  entries: CharacterRosterEntry[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  ariaLabel?: string;
};

export default function CharacterRosterRail({
  entries,
  selectedId,
  onSelect,
  ariaLabel = 'Choose a character',
}: CharacterRosterRailProps) {
  return (
    <div className="kidPlayCharacterRosterRail" role="list" aria-label={ariaLabel}>
      {entries.map((entry) => {
        const isSelected = entry.id === selectedId;
        return (
          <button
            key={entry.id}
            type="button"
            role="listitem"
            className={[
              'kidPlayCharacterRosterRailItem',
              entry.themeId ? `kidPlayCharacterRosterRailItem--${entry.themeId}` : '',
              isSelected ? 'kidPlayCharacterRosterRailItem--selected' : '',
              entry.locked ? 'kidPlayCharacterRosterRailItem--locked' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => {
              if (entry.locked) return;
              onSelect?.(entry.id);
            }}
            disabled={entry.locked}
            aria-current={isSelected ? 'true' : undefined}
            aria-label={entry.name}
            title={entry.name}
          >
            <span className="kidPlayCharacterRosterRailArtWrap">
              {entry.imageSrc ? (
                <img
                  src={entry.imageSrc}
                  alt=""
                  className="kidPlayCharacterRosterRailArt"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <span className="kidPlayCharacterRosterRailArtFallback">{entry.name.charAt(0)}</span>
              )}
              {entry.complete ? (
                <span className="kidPlayCharacterRosterRailComplete" aria-hidden="true">
                  ✓
                </span>
              ) : null}
              {entry.locked ? (
                <span className="kidPlayCharacterRosterRailLock" aria-hidden="true">
                  🔒
                </span>
              ) : null}
            </span>
            <span className="kidPlayCharacterRosterRailName">{entry.name}</span>
          </button>
        );
      })}
    </div>
  );
}
