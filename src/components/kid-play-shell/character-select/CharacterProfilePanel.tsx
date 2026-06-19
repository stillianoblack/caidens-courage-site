import React from 'react';
import type { CharacterSelectProfileData } from './types';
import './character-select.css';

type CharacterProfilePanelProps = {
  profile: CharacterSelectProfileData;
  onClose?: () => void;
  footer?: React.ReactNode;
  variant?: 'featured' | 'modal';
};

/** Large featured character panel — future full-width game profile surface. */
export default function CharacterProfilePanel({
  profile,
  onClose,
  footer,
  variant = 'featured',
}: CharacterProfilePanelProps) {
  const themeClass = profile.themeId
    ? `kidPlayCharacterProfilePanel--${profile.themeId}`
    : profile.theme
      ? `kidPlayCharacterProfilePanel--${profile.theme}`
      : '';

  return (
    <article
      className={[
        'kidPlayCharacterProfilePanel',
        themeClass,
        variant === 'modal' ? 'kidPlayCharacterProfilePanel--modal' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-labelledby={`kid-play-char-profile-${profile.id}`}
      data-character-profile-panel
    >
      {onClose ? (
        <button
          type="button"
          className="kidPlayCharacterProfilePanelClose"
          onClick={onClose}
          aria-label="Close character profile"
        >
          ×
        </button>
      ) : null}

      <div className="kidPlayCharacterProfilePanelStage" data-character-stage-slot>
        <div className="kidPlayCharacterProfilePanelSpotlight" aria-hidden="true" />
        <div className="kidPlayCharacterProfilePanelArtWrap">
          {profile.imageSrc ? (
            <img
              src={profile.imageSrc}
              alt=""
              className="kidPlayCharacterProfilePanelArt"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <span className="kidPlayCharacterProfilePanelArtFallback">{profile.name.charAt(0)}</span>
          )}
        </div>
        <div className="kidPlayCharacterProfilePanelIdentity">
          <h2 id={`kid-play-char-profile-${profile.id}`} className="kidPlayCharacterProfilePanelName">
            {profile.name}
          </h2>
          <p className="kidPlayCharacterProfilePanelTagline">{profile.tagline}</p>
        </div>
      </div>

      {footer ? <footer className="kidPlayCharacterProfilePanelFooter">{footer}</footer> : null}
    </article>
  );
}
