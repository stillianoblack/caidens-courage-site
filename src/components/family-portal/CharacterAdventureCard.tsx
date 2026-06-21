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
  softLocked?: boolean;
  featured?: boolean;
  startHereLabel?: string;
  lockedLabel?: string;
  skillTags?: string;
  linkState?: LinkProps['state'];
  /** Tag mission links launched from Character Hub quest lists. */
  useCharacterHubLaunch?: boolean;
  /** Open Character Hub detail panel instead of navigating to bio page. */
  onMeetClick?: () => void;
};

export default function CharacterAdventureCard({
  characterId,
  title,
  description,
  cta,
  href,
  status,
  locked = false,
  softLocked = false,
  featured = false,
  startHereLabel,
  lockedLabel = 'Complete B-4 Check-In to unlock',
  skillTags,
  linkState,
  useCharacterHubLaunch = false,
  onMeetClick,
}: CharacterAdventureCardProps) {
  const isExternal = href.startsWith('/downloads') || href.startsWith('http');
  const isBlocked = locked || softLocked;
  const resolvedHref = useMemo(() => {
    if (!useCharacterHubLaunch || isExternal || href === '#') {
      return href;
    }
    return appendCharacterHubGameContext(href);
  }, [href, isExternal, useCharacterHubLaunch]);

  const useMeetPanel = Boolean(onMeetClick) && !isBlocked && !isExternal;

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
      softLocked={softLocked}
      featured={featured}
      startHereLabel={startHereLabel}
      lockedLabel={lockedLabel}
      linkState={linkState}
      external={isExternal}
      kind="game"
      onActivate={useMeetPanel ? onMeetClick : undefined}
    />
  );
}
