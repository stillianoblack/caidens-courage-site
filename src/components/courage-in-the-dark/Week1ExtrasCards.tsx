import React from 'react';
import { Link } from 'react-router-dom';
import { isWeek1GameplayComplete } from '../../lib/week1ExtrasUnlock';
import './week1-extras-cards.css';

export type Week1ExtrasPaths = {
  downloadsPath: string;
  certificatesPath: string;
  weekNumber?: number;
  week1DiscussionHref?: string;
  week1CertificateHref?: string;
  coloringPageHref?: string | null;
  comicPdfHref?: string | null;
};

type Week1ExtrasCardsProps = {
  completedMissionIds: readonly string[];
  paths: Week1ExtrasPaths;
  variant?: 'standalone' | 'panel';
};

type ExtraCardConfig = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  actionLabel: string;
  href: string;
  external?: boolean;
  status: 'available' | 'comingSoon' | 'locked';
};

function isExternalHref(href: string): boolean {
  return href.startsWith('http') || href.startsWith('/downloads');
}

export default function Week1ExtrasCards({
  completedMissionIds,
  paths,
  variant = 'standalone',
}: Week1ExtrasCardsProps) {
  const weekNumber = paths.weekNumber ?? 1;
  const missionUnlocked = isWeek1GameplayComplete(completedMissionIds);
  const panelMode = variant === 'panel';
  const coloringHref = paths.coloringPageHref?.trim() || null;
  const coloringAvailable = Boolean(coloringHref);

  const cards: ExtraCardConfig[] = [
    {
      id: 'family-activity',
      title: 'Camp / Family Activity PDF',
      description: 'Open the weekly discussion guide and family reflection.',
      emoji: '🏕️',
      actionLabel: paths.week1DiscussionHref ? 'Open PDF' : 'Coming Soon',
      href: paths.week1DiscussionHref ?? '#',
      external: paths.week1DiscussionHref ? isExternalHref(paths.week1DiscussionHref) : false,
      status: paths.week1DiscussionHref ? 'available' : 'comingSoon',
    },
    {
      id: 'color-character',
      title: 'Color Your Character PDF',
      description: 'Print and color the weekly adventure coloring sheet.',
      emoji: '🎨',
      actionLabel: coloringAvailable ? 'Download PDF' : 'Coming Soon',
      href: coloringHref ?? '#',
      external: Boolean(coloringHref),
      status: coloringAvailable ? 'available' : 'comingSoon',
    },
    {
      id: 'comic',
      title: 'Comic PDF',
      description: 'Read the printable comic adventure for this week.',
      emoji: '📖',
      actionLabel: paths.comicPdfHref ? 'Open PDF' : 'Coming Soon',
      href: paths.comicPdfHref ?? '#',
      external: Boolean(paths.comicPdfHref),
      status: paths.comicPdfHref ? 'available' : 'comingSoon',
    },
    {
      id: 'certificate',
      title: `Week ${weekNumber} Certificate`,
      description: 'Celebrate courage with a printable Focus Flame certificate.',
      emoji: '✦',
      actionLabel: paths.week1CertificateHref ? 'Open Certificate' : 'Coming Soon',
      href: paths.week1CertificateHref ?? paths.certificatesPath,
      external: paths.week1CertificateHref ? isExternalHref(paths.week1CertificateHref) : false,
      status: paths.week1CertificateHref ? 'available' : 'comingSoon',
    },
  ];

  return (
    <section
      className={['week1Extras', panelMode ? 'week1Extras--panel' : ''].filter(Boolean).join(' ')}
      aria-labelledby={panelMode ? undefined : 'week1-extras-title'}
    >
      {!panelMode ? (
        <>
          <h3 id="week1-extras-title" className="week1ExtrasTitle">
            Week {weekNumber} Bonus Adventures
          </h3>
          <p className="week1ExtrasIntro">
            {missionUnlocked
              ? 'Great work! These extras stay unlocked all week.'
              : 'Complete all Week 1 missions on the map to unlock these rewards.'}
          </p>
        </>
      ) : null}
      <div className="week1ExtrasGrid">
        {cards.map((card) => {
          const cardUnlocked = panelMode || missionUnlocked;
          const canAct = cardUnlocked && card.status === 'available' && card.href !== '#';

          const action = canAct ? (
            card.external ? (
              <a
                href={card.href}
                className="week1ExtrasCardBtn"
                target="_blank"
                rel="noopener noreferrer"
              >
                {card.actionLabel}
              </a>
            ) : (
              <Link to={card.href} className="week1ExtrasCardBtn">
                {card.actionLabel}
              </Link>
            )
          ) : (
            <span className="week1ExtrasCardBtn week1ExtrasCardBtn--disabled">
              {!cardUnlocked ? 'Locked' : card.status === 'comingSoon' ? 'Coming Soon' : 'Locked'}
            </span>
          );

          return (
            <article
              key={card.id}
              className={[
                'week1ExtrasCard',
                cardUnlocked ? 'week1ExtrasCard--unlocked' : 'week1ExtrasCard--locked',
              ].join(' ')}
            >
              <div className="week1ExtrasCardIcon" aria-hidden="true">
                {card.emoji}
              </div>
              <h4 className="week1ExtrasCardTitle">{card.title}</h4>
              <p className="week1ExtrasCardDesc">{card.description}</p>
              {action}
              {!cardUnlocked ? <span className="week1ExtrasCardLock" aria-hidden="true">🔒</span> : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
