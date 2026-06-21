import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import KidPlayFamilySoftLockGate from '../../kid-play-shell/KidPlayFamilySoftLockGate';
import { isKidPlayFamilySoftLocked } from '../../../lib/kidPlayFamilySoftLock';
import { readKidPlayFamilyResumePayload } from '../../../lib/kidPlayFamilyResume';
import { hasKidPlayReturnSessionContext } from '../../../lib/kidPlayReturnUnlock';
import { familyPortalPath } from '../../../lib/familyPortalPaths';
import { PORTAL_PATH } from '../../../config/courageRoutes';
import {
  hasActiveChildPlaySession,
  isStandaloneDisplayMode,
} from '../../../lib/pwaDisplayMode';

/**
 * Full-screen kid session pause / resume gate — used after idle timeout and PWA cold launch.
 */
export default function FamilyPlayPausePage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Child Session Paused | Caiden's Courage";
  }, []);

  useEffect(() => {
    if (!hasKidPlayReturnSessionContext()) {
      navigate(PORTAL_PATH, { replace: true });
      return;
    }

    const paused = isKidPlayFamilySoftLocked() || readKidPlayFamilyResumePayload();
    const standalone = isStandaloneDisplayMode();

    if (!paused && !standalone) {
      navigate(familyPortalPath('weekly-adventures'), { replace: true });
      return;
    }

    if (standalone && !hasActiveChildPlaySession()) {
      navigate(PORTAL_PATH, {
        replace: true,
        state: { portalMessage: 'Enter your family access code to continue.' },
      });
    }
  }, [navigate]);

  return (
    <div className="familyPlayPausePage">
      <KidPlayFamilySoftLockGate
        open
        fullscreen
        onUnlocked={() => {
          /* Routing is handled inside KidPlayFamilySoftLockGate. */
        }}
      />
    </div>
  );
}

