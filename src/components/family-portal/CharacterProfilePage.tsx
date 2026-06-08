import React from 'react';
import { Link } from 'react-router-dom';
import PortalBackButton from '../portal/PortalBackButton';
import type { ResolvedCharacterProfile } from '../../data/characterProfiles';
import { getPortalRoute } from '../../lib/portalGamePaths';
import './character-profile.css';

type CharacterProfilePageProps = {
  profile: ResolvedCharacterProfile;
  pathname: string;
};

function ProfileAvatar({ profile }: { profile: ResolvedCharacterProfile }) {
  if (profile.imageSrc) {
    return (
      <img
        src={profile.imageSrc}
        alt=""
        className={`characterProfileAvatar characterProfileAvatar--${profile.theme}`}
        width={160}
        height={160}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`characterProfileAvatar characterProfileAvatar--placeholder characterProfileAvatar--${profile.theme}`}
      aria-hidden="true"
    >
      <span>{profile.name.charAt(0)}</span>
    </div>
  );
}

export default function CharacterProfilePage({ profile, pathname }: CharacterProfilePageProps) {
  const characterHubPath = getPortalRoute('characters', pathname);

  return (
    <article className={`characterProfile characterProfile--${profile.theme}`}>
      <PortalBackButton
        to={characterHubPath}
        hubName="Character Hub"
        theme={profile.theme === 'dr-victoria' ? 'victoria' : profile.theme === 'uncle-t' ? 'uncle-t' : profile.theme}
      />

      <header className="characterProfileHero">
        <ProfileAvatar profile={profile} />
        <div className="characterProfileHeroText">
          <h1 className="characterProfileName">{profile.name}</h1>
          <p className="characterProfileTagline">{profile.tagline}</p>
        </div>
      </header>

      <p className="characterProfileBio">{profile.bio}</p>

      <div className="characterProfileGrid">
        <section className="characterProfileSection">
          <h2 className="characterProfileSectionTitle">Likes</h2>
          <ul className="characterProfileList">
            {profile.likes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="characterProfileSection">
          <h2 className="characterProfileSectionTitle">Strengths</h2>
          <ul className="characterProfileList">
            {profile.strengths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="characterProfileSection">
          <h2 className="characterProfileSectionTitle">Story Role</h2>
          <p className="characterProfileSectionBody">{profile.storyRole}</p>
        </section>

        <section className="characterProfileSection">
          <h2 className="characterProfileSectionTitle">Learning Focus</h2>
          <p className="characterProfileSectionBody">{profile.learningFocus}</p>
        </section>
      </div>

      <div className="characterProfileActions">
        <div className="characterProfileActionsSecondary">
          {profile.coloringHref ? (
            <a
              href={profile.coloringHref}
              className="characterProfileBtn characterProfileBtn--secondary"
              download
            >
              Download Coloring Page
            </a>
          ) : (
            <span className="characterProfileBtn characterProfileBtn--disabled">Download Coloring Page</span>
          )}

          <Link to={profile.activitiesPath} className="characterProfileBtn characterProfileBtn--secondary">
            View Activities
          </Link>
        </div>

        {profile.missionsAvailable ? (
          <div className="characterProfileActionsPrimary">
            <Link to={profile.missionsPath} className="characterProfileBtn characterProfileBtn--primary">
              {profile.missionsLabel}
            </Link>
          </div>
        ) : null}
      </div>
    </article>
  );
}
