import React, { useEffect } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import CharacterProfilePage from '../CharacterProfilePage';
import {
  buildCharacterProfile,
  isCharacterProfileId,
} from '../../../data/characterProfiles';
import { trackEvent } from '../../../lib/analytics';
import { getPortalRoute } from '../../../lib/portalGamePaths';
import '../character-profile.css';

export default function FamilyCharacterProfilePage() {
  const { characterId = '' } = useParams();
  const location = useLocation();

  useEffect(() => {
    if (isCharacterProfileId(characterId)) {
      const profile = buildCharacterProfile(characterId, location.pathname);
      document.title = `${profile.name} | Caiden's Courage`;
      trackEvent('character_profile_viewed', { character_name: profile.name });
    }
  }, [characterId, location.pathname]);

  if (!isCharacterProfileId(characterId)) {
    return <Navigate to={getPortalRoute('characters', location.pathname)} replace />;
  }

  const profile = buildCharacterProfile(characterId, location.pathname);

  return <CharacterProfilePage profile={profile} pathname={location.pathname} />;
}
