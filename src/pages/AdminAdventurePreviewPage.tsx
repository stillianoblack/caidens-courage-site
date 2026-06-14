import React, { useEffect } from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import { readAdminSession } from '../config/adminAccess';
import {
  buildAdminAdventurePreviewUrl,
  buildLiveAdventurePreviewUrl,
} from '../lib/adventurePreviewUrls';

/** Stable admin route that deep-links into the family hub adventure preview. */
export default function AdminAdventurePreviewPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') === 'live' ? 'live' : 'admin';
  const adventureId = id?.trim() ?? '';

  useEffect(() => {
    document.title = "Adventure Preview | Admin Portal | Caiden's Courage";
  }, []);

  if (!readAdminSession()) {
    return <Navigate to="/admin?tab=adventures" replace />;
  }

  if (!adventureId) {
    return <Navigate to="/admin?tab=adventures" replace />;
  }

  const target =
    mode === 'live'
      ? buildLiveAdventurePreviewUrl(adventureId)
      : buildAdminAdventurePreviewUrl(adventureId);

  return <Navigate to={target} replace />;
}
