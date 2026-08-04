import React from 'react';
import { Link } from 'react-router-dom';
import MissionActionCard from '../../design-system/kids-adventure/MissionActionCard';
import KidsAdventureIcon from '../../design-system/kids-adventure/KidsAdventureIcon';
import {
  courageInTheDarkMissions,
  type CourageInTheDarkMission,
} from '../../data/courageInTheDarkMap';
import {
  isKidShellDisplayImageUrl,
  resolveHudThumbBackgroundStyle,
} from '../../lib/kidShellDisplayImages';
import { isWeek1GameplayComplete } from '../../lib/week1ExtrasUnlock';
import { useCourageHubAudio } from './CourageHubAudioContext';
import type { Week1ExtrasPaths } from './Week1ExtrasCards';

const HUD_ROW_SCROLL_THRESHOLD = 5;

type MissionStripProps = {
  mapMissions?: CourageInTheDarkMission[];
  isMissionComplete: (mission: CourageInTheDarkMission) => boolean;
  isMissionLocked: (mission: CourageInTheDarkMission) => boolean;
  getMissionHref?: (mission: CourageInTheDarkMission) => string | null;
  onLaunchMission: (mission: CourageInTheDarkMission) => void;
  comingSoonMissionId?: string | null;
};

export function CourageHubHudMissionStrip({
  mapMissions = courageInTheDarkMissions,
  isMissionComplete,
  isMissionLocked,
  getMissionHref,
  onLaunchMission,
  comingSoonMissionId,
}: MissionStripProps) {
  const { playClick } = useCourageHubAudio();
  const scrollRow = mapMissions.length > HUD_ROW_SCROLL_THRESHOLD;

  return (
    <ul
      className={[
        'courageHubHudStripRow',
        scrollRow ? 'courageHubHudStripRow--scroll' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {mapMissions.map((mission) => {
        const complete = isMissionComplete(mission);
        const locked = isMissionLocked(mission);
        const comingSoon = comingSoonMissionId === mission.id;
        const href = !locked && !comingSoon ? getMissionHref?.(mission) ?? null : null;
        const startLabel = complete ? 'Replay' : 'Start';
        const hasThumbnail = isKidShellDisplayImageUrl(mission.thumbnail);

        return (
          <li key={mission.id}>
            <article
              className={[
                'courageHubHudCard',
                'courageHubHudCard--mission',
                complete ? 'courageHubHudCard--complete' : '',
                locked ? 'courageHubHudCard--locked' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              data-color={mission.color}
            >
              {hasThumbnail ? (
                <div
                  className="courageHubHudCardThumb courageHubHudCardThumb--hasImage"
                  style={resolveHudThumbBackgroundStyle(mission.thumbnail)}
                  aria-hidden="true"
                />
              ) : null}
              <div className="courageHubHudCardCopy">
                <p className="courageHubHudCardTitle">{mission.label}</p>
                <p className="courageHubHudCardSub">{mission.characterName}</p>
                <p className="courageHubHudCardReward">{mission.rewardText}</p>
              </div>
              {locked ? (
                <span className="courageHubHudCardLock" aria-hidden="true">
                  <KidsAdventureIcon name="lock" size={15} />
                </span>
              ) : href ? (
                <MissionActionCard
                  themeId={mission.id}
                  label={startLabel}
                  href={href}
                  onClick={playClick}
                  className="courageHubHudCardCta"
                />
              ) : (
                <MissionActionCard
                  themeId={mission.id}
                  label={comingSoon ? 'Soon' : startLabel}
                  disabled={comingSoon}
                  onClick={() => {
                    playClick();
                    onLaunchMission(mission);
                  }}
                  className="courageHubHudCardCta"
                />
              )}
            </article>
          </li>
        );
      })}
    </ul>
  );
}

type ActivitiesStripProps = {
  completedMissionIds: readonly string[];
  paths: Week1ExtrasPaths;
};

function isExternalHref(href: string): boolean {
  return href.startsWith('http') || href.startsWith('/downloads');
}

export function CourageHubHudActivitiesStrip({
  completedMissionIds,
  paths,
}: ActivitiesStripProps) {
  const { playClick } = useCourageHubAudio();
  const weekNumber = paths.weekNumber ?? 1;
  const missionUnlocked = isWeek1GameplayComplete(completedMissionIds);
  const coloringHref = paths.coloringPageHref?.trim() || null;

  const cards = [
    {
      id: 'family-activity',
      title: 'Family Activity',
      label: 'Discussion PDF',
      emoji: '🏕️',
      actionLabel: paths.week1DiscussionHref ? 'Open' : 'Soon',
      href: paths.week1DiscussionHref ?? '#',
      external: paths.week1DiscussionHref ? isExternalHref(paths.week1DiscussionHref) : false,
      available: Boolean(paths.week1DiscussionHref),
    },
    {
      id: 'color-character',
      title: 'Coloring Page',
      label: 'Print & color',
      emoji: '🎨',
      actionLabel: coloringHref ? 'Download' : 'Soon',
      href: coloringHref ?? '#',
      external: Boolean(coloringHref),
      available: Boolean(coloringHref),
    },
    {
      id: 'comic',
      title: 'Comic',
      label: 'Read adventure',
      emoji: '📖',
      actionLabel: paths.comicPdfHref ? 'Open' : 'Soon',
      href: paths.comicPdfHref ?? '#',
      external: Boolean(paths.comicPdfHref),
      available: Boolean(paths.comicPdfHref),
    },
    {
      id: 'certificate',
      title: 'Certificate',
      label: `Week ${weekNumber} reward`,
      emoji: '✦',
      actionLabel: paths.week1CertificateHref ? 'Open' : 'Soon',
      href: paths.week1CertificateHref ?? paths.certificatesPath,
      external: paths.week1CertificateHref ? isExternalHref(paths.week1CertificateHref) : false,
      available: Boolean(paths.week1CertificateHref),
    },
  ];

  const scrollRow = cards.length > HUD_ROW_SCROLL_THRESHOLD;

  return (
    <ul
      className={[
        'courageHubHudStripRow',
        scrollRow ? 'courageHubHudStripRow--scroll' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {cards.map((card) => {
        const canAct = missionUnlocked && card.available && card.href !== '#';
        const cta = canAct ? (
          card.external ? (
            <a
              href={card.href}
              className="courageHubHudCardCta courageHubHudCardCta--link"
              target="_blank"
              rel="noopener noreferrer"
              onClick={playClick}
            >
              {card.actionLabel}
            </a>
          ) : (
            <Link to={card.href} className="courageHubHudCardCta courageHubHudCardCta--link" onClick={playClick}>
              {card.actionLabel}
            </Link>
          )
        ) : (
          <span className="courageHubHudCardCta courageHubHudCardCta--disabled">
            {!missionUnlocked ? 'Locked' : card.actionLabel}
          </span>
        );

        return (
          <li key={card.id}>
            <article
              className={[
                'courageHubHudCard',
                'courageHubHudCard--activity',
                !canAct ? 'courageHubHudCard--locked' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className="courageHubHudCardIcon" aria-hidden="true">
                {card.emoji}
              </span>
              <div className="courageHubHudCardCopy">
                <p className="courageHubHudCardTitle">{card.title}</p>
                <p className="courageHubHudCardSub">{card.label}</p>
              </div>
              {cta}
            </article>
          </li>
        );
      })}
    </ul>
  );
}
