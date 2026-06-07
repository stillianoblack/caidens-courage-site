import React from 'react';
import { Link } from 'react-router-dom';
import PortalSmartBackButton from '../family-portal/PortalSmartBackButton';
import { B4_GAME_AVATAR_SRC, B4_PORTAL_HUB, B4_PORTAL_MISSIONS } from '../../data/b4/portalAssets';
import './b4-portal-hub.css';

export default function B4FocusMissionHub() {
  return (
    <div className="b4-portalHub">
      <PortalSmartBackButton variant="inline" />

      <header className="b4-portalHubHeader">
        <img
          src={B4_GAME_AVATAR_SRC}
          alt="B-4"
          className="b4-portalHubAvatar"
          width={96}
          height={96}
        />
        <p className="b4-portalHubEyebrow">FOCUS FLAME ACADEMY</p>
        <h1 className="b4-portalHubTitle">{B4_PORTAL_HUB.title}</h1>
        <p className="b4-portalHubSubtitle">{B4_PORTAL_HUB.subtitle}</p>
      </header>

      <div className="b4-portalMissionGrid">
        {B4_PORTAL_MISSIONS.map((mission) => (
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
