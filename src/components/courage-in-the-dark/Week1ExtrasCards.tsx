import React from 'react';
import { Link } from 'react-router-dom';
import { PORTAL_COLORING_PAGES } from '../../data/portalDownloadAssets';
import { isWeek1GameplayComplete } from '../../lib/week1ExtrasUnlock';
import './week1-extras-cards.css';

export type Week1ExtrasPaths = {
  downloadsPath: string;
  certificatesPath: string;
  week1DiscussionHref?: string;
  week1CertificateHref?: string;
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
  comingSoon?: boolean;
};

export default function Week1ExtrasCards({
  completedMissionIds,
  paths,
  variant = 'standalone',
}: Week1ExtrasCardsProps) {
  const unlocked = isWeek1GameplayComplete(completedMissionIds);
  const caidenColoring =
    PORTAL_COLORING_PAGES.find((page) => page.id === 'caiden') ?? PORTAL_COLORING_PAGES[0];

  const cards: ExtraCardConfig[] = [
    {
      id: 'family-activity',
      title: 'Camp / Family Activity',
      description: 'Open the Week 1 discussion guide and family reflection.',
      emoji: '🏕️',
      actionLabel: paths.week1DiscussionHref ? 'Open Guide' : 'Coming soon',
      href: paths.week1DiscussionHref ?? '#',
      external: Boolean(paths.week1DiscussionHref?.startsWith('/downloads')),
      comingSoon: !paths.week1DiscussionHref,
    },
    {
      id: 'color-character',
      title: 'Color Your Character',
      description: 'Print and color Caiden’s Focus Flame adventure sheet.',
      emoji: '🎨',
      actionLabel: caidenColoring.status === 'available' ? 'Download Sheet' : 'Coming soon',
      href: caidenColoring.status === 'available' ? caidenColoring.href : '#',
      external: true,
      comingSoon: caidenColoring.status !== 'available',
    },
    {
      id: 'certificate',
      title: 'Week 1 Certificate',
      description: 'Celebrate courage with a printable Focus Flame certificate.',
      emoji: '✦',
      actionLabel: paths.week1CertificateHref ? 'Open Certificate' : 'View Certificates',
      href: paths.week1CertificateHref ?? paths.certificatesPath,
      external: Boolean(paths.week1CertificateHref?.startsWith('/downloads')),
      comingSoon: false,
    },
  ];

  return (
    <section
      className={['week1Extras', variant === 'panel' ? 'week1Extras--panel' : ''].filter(Boolean).join(' ')}
      aria-labelledby={variant === 'standalone' ? 'week1-extras-title' : undefined}
    >
      {variant === 'standalone' ? (
        <>
          <h3 id="week1-extras-title" className="week1ExtrasTitle">Week 1 Bonus Adventures</h3>
          <p className="week1ExtrasIntro">
            {unlocked
              ? 'Great work! These extras stay unlocked all week.'
              : 'Complete all Week 1 missions on the map to unlock these rewards.'}
          </p>
        </>
      ) : null}
      <div className="week1ExtrasGrid">
        {cards.map((card) => {
          const cardUnlocked = unlocked;
          const canAct = cardUnlocked && !card.comingSoon && card.href !== '#';

          const action = canAct ? (
            card.external ? (
              <a
                href={card.href}
                className="week1ExtrasCardBtn"
                download={card.id === 'color-character' ? true : undefined}
                target={card.id === 'certificate' ? '_blank' : undefined}
                rel={card.id === 'certificate' ? 'noopener noreferrer' : undefined}
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
              {cardUnlocked && card.comingSoon ? 'Coming soon' : 'Locked'}
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
              <div className="week1ExtrasCardIcon" aria-hidden="true">{card.emoji}</div>
              <h4 className="week1ExtrasCardTitle">{card.title}</h4>
              <p className="week1ExtrasCardDesc">{card.description}</p>
              {action}
              {!cardUnlocked ? (
                <span className="week1ExtrasCardLock" aria-hidden="true">🔒</span>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
