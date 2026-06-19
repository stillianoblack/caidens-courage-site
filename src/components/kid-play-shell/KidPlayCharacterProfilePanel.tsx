import React from 'react';
import { Link } from 'react-router-dom';
import type { ResolvedCharacterProfile } from '../../data/characterProfiles';
import { appendCharacterHubGameContext } from '../../lib/weeklyAdventureRouteContext';
import {
  CHARACTER_HOTSPOT_IMAGES,
  resolveCharacterThemeId,
  type CharacterThemeId,
} from '../../design-system/kids-adventure/characterThemes';
import {
  CharacterProfilePanel,
  CharacterStatPanel,
  type CharacterSelectProfileData,
} from './character-select';
import './character-select/character-select.css';

type KidPlayCharacterProfilePanelProps = {
  profile: ResolvedCharacterProfile;
  missionsCompletedLabel: string;
  discoveriesLabel: string;
  onClose: () => void;
};

function toSelectProfile(
  profile: ResolvedCharacterProfile,
  heroSrc: string | null,
  themeId: CharacterThemeId | null,
): CharacterSelectProfileData {
  return {
    id: profile.id,
    name: profile.name,
    tagline: profile.tagline,
    imageSrc: heroSrc,
    theme: profile.theme,
    themeId,
    focusSkills: profile.powers,
    traits: [profile.specialTrait, profile.teaches].filter(Boolean),
    missionsCompleted: '',
    discoveriesUnlocked: '',
  };
}

/** Current production profile view — composes Phase 2 select primitives for future migration. */
export default function KidPlayCharacterProfilePanel({
  profile,
  missionsCompletedLabel,
  discoveriesLabel,
  onClose,
}: KidPlayCharacterProfilePanelProps) {
  const themeId = resolveCharacterThemeId(profile.id) as CharacterThemeId | null;
  const heroSrc =
    (themeId ? CHARACTER_HOTSPOT_IMAGES[themeId] : null) ?? profile.imageSrc ?? null;
  const missionHref = profile.missionsAvailable
    ? appendCharacterHubGameContext(profile.missionsPath)
    : null;

  const selectProfile = toSelectProfile(profile, heroSrc, themeId);

  return (
    <div className="kidPlayCharacterHeroProfileCompat">
      <CharacterProfilePanel
        profile={selectProfile}
        onClose={onClose}
        variant="modal"
        footer={
          missionHref ? (
            <Link to={missionHref} className="kidPlayCharacterHeroProfileCta">
              Start Mission
            </Link>
          ) : undefined
        }
      />
      <CharacterStatPanel
        themeId={themeId}
        missionsCompleted={missionsCompletedLabel}
        discoveriesUnlocked={discoveriesLabel}
        focusSkills={profile.powers}
        traits={[profile.specialTrait, profile.teaches]}
        extraFields={[{ label: 'Loves', value: profile.loves.join(' · ') }]}
      />
    </div>
  );
}
