import React from 'react';
import { getCharacter } from '../characters/characterRegistry';
import CharacterScenarioImage, {
  type CharacterScenarioImageFit,
} from './CharacterScenarioImage';

export type SceneImageLayout = 'inline' | 'hero';

export type QuestionCardProps = {
  sceneLabel?: string;
  tag?: string;
  storyPrompt: string;
  characterId?: string;
  avatarSrc?: string;
  avatarAlt?: string;
  sceneImageSrc?: string;
  sceneImageAlt?: string;
  sceneImageFit?: CharacterScenarioImageFit;
  /** inline = compact thumb; hero = tall story panel above scenario text */
  sceneImageLayout?: SceneImageLayout;
  illustration?: React.ReactNode;
  className?: string;
};

export default function QuestionCard({
  sceneLabel = 'Scenario',
  tag,
  storyPrompt,
  characterId,
  avatarSrc,
  avatarAlt,
  sceneImageSrc,
  sceneImageAlt,
  sceneImageFit = 'contain',
  sceneImageLayout = 'inline',
  illustration,
  className = '',
}: QuestionCardProps) {
  const useSceneImage = Boolean(sceneImageSrc);
  const useHeroLayout = useSceneImage && sceneImageLayout === 'hero';
  const character = !useSceneImage && characterId ? getCharacter(characterId) : undefined;
  const src = !useSceneImage ? avatarSrc ?? character?.avatarSrc : undefined;
  const alt = avatarAlt ?? character?.displayName ?? 'Character';

  if (useHeroLayout) {
    return (
      <article
        className={['ds-questionCard', 'ds-questionCard--sceneHero', className]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="ds-questionCardHead">
          <p className="ds-questionCardLabel">{sceneLabel}</p>
          {tag ? <p className="ds-questionCardTag">{tag}</p> : null}
        </div>
        <div className="ds-questionCardHeroPanel">
          <img
            className="ds-questionCardHeroImage"
            src={sceneImageSrc}
            alt={sceneImageAlt ?? 'Gameplay scene'}
            loading="lazy"
          />
          {illustration ? (
            <div className="ds-questionCardHeroIllustration">{illustration}</div>
          ) : null}
        </div>
        <p className="ds-questionCardText">{storyPrompt}</p>
      </article>
    );
  }

  return (
    <article
      className={[
        'ds-questionCard',
        useSceneImage ? 'ds-questionCard--withSceneImage' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {useSceneImage ? (
        <CharacterScenarioImage
          src={sceneImageSrc!}
          alt={sceneImageAlt ?? 'Gameplay scene'}
          objectFit={sceneImageFit}
        />
      ) : src ? (
        <img className="ds-questionCardAvatar" src={src} alt={alt} width={48} height={48} />
      ) : null}
      <div className="ds-questionCardBody">
        <p className="ds-questionCardLabel">{sceneLabel}</p>
        {tag ? <p className="ds-questionCardTag">{tag}</p> : null}
        <p className="ds-questionCardText">{storyPrompt}</p>
        {!useSceneImage && illustration ? (
          <div className="ds-questionCardIllustration">{illustration}</div>
        ) : null}
      </div>
    </article>
  );
}
