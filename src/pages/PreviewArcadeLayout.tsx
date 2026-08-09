import React, { useMemo, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import KidArcadePanel from '../components/kid-play-shell/KidArcadePanel';
import KidPlayShellPage from '../components/kid-play-shell/KidPlayShellPage';
import { KidPlaySessionParticipantProvider } from '../context/ActiveParticipantContext';
import { KidPlaySessionProvider } from '../context/KidPlaySessionContext';
import { PortalSessionProvider } from '../context/PortalSessionContext';
import StoryModePage from './StoryModePage';
// Story Quest preview reuses the production question flow.
import type { KidPlaySessionRow } from '../lib/kidPlaySessionTypes';
import { ARCADE_PREVIEW_PATH } from '../config/courageRoutes';
import { B4_VARIANTS, type B4VariantKey } from '../data/b4/variantManifest';
import { B4_VARIANT_UPDATED_EVENT } from '../lib/b4VariantService';
import '../components/kid-play-shell/kid-play-shell.css';
import '../components/kid-play-shell/kid-arcade.css';
import './preview-arcade.css';

const PREVIEW_PARTICIPANT_ID = 'preview-child-grade-5';
const PREVIEW_SESSION_ID = 'preview-session';

function createPreviewSession(): KidPlaySessionRow {
  const timestamp = new Date(0).toISOString();
  return {
    id: PREVIEW_SESSION_ID,
    child_id: PREVIEW_PARTICIPANT_ID,
    participant_id: PREVIEW_PARTICIPANT_ID,
    organization_id: 'preview-organization',
    launched_by_user_id: null,
    session_source: 'facilitator_roster_launch',
    device_mode: 'shared_camp_device',
    status: 'active',
    started_at: timestamp,
    last_activity_at: timestamp,
    ended_at: null,
    ended_reason: null,
    device_label: 'Development Preview',
    resume_payload: {
      participant_display_name: 'Caiden Preview',
      participant_first_name: 'Caiden',
      participant_grade_level: '5',
      preview: true,
      reward_count: 120,
    },
    created_at: timestamp,
    updated_at: timestamp,
  };
}

function PreviewFrame({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [previewB4, setPreviewB4] = useState<B4VariantKey>('courage');
  const inStory = location.pathname.startsWith(`${ARCADE_PREVIEW_PATH}/story`);
  const changePreviewB4 = (variant: B4VariantKey) => {
    setPreviewB4(variant);
    window.dispatchEvent(new CustomEvent(B4_VARIANT_UPDATED_EVENT, {
      detail: { participantId: PREVIEW_PARTICIPANT_ID, variant, selectionRequired: false },
    }));
  };
  return (
    <div className="previewArcadeShell">
      <div className="previewArcadeMarker" role="status">
        <span>Development Preview · Caiden Preview · Grade 5</span>
        <label>Preview B-4
          <select value={previewB4} onChange={(event) => changePreviewB4(event.target.value as B4VariantKey)}>
            {Object.values(B4_VARIANTS).map((definition) => <option key={definition.key} value={definition.key}>{definition.name}</option>)}
          </select>
        </label>
        {inStory ? <Link to={ARCADE_PREVIEW_PATH}>Back to Arcade</Link> : null}
      </div>
      {children}
    </div>
  );
}

export default function PreviewArcadeLayout() {
  const session = useMemo(createPreviewSession, []);
  const storyPath = `${ARCADE_PREVIEW_PATH}/story`;

  return (
    <PortalSessionProvider>
      <KidPlaySessionParticipantProvider
        participantId={PREVIEW_PARTICIPANT_ID}
        displayName="Caiden Preview"
        firstName="Caiden"
        gradeLevel="5"
      >
        <KidPlaySessionProvider session={session} persistActivity={false}>
          <PreviewFrame>
            <Routes>
              <Route
                index
                element={
                  <KidPlayShellPage>
                    <KidArcadePanel
                      storyQuestPathOverride={storyPath}
                      b4GamePathOverride="/kids/games/b4-focus-flight"
                    />
                  </KidPlayShellPage>
                }
              />
              <Route path="story" element={<StoryModePage storyBasePathOverride={storyPath} />} />
              <Route path="story/:chapterId" element={<StoryModePage storyBasePathOverride={storyPath} />} />
              <Route path="*" element={<Navigate to={ARCADE_PREVIEW_PATH} replace />} />
            </Routes>
          </PreviewFrame>
        </KidPlaySessionProvider>
      </KidPlaySessionParticipantProvider>
    </PortalSessionProvider>
  );
}
