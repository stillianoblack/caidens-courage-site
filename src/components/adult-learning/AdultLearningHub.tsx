import React from 'react';
import { Link } from 'react-router-dom';
import CharacterAvatar from '../game-assessment/shared/CharacterAvatar';
import {
  adultTrainingMissionPath,
  countAvailableMissions,
  type AdultGuide,
  type AdultTrainingPortal,
} from '../../types/adultTraining';
import AdultTrainingBackButton from './AdultTrainingBackButton';
import './adult-training-back-button.css';
import './adult-learning-hub.css';

type AdultLearningHubProps = {
  guide: AdultGuide;
  portal: AdultTrainingPortal;
  backPath: string;
  backLabel: string;
  embedded?: boolean;
};

export default function AdultLearningHub({
  guide,
  portal,
  backPath,
  backLabel,
  embedded = false,
}: AdultLearningHubProps) {
  const availableCount = countAvailableMissions(guide);

  return (
    <div
      className={[
        'adultLearningHub',
        `adultLearningHub--${guide.theme.hubClassName}`,
        embedded ? 'adultLearningHub--embedded' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="adultLearningHub-backRow">
        <AdultTrainingBackButton
          to={backPath}
          label={backLabel}
          theme={guide.theme.id}
          variant="inline"
        />
      </div>

      <header className="adultLearningHub-hero">
        <CharacterAvatar
          src={guide.portraitSrc}
          alt={guide.portraitAlt}
          size="large"
          theme={guide.theme.id}
          className="adultLearningHub-portrait"
        />
        <div className="adultLearningHub-heroBody">
          <p className="adultLearningHub-eyebrow">{guide.progressTrackLabel.toUpperCase()}</p>
          <h1 className="adultLearningHub-title">{guide.hubTitle}</h1>
          <p className="adultLearningHub-subtitle">{guide.hubSubtitle}</p>
          <p className="adultLearningHub-description">{guide.hubDescription}</p>
          <div className="adultLearningHub-progressPill">
            <span className="adultLearningHub-progressTrack">{guide.progressTrackLabel}</span>
            <span className="adultLearningHub-progressCount">
              {availableCount} Mission{availableCount === 1 ? '' : 's'} Available
            </span>
          </div>
        </div>
      </header>

      <section className="adultLearningHub-section" aria-labelledby="adult-learning-missions">
        <h2 id="adult-learning-missions" className="adultLearningHub-sectionTitle">
          Training Missions
        </h2>
        <div className="adultLearningHub-missionGrid">
          {guide.missions.map((mission) => {
            const missionPath = adultTrainingMissionPath(portal, guide, mission.id);
            const card = (
              <article
                className={`adultLearningHub-missionCard${
                  mission.status === 'locked'
                    ? ' adultLearningHub-missionCard--locked'
                    : ' adultLearningHub-missionCard--available'
                }`}
              >
                <div className="adultLearningHub-missionCardBanner">
                  <p className="adultLearningHub-missionNumber">Mission {mission.number}</p>
                  <span className="adultLearningHub-missionDifficulty">{mission.difficulty}</span>
                </div>
                <h3 className="adultLearningHub-missionTitle">{mission.title}</h3>
                <p className="adultLearningHub-missionDescription">{mission.description}</p>
                <p className="adultLearningHub-missionSkill">
                  <span className="adultLearningHub-missionSkillLabel">Skill focus:</span>{' '}
                  {mission.skillFocus}
                </p>
                <div className="adultLearningHub-missionFooter">
                  <span className="adultLearningHub-missionBadge">{mission.badge}</span>
                  <span
                    className={`adultLearningHub-missionStatus adultLearningHub-missionStatus--${mission.status}`}
                  >
                    {mission.status === 'available' ? 'Available' : 'Locked'}
                  </span>
                  <span className="adultLearningHub-missionCta">
                    {mission.status === 'available' ? 'Start Mission' : 'Coming Soon'}
                  </span>
                </div>
              </article>
            );

            return mission.status === 'available' ? (
              <Link key={mission.id} to={missionPath} className="adultLearningHub-missionLink">
                {card}
              </Link>
            ) : (
              <div key={mission.id} className="adultLearningHub-missionLink adultLearningHub-missionLink--locked">
                {card}
              </div>
            );
          })}

          {guide.futureMissions.map((mission) => (
            <div
              key={`future-${mission.number}`}
              className="adultLearningHub-missionLink adultLearningHub-missionLink--locked"
            >
              <article className="adultLearningHub-missionCard adultLearningHub-missionCard--locked">
                <p className="adultLearningHub-missionNumber">Mission {mission.number}</p>
                <h3 className="adultLearningHub-missionTitle">{mission.title}</h3>
                <p className="adultLearningHub-missionDescription">Coming soon in this learning track.</p>
                <div className="adultLearningHub-missionFooter">
                  <span className="adultLearningHub-missionStatus adultLearningHub-missionStatus--locked">
                    Coming Soon
                  </span>
                </div>
              </article>
            </div>
          ))}
        </div>
      </section>

      <section className="adultLearningHub-section" aria-labelledby="adult-learning-badges">
        <h2 id="adult-learning-badges" className="adultLearningHub-sectionTitle">
          Badges Earned
        </h2>
        <div className="adultLearningHub-badgesPanel">
          <p className="adultLearningHub-badgesHint">
            Complete missions to earn badges that celebrate your adult learning journey.
          </p>
          <div className="adultLearningHub-badgesList" aria-label="Available badge rewards">
            {guide.missions.map((mission) => (
              <span key={mission.id} className="adultLearningHub-badgePill">
                {mission.badge}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
