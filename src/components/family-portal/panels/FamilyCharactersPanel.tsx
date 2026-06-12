import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import ActiveChildSelector from '../ActiveChildSelector';
import CharacterAdventureCard from '../CharacterAdventureCard';
import {
  CHARACTER_HUB_ADULT_SECTION,
  CHARACTER_HUB_KIDS_SECTION,
  CHARACTER_HUB_PAGE,
  buildFamilyAdultGuides,
  buildFamilyKidsCharacters,
  type FamilyCharacterCard,
} from '../../../data/familyPortalContent';
import { useActiveChild } from '../../../hooks/useActiveChild';
import { useBaselineGate } from '../../../hooks/useBaselineGate';
import { useCharacterModuleProgress } from '../../../hooks/useCharacterModuleProgress';
import { useFamilyDashboardMetrics } from '../../../hooks/useFamilyDashboardMetrics';
import { resolveTrackingProgramCode } from '../../../lib/activeProgramContext';
import { getCharacterProgress } from '../../../lib/characterProgressService';
import { resolveFamilyBasePath } from '../../../lib/familyPortalNav';
import { getPortalRoute } from '../../../lib/portalGamePaths';
import { PortalPageIntro } from '../../portal-design-system';
import '../../../design-system/components/weekly-adventure-card.css';

function CharacterCardGrid({
  characters,
  baselineComplete,
  hasActiveChild,
  modules,
  baselinePath,
}: {
  characters: FamilyCharacterCard[];
  baselineComplete: boolean;
  hasActiveChild: boolean;
  modules: ReturnType<typeof useCharacterModuleProgress>['modules'];
  baselinePath: string;
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

        return (
          <CharacterAdventureCard
            key={character.id}
            characterId={character.id}
            title={character.title}
            description={character.description}
            cta={isB4CheckIn && !baselineComplete ? 'Start B-4 Baseline First' : character.cta}
            href={isB4CheckIn && !baselineComplete ? baselinePath : character.href}
            status={status}
            statusTone={gamesLocked ? 'locked' : progress?.statusTone || character.statusTone}
            skillTags={character.skillTags}
            locked={gamesLocked}
            lockedLabel={
              !hasActiveChild ? 'Select your child to begin' : 'Start B-4 Baseline First'
            }
          />
        );
      })}
    </div>
  );
}

export default function FamilyCharactersPanel() {
  const location = useLocation();
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

  return (
    <div className="family-panel family-panel--characterHub">
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
            />
          ))}
        </div>
      </section>
    </div>
  );
}
