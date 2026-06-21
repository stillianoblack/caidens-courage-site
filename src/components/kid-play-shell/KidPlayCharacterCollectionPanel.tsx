import React, { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { buildFamilyKidsCharacters } from '../../data/familyPortalContent';
import {
  buildCharacterProfile,
  isCharacterProfileId,
  type CharacterProfileId,
} from '../../data/characterProfiles';
import { useActiveParticipant } from '../../hooks/useActiveParticipant';
import { useBaselineGate } from '../../hooks/useBaselineGate';
import { useCharacterModuleProgress } from '../../hooks/useCharacterModuleProgress';
import { useChildRewardCompletion } from '../../hooks/useChildRewardCompletion';
import { useFamilyAdventureModules } from '../../hooks/useAdventureModules';
import { useFocusCoinWallet } from '../../hooks/useFocusCoinWallet';
import { getCharacterProgress } from '../../lib/characterProgressService';
import { buildCharacterRewardProgress } from '../../lib/characterRewardProgress';
import { buildCharacterUnlockMore } from '../../lib/characterUnlockMore';
import { resolveBaselineCheckInRoute } from '../../lib/baselineCheckInMission';
import { kidPlayShellNavigate } from '../../lib/kidShellNav';
import { getPortalRoute, resolvePortalKidsBasePath } from '../../lib/portalGamePaths';
import { resolveFamilyBasePath } from '../../lib/familyPortalNav';
import {
  resolveCharacterThemeId,
  type CharacterThemeId,
} from '../../design-system/kids-adventure/characterThemes';
import CharacterArtImage from '../../design-system/kids-adventure/CharacterArtImage';
import './kid-play-character-collection.css';
import './kid-play-character-sheet.css';

const CharacterProfilePanel = lazy(
  () => import('../../design-system/components/CharacterProfilePanel'),
);

const KID_CHARACTER_IDS = ['caiden', 'miranda', 'b4', 'charlie', 'zeke'] as const;
const CHARACTER_QUERY_PARAM = 'character';

type KidCharacterId = (typeof KID_CHARACTER_IDS)[number];

function isKidCharacterId(value: string): value is KidCharacterId {
  return (KID_CHARACTER_IDS as readonly string[]).includes(value);
}

export default function KidPlayCharacterCollectionPanel() {
  const location = useLocation();
  const navigate = useNavigate();
  const shellBase = resolveFamilyBasePath(location.pathname);
  const kidsBase = resolvePortalKidsBasePath(location.pathname);
  const { participantId } = useActiveParticipant();
  const { modules: adventureModules } = useFamilyAdventureModules();
  const { modules } = useCharacterModuleProgress('miranda', participantId);
  const { snapshot } = useChildRewardCompletion({
    participantId,
    cmsModules: adventureModules,
  });
  const { complete: baselineComplete } = useBaselineGate(participantId);
  const { totalCoins } = useFocusCoinWallet();

  useEffect(() => {
    void import('../../design-system/components/CharacterProfilePanel');
  }, []);

  const characters = useMemo(() => buildFamilyKidsCharacters(shellBase), [shellBase]);

  const queryCharacterId = useMemo(() => {
    const rawCharacterId = new URLSearchParams(location.search).get(CHARACTER_QUERY_PARAM);
    return rawCharacterId && isCharacterProfileId(rawCharacterId) ? rawCharacterId : null;
  }, [location.search]);

  const [selectedCharacterId, setSelectedCharacterId] = useState<CharacterProfileId | null>(
    queryCharacterId,
  );

  useEffect(() => {
    setSelectedCharacterId(queryCharacterId);
  }, [queryCharacterId]);

  const detailProfile = useMemo(() => {
    if (!selectedCharacterId) return null;
    return buildCharacterProfile(selectedCharacterId, location.pathname);
  }, [location.pathname, selectedCharacterId]);

  const detailRewardProgress = useMemo(() => {
    if (!selectedCharacterId) {
      return buildCharacterRewardProgress('caiden', null);
    }
    const progress = getCharacterProgress(selectedCharacterId, modules);
    return buildCharacterRewardProgress(selectedCharacterId, progress);
  }, [modules, selectedCharacterId]);

  const detailUnlockMore = useMemo(() => {
    if (!selectedCharacterId) {
      return buildCharacterUnlockMore('caiden', null, totalCoins);
    }
    const progress = getCharacterProgress(selectedCharacterId, modules);
    return buildCharacterUnlockMore(selectedCharacterId, progress, totalCoins);
  }, [modules, selectedCharacterId, totalCoins]);

  const replaceCharacterQuery = useCallback(
    (id: CharacterProfileId | null) => {
      if (typeof window === 'undefined') return;
      const next = new URLSearchParams(location.search);
      if (id) {
        next.set(CHARACTER_QUERY_PARAM, id);
      } else {
        next.delete(CHARACTER_QUERY_PARAM);
      }
      const nextSearch = next.toString() ? `?${next.toString()}` : '';
      window.history.replaceState(
        window.history.state,
        '',
        `${location.pathname}${nextSearch}${location.hash}`,
      );
    },
    [location.hash, location.pathname, location.search],
  );

  const openCharacterDetail = useCallback(
    (id: CharacterProfileId) => {
      setSelectedCharacterId(id);
      replaceCharacterQuery(id);
    },
    [replaceCharacterQuery],
  );

  const closeCharacterDetail = useCallback(() => {
    setSelectedCharacterId(null);
    replaceCharacterQuery(null);
  }, [replaceCharacterQuery]);

  const handleMeetCharacter = useCallback(
    (characterId: KidCharacterId) => {
      const isB4 = characterId === 'b4';
      if (!baselineComplete && !isB4) {
        kidPlayShellNavigate(navigate, getPortalRoute('baseline-check', location.pathname));
        return;
      }
      if (isB4 && !baselineComplete) {
        kidPlayShellNavigate(navigate, resolveBaselineCheckInRoute(kidsBase, location.pathname));
        return;
      }
      if (isCharacterProfileId(characterId)) {
        openCharacterDetail(characterId);
        return;
      }
      kidPlayShellNavigate(navigate, `${kidsBase}/${characterId}`);
    },
    [baselineComplete, kidsBase, location.pathname, navigate, openCharacterDetail],
  );

  return (
    <>
      <div className="kidPlayCharacterCollection">
        <header className="kidPlayCharacterCollectionHeader">
          <h1 className="kidPlayShellPageTitle">Characters</h1>
          <p className="kidPlayCharacterCollectionSubtitle">
            Meet the heroes you unlock through missions and discoveries.
          </p>
        </header>

        <div className="kidPlayCharacterCollectionGrid" role="list">
          {characters
            .filter((card) => isKidCharacterId(card.id))
            .map((card) => {
              const characterId = card.id as KidCharacterId;
              const themeId = resolveCharacterThemeId(characterId) as CharacterThemeId | null;
              const progress = getCharacterProgress(characterId, modules);
              const discoveryCount = snapshot?.discoveryCountByCharacter[characterId] ?? 0;
              const isB4 = characterId === 'b4';
              const locked = !baselineComplete && !isB4;
              const isComplete = progress.statusTone === 'complete';

              const completionLabel =
                progress.completedCount > 0
                  ? `${progress.completedCount} / ${progress.totalCount} missions`
                  : `${progress.totalCount} missions`;

              const canOpenProfile = !locked || isB4;

              return (
                <article
                  key={card.id}
                  className={[
                    'kidPlayCharacterCollectionCard',
                    themeId ? `kidPlayCharacterCollectionCard--${themeId}` : '',
                    locked ? 'kidPlayCharacterCollectionCard--locked' : '',
                    isComplete ? 'kidPlayCharacterCollectionCard--complete' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  role="listitem"
                >
                  <div className="kidPlayCharacterCollectionArtWrap">
                    <CharacterArtImage
                      characterId={characterId}
                      variant="discovery"
                      locked={locked}
                      className="kidPlayCharacterCollectionArt"
                    />
                    {isComplete ? (
                      <span
                        className="kidPlayCharacterCollectionCompleteMark"
                        aria-label="All missions complete"
                      >
                        ✓
                      </span>
                    ) : null}
                    {locked ? (
                      <span className="kidPlayCharacterCollectionLockMark" aria-hidden="true">
                        🔒
                      </span>
                    ) : null}
                  </div>

                  <div className="kidPlayCharacterCollectionCopy">
                    {canOpenProfile ? (
                      <button
                        type="button"
                        className="kidPlayCharacterCollectionNameBtn"
                        onClick={() => handleMeetCharacter(characterId)}
                      >
                        {card.title}
                      </button>
                    ) : (
                      <h2 className="kidPlayCharacterCollectionName">{card.title}</h2>
                    )}
                    <p className="kidPlayCharacterCollectionDesc">{card.description}</p>
                    <p className="kidPlayCharacterCollectionStats">
                      <span>{completionLabel}</span>
                      {discoveryCount > 0 ? (
                        <span className="kidPlayCharacterCollectionDiscoveryStat">
                          {discoveryCount} discover{discoveryCount === 1 ? 'y' : 'ies'}
                        </span>
                      ) : null}
                    </p>
                    <button
                      type="button"
                      className="kidPlayCharacterCollectionCta"
                      disabled={locked && !isB4}
                      onClick={() => handleMeetCharacter(characterId)}
                    >
                      {isB4 && !baselineComplete ? 'Start B-4 Check-In' : `Meet ${card.title}`}
                    </button>
                  </div>
                </article>
              );
            })}
        </div>
      </div>

      {detailProfile ? (
        <Suspense fallback={null}>
          <CharacterProfilePanel
            profile={detailProfile}
            open
            onClose={closeCharacterDetail}
            rewardProgress={detailRewardProgress}
            unlockMore={detailUnlockMore}
            variant="kidShell"
          />
        </Suspense>
      ) : null}
    </>
  );
}
