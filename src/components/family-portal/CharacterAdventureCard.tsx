import React, { useMemo } from 'react';
import WeeklyAdventureCard from '../../design-system/components/WeeklyAdventureCard';
import type { FamilyCharacterId } from '../../data/familyPortalContent';
import { appendCharacterHubGameContext } from '../../lib/weeklyAdventureRouteContext';
import type { LinkProps } from 'react-router-dom';

export type CharacterAdventureCardProps = {
  characterId: FamilyCharacterId;
  title: string;
  description: string;
  cta: string;
  href: string;
  status?: string;
  statusTone?: 'available' | 'locked' | 'complete' | 'review';
  layout?: 'vertical' | 'horizontal';
  locked?: boolean;
  lockedLabel?: string;
  skillTags?: string;
  linkState?: LinkProps['state'];
  /** Tag mission links launched from Character Hub quest lists. */
  useCharacterHubLaunch?: boolean;
};

export default function CharacterAdventureCard({
  characterId,
  title,
  description,
  cta,
  href,
  status,
  locked = false,
  lockedLabel = 'Complete B-4 Check-In to unlock',
  skillTags,
  linkState,
  useCharacterHubLaunch = false,
}: CharacterAdventureCardProps) {
  const isExternal = href.startsWith('/downloads') || href.startsWith('http');
  const resolvedHref = useMemo(() => {
    if (!useCharacterHubLaunch || isExternal || href === '#') {
      return href;
    }
    return appendCharacterHubGameContext(href);
  }, [href, isExternal, useCharacterHubLaunch]);

  return (
    <WeeklyAdventureCard
      character={characterId}
      title={title}
      description={description}
      skillTags={skillTags}
      cta={cta}
      href={resolvedHref}
      status={status}
      locked={locked}
      lockedLabel={lockedLabel}
      linkState={linkState}
      external={isExternal}
      kind="game"
    />
  );
}
