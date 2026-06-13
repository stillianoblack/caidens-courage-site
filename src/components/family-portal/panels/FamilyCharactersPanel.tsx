import React, { useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import ActiveChildSelector from '../ActiveChildSelector';
import CharacterAdventureCard from '../CharacterAdventureCard';
import CharacterDetailPanel from '../CharacterDetailPanel';
import {
  CHARACTER_HUB_ADULT_SECTION,
  CHARACTER_HUB_KIDS_SECTION,
  CHARACTER_HUB_PAGE,
  buildFamilyAdultGuides,
  buildFamilyKidsCharacters,
  type FamilyCharacterCard,
} from '../../../data/familyPortalContent';
import {
  buildCharacterProfile,
  isCharacterProfileId,
  type CharacterProfileId,
} from '../../../data/characterProfiles';
import { useActiveChild } from '../../../hooks/useActiveChild';
import { useBaselineGate } from '../../../hooks/useBaselineGate';
import { useCharacterModuleProgress } from '../../../hooks/useCharacterModuleProgress';
import { useFamilyDashboardMetrics } from '../../../hooks/useFamilyDashboardMetrics';
import { useFamilyMobileNav } from '../../../hooks/useFamilyMobileNav';
import { resolveTrackingProgramCode } from '../../../lib/activeProgramContext';
import { getCharacterProgress } from '../../../lib/characterProgressService';
import { buildCharacterRewardProgress } from '../../../lib/characterRewardProgress';
import { buildCharacterUnlockMore } from '../../../lib/characterUnlockMore';
import { useFocusCoinWallet } from '../../../hooks/useFocusCoinWallet';
import { resolveFamilyBasePath } from '../../../lib/familyPortalNav';
import { getPortalRoute } from '../../../lib/portalGamePaths';
import { PortalPageIntro } from '../../portal-design-system';
import '../../../design-system/components/weekly-adventure-card.css';
import '../character-detail-panel.css';

const CHARACTER_QUERY_PARAM = 'character';

function CharacterCardGrid({
  characters,
  baselineComplete,
  hasActiveChild,
  modules,
  baselinePath,
  onMeetCharacter,
}: {
  characters: FamilyCharacterCard[];
  baselineComplete: boolean;
  hasActiveChild: boolean;
  modules: ReturnType<typeof useCharacterModuleProgress>['modules'];
  baselinePath: string;
  onMeetCharacter: (id: CharacterProfileId) => void;
}) {
  return (
    <div className="weeklyAdventureCardGrid">
      {characters.map((character) => {
        const isB4CheckIn = character.id === 'b4';
        const progress = getCharacterProgress(character.id, modules);
        const gamesLocked = !hasActiveChild || (!baselineComplete && !isB4CheckIn);
        const status =
          isB4CheckIn && !baselineComplete
            ? 'Start B-4 Baseline First'
            : gamesLocked
              ? 'Start B-4 Baseline First'
              : progress?.statusLine || character.status;

        const isBaselineLaunch = isB4CheckIn && !baselineComplete;
        const meetLocked = gamesLocked && !isBaselineLaunch;

        return (
          <CharacterAdventureCard
            key={character.id}
            characterId={character.id}
            title={character.title}
            description={character.description}
            cta={isB4CheckIn && !baselineComplete ? 'Start B-4 Baseline First' : character.cta}
            href={isBaselineLaunch ? baselinePath : character.href}
            status={status}
            statusTone={gamesLocked ? 'locked' : progress?.statusTone || character.statusTone}
            skillTags={character.skillTags}
            locked={meetLocked}
            lockedLabel={
              !hasActiveChild ? 'Select your child to begin' : 'Start B-4 Baseline First'
            }
            onMeetClick={
              !meetLocked && isCharacterProfileId(character.id)
                ? () => onMeetCharacter(character.id)
                : undefined
            }
          />
        );
      })}
    </div>
  );
}

export default function FamilyCharactersPanel() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isMobileNav } = useFamilyMobileNav();
  const shellBase = resolveFamilyBasePath(location.pathname);
  const programCode = resolveTrackingProgramCode() ?? undefined;
  const { visibleChildren, claimRequired, loading } = useFamilyDashboardMetrics(programCode);

  const selectableChildren = useMemo(
    () =>
      visibleChildren
        .map((child) => ({
          participantId: child.studentId,
          displayName: child.displayName,
          firstName: child.displayName,
        }))
        .filter((child) => Boolean(child.participantId)),
    [visibleChildren],
  );

  const { activeChild, hasActiveChild, needsChildSelection, selectChild } =
    useActiveChild(selectableChildren);
  const { complete: baselineComplete, loading: baselineLoading } = useBaselineGate(
    activeChild?.participantId,
  );

  const kidsCharacters = useMemo(() => buildFamilyKidsCharacters(shellBase), [shellBase]);
  const adultGuides = useMemo(() => buildFamilyAdultGuides(shellBase), [shellBase]);
  const hasChildren = selectableChildren.length > 0;
  const baselinePath = getPortalRoute('baseline-check', location.pathname);
  const { modules } = useCharacterModuleProgress('miranda', activeChild?.participantId);
  const { totalCoins } = useFocusCoinWallet();

  const queryCharacterId = searchParams.get(CHARACTER_QUERY_PARAM);
  const selectedCharacterId: CharacterProfileId | null =
    queryCharacterId && isCharacterProfileId(queryCharacterId) ? queryCharacterId : null;

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

  const openCharacterDetail = (id: CharacterProfileId) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set(CHARACTER_QUERY_PARAM, id);
        return next;
      },
      { replace: true },
    );
  };

  const closeCharacterDetail = () => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete(CHARACTER_QUERY_PARAM);
        return next;
      },
      { replace: true },
    );
  };

  const layoutClass = 'family-characterHubLayout';

  return (
    <div className="family-panel family-panel--characterHub">
      <div className={layoutClass}>
        <div className="family-characterHubMain">
          <PortalPageIntro className="family-characterHubIntro">
            {CHARACTER_HUB_PAGE.subtitle}
          </PortalPageIntro>

          {!loading && claimRequired ? (
            <p className="family-panelHelper family-panelHelper--prominent" role="status">
              Enter Parent/Guardian Email to Find Your Child.
            </p>
          ) : null}

          {!loading && !claimRequired && !hasChildren ? (
            <p className="family-panelHelper family-panelHelper--prominent" role="status">
              Add your child to begin.
            </p>
          ) : null}

          {needsChildSelection ? (
            <ActiveChildSelector
              children={selectableChildren}
              activeParticipantId={activeChild?.participantId}
              onSelect={selectChild}
            />
          ) : null}

          <section className="family-characterHubSection" aria-labelledby="kids-characters-heading">
            <header className="family-characterHubSectionHead">
              <h3 id="kids-characters-heading" className="family-characterHubSectionTitle">
                {CHARACTER_HUB_KIDS_SECTION.title}
              </h3>
              <p className="family-characterHubSectionDesc">{CHARACTER_HUB_KIDS_SECTION.description}</p>
            </header>
            <CharacterCardGrid
              characters={kidsCharacters}
              baselineComplete={!baselineLoading && baselineComplete}
              hasActiveChild={hasActiveChild}
              modules={modules}
              baselinePath={baselinePath}
              onMeetCharacter={openCharacterDetail}
            />
          </section>

          <section className="family-characterHubSection" aria-labelledby="adult-guides-heading">
            <header className="family-characterHubSectionHead">
              <h3 id="adult-guides-heading" className="family-characterHubSectionTitle">
                {CHARACTER_HUB_ADULT_SECTION.title}
              </h3>
              <p className="family-characterHubSectionDesc">{CHARACTER_HUB_ADULT_SECTION.description}</p>
            </header>
            <div className="weeklyAdventureCardGrid">
              {adultGuides.map((character) => (
                <CharacterAdventureCard
                  key={character.id}
                  characterId={character.id}
                  title={character.title}
                  description={character.description}
                  cta={character.cta}
                  href={character.href}
                  status={character.status}
                  statusTone={character.statusTone}
                  skillTags={character.skillTags}
                  onMeetClick={
                    isCharacterProfileId(character.id)
                      ? () => openCharacterDetail(character.id)
                      : undefined
                  }
                />
              ))}
            </div>
          </section>
        </div>

        {detailProfile && !isMobileNav ? (
          <CharacterDetailPanel
            profile={detailProfile}
            variant="inspector"
            open={Boolean(detailProfile)}
            onClose={closeCharacterDetail}
            rewardProgress={detailRewardProgress}
            unlockMore={detailUnlockMore}
          />
        ) : null}
      </div>

      {detailProfile && isMobileNav ? (
        <CharacterDetailPanel
          profile={detailProfile}
          variant="sheet"
          open={Boolean(detailProfile)}
          onClose={closeCharacterDetail}
          rewardProgress={detailRewardProgress}
          unlockMore={detailUnlockMore}
        />
      ) : null}
    </div>
  );
}
