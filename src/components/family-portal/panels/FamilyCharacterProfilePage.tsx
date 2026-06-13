import React from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { isCharacterProfileId } from '../../../data/characterProfiles';
import { getPortalRoute } from '../../../lib/portalGamePaths';

const CHARACTER_QUERY_PARAM = 'character';

/**
 * @deprecated Bio pages route to Character Hub with an inline detail panel.
 * Direct links to /characters/:id are preserved via redirect.
 */
export default function FamilyCharacterProfilePage() {
  const { characterId = '' } = useParams();
  const location = useLocation();

  if (!isCharacterProfileId(characterId)) {
    return <Navigate to={getPortalRoute('characters', location.pathname)} replace />;
  }

  const charactersPath = getPortalRoute('characters', location.pathname);
  const params = new URLSearchParams();
  params.set(CHARACTER_QUERY_PARAM, characterId);

  return <Navigate to={`${charactersPath}?${params.toString()}`} replace />;
}
