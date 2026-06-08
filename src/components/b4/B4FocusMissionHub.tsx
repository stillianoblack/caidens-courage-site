import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PortalBackButton from '../portal/PortalBackButton';
import CharacterAvatar from '../game-assessment/shared/CharacterAvatar';
import { B4_GAME_AVATAR_SRC, B4_PORTAL_HUB, B4_PORTAL_MISSIONS } from '../../data/b4/portalAssets';
import { getPortalRoute, remapPortalKidsRoute } from '../../lib/portalGamePaths';
import './b4-portal-hub.css';

export default function B4FocusMissionHub() {
  const location = useLocation();
  const missions = useMemo(
    () =>
      B4_PORTAL_MISSIONS.map((mission) => ({
        ...mission,
        route: remapPortalKidsRoute(mission.route, location.pathname),
      })),
    [location.pathname],
  );

  return (
    <div className="b4-portalHub">
      <PortalBackButton
        hubName="Character Hub"
        to={getPortalRoute('characters', location.pathname)}
        theme="b4"
      />

      <header className="b4-portalHubHeader">
        <CharacterAvatar
          src={B4_GAME_AVATAR_SRC}
          alt="B-4"
          size="large"
          theme="b4"
          className="b4-portalHubAvatar"
        />
        <p className="b4-portalHubEyebrow">FOCUS FLAME ACADEMY</p>
        <h1 className="b4-portalHubTitle">{B4_PORTAL_HUB.title}</h1>
        <p className="b4-portalHubSubtitle">{B4_PORTAL_HUB.subtitle}</p>
      </header>

      <div className="b4-portalMissionGrid">
        {missions.map((mission) => (
          <Link key={mission.id} to={mission.route} className="b4-portalMissionCard">
            <span className="b4-portalMissionCardStrip" aria-hidden="true" />
            <div className="b4-portalMissionCardBody">
              <h2 className="b4-portalMissionCardTitle">{mission.title}</h2>
              <p className="b4-portalMissionCardDesc">{mission.description}</p>
            </div>
            <span className="b4-portalMissionCardCta">
              {mission.cta}
              <span aria-hidden="true">→</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
