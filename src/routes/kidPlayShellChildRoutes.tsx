import React from 'react';
import { Navigate, Route } from 'react-router-dom';
import FamilyContinueLearningPanel from '../components/family-portal/panels/FamilyContinueLearningPanel';
import FamilyInventoryPanel from '../components/family-portal/panels/FamilyInventoryPanel';
import FamilyCharacterProfilePage from '../components/family-portal/panels/FamilyCharacterProfilePage';
import {
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
    <Route
      path="arcade"
      element={
        <KidPlayShellPage>
          <KidPlayShellComingSoonPanel moduleLabel="Arcade" />
        </KidPlayShellPage>
      }
    />
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
