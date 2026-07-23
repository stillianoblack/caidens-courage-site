import React from 'react';
import {
  createRoutesFromElements,
  Navigate,
  Route,
  useRoutes,
} from 'react-router-dom';
import FamilyContinueLearningPanel from '../components/family-portal/panels/FamilyContinueLearningPanel';
import FamilyInventoryPanel from '../components/family-portal/panels/FamilyInventoryPanel';
import FamilyCharacterProfilePage from '../components/family-portal/panels/FamilyCharacterProfilePage';
import {
  B4FocusFlightPage,
  B4PortalCheckInPage,
  B4PortalFeelingFinderPage,
  B4PortalMissionPage,
  B4PortalPage,
  B4PortalWeek1Page,
  CaidenQuestHubPage,
  CaidenQuestPage,
  CharliePortalHubPage,
  CharliePortalMissionPage,
  MirandaPortalHubPage,
  MirandaPortalMissionPage,
  ZekePortalHubPage,
  ZekePortalMissionPage,
} from '../routes/lazyPages';
import KidPlayShellComingSoonPanel from '../components/kid-play-shell/KidPlayShellComingSoonPanel';
import KidPlayCharacterCollectionPanel from '../components/kid-play-shell/KidPlayCharacterCollectionPanel';
import KidArcadePanel from '../components/kid-play-shell/KidArcadePanel';
import KidPlayShellPage from '../components/kid-play-shell/KidPlayShellPage';

/** Nested kid play shell routes — missions stay under /play/session/:id/kids/... */
export const kidPlayShellChildRoutes = (
  <>
    <Route index element={<FamilyContinueLearningPanel kidPlayShell />} />
    <Route path="weekly-adventures" element={<FamilyContinueLearningPanel kidPlayShell />} />
    <Route
      path="collections"
      element={
        <KidPlayShellPage>
          <FamilyInventoryPanel kidPlayShell />
        </KidPlayShellPage>
      }
    />
    <Route path="inventory" element={<Navigate to="../collections" replace />} />
    <Route path="characters">
      <Route
        index
        element={
          <KidPlayShellPage>
            <KidPlayCharacterCollectionPanel />
          </KidPlayShellPage>
        }
      />
      <Route path=":characterId" element={<FamilyCharacterProfilePage />} />
    </Route>
    <Route path="arcade">
      <Route
        index
        element={
          <KidPlayShellPage>
            <KidArcadePanel />
          </KidPlayShellPage>
        }
      />
      <Route path="b4-focus-flight" element={<B4FocusFlightPage />} />
    </Route>
    <Route
      path="rewards"
      element={
        <KidPlayShellPage>
          <KidPlayShellComingSoonPanel moduleLabel="Rewards" />
        </KidPlayShellPage>
      }
    />
    <Route path="kids/caiden" element={<CaidenQuestHubPage />} />
    <Route path="kids/caiden/:questId" element={<CaidenQuestPage />} />
    <Route path="kids/miranda" element={<MirandaPortalHubPage />} />
    <Route path="kids/miranda/:missionId" element={<MirandaPortalMissionPage />} />
    <Route path="kids/b4" element={<B4PortalPage />} />
    <Route path="kids/b4/check-in" element={<B4PortalCheckInPage />} />
    <Route path="baseline-check" element={<B4PortalCheckInPage />} />
    <Route path="kids/b4/week-1" element={<B4PortalWeek1Page />} />
    <Route path="kids/b4/feeling-finder" element={<B4PortalFeelingFinderPage />} />
    <Route path="kids/b4/:missionId" element={<B4PortalMissionPage />} />
    <Route path="kids/charlie" element={<CharliePortalHubPage />} />
    <Route path="kids/charlie/:missionId" element={<CharliePortalMissionPage />} />
    <Route path="kids/zeke" element={<ZekePortalHubPage />} />
    <Route path="kids/zeke/:missionId" element={<ZekePortalMissionPage />} />
  </>
);

const kidPlayShellRouteObjects = createRoutesFromElements(kidPlayShellChildRoutes);

/**
 * Resolve the active child route inside the mounted Kid Play session shell.
 *
 * Keeping this route switch local prevents the app-level outlet from retaining
 * a stale child match when the URL changes between top-level Kid Portal
 * modules. The session providers and shell stay mounted while only the routed
 * content changes.
 */
export function KidPlayShellRouteContent() {
  return useRoutes(kidPlayShellRouteObjects);
}
