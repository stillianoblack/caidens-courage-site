import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PortalBackButton from '../portal/PortalBackButton';
import CharacterAvatar from '../game-assessment/shared/CharacterAvatar';
import { CHARLIE_AVATAR_SRC, CHARLIE_HUB, CHARLIE_HUB_MISSIONS } from '../../data/charlie';
import { getPortalRoute, remapPortalKidsRoute } from '../../lib/portalGamePaths';
import './charlie-hub.css';

export default function CharlieNatureNookHub() {
  const location = useLocation();
  const missions = useMemo(
    () =>
      CHARLIE_HUB_MISSIONS.map((mission) => ({
        ...mission,
        route: remapPortalKidsRoute(mission.route, location.pathname),
      })),
    [location.pathname],
  );

  return (
    <div className="charlie-hub">
      <PortalBackButton
        hubName="Character Hub"
        to={getPortalRoute('characters', location.pathname)}
        theme="charlie"
      />

      <header className="charlie-hubHeader">
        <CharacterAvatar
          src={CHARLIE_AVATAR_SRC}
          alt="Charlie Perk"
          size="large"
          theme="charlie"
          className="charlie-hubAvatar"
        />
        <p className="charlie-hubEyebrow">{CHARLIE_HUB.eyebrow}</p>
        <h1 className="charlie-hubTitle">{CHARLIE_HUB.title}</h1>
        <p className="charlie-hubSubtitle">{CHARLIE_HUB.subtitle}</p>
        <p className="charlie-hubIntro">{CHARLIE_HUB.intro}</p>
      </header>

      <div className="charlie-hubMissionGrid">
        {missions.map((mission) =>
          mission.status === 'available' ? (
            <Link key={mission.id} to={mission.route} className="charlie-hubMissionCard charlie-hubMissionCard--available">
              <span className="charlie-hubMissionStrip" aria-hidden="true" />
              <div className="charlie-hubMissionBody">
                <p className="charlie-hubMissionNumber">Mission {mission.number}</p>
                <h2 className="charlie-hubMissionTitle">{mission.title}</h2>
                <p className="charlie-hubMissionDesc">{mission.description}</p>
                <p className="charlie-hubMissionSkill">
                  <span>Skill:</span> {mission.skillFocus}
                </p>
                <span className="charlie-hubMissionDifficulty">{mission.difficulty}</span>
              </div>
              <span className="charlie-hubMissionCta">
                Start Mission
                <span aria-hidden="true">→</span>
              </span>
            </Link>
          ) : (
            <div
              key={mission.id}
              className="charlie-hubMissionCard charlie-hubMissionCard--locked"
            >
              <span className="charlie-hubMissionStrip" aria-hidden="true" />
              <div className="charlie-hubMissionBody">
                <p className="charlie-hubMissionNumber">Mission {mission.number}</p>
                <h2 className="charlie-hubMissionTitle">{mission.title}</h2>
                <p className="charlie-hubMissionDesc">{mission.description}</p>
              </div>
              <span className="charlie-hubMissionCta charlie-hubMissionCta--locked">Coming Soon</span>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
