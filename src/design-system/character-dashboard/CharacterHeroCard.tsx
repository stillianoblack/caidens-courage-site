import React from 'react';
import './character-dashboard.css';

export type CharacterHeroTheme =
  | 'caiden'
  | 'miranda'
  | 'charlie'
  | 'zeke'
  | 'b4'
  | 'victoria'
  | 'uncle-t'
  | 'default';

export type CharacterHeroCardProps = {
  imageSrc?: string;
  imageAlt: string;
  name: string;
  subtitle: string;
  description: string;
  availableCountLabel: string;
  theme?: CharacterHeroTheme;
  className?: string;
};

function HeroImage({ src, alt, theme }: { src?: string; alt: string; theme: CharacterHeroTheme }) {
  if (src) {
    return <img className="char-heroCard-image" src={src} alt={alt} loading="lazy" decoding="async" />;
  }

  return (
    <div
      className={['char-heroCard-image', 'char-heroCard-image--placeholder', `char-heroCard-image--${theme}`]
        .filter(Boolean)
        .join(' ')}
      aria-hidden="true"
    >
      {alt.charAt(0)}
    </div>
  );
}

export default function CharacterHeroCard({
  imageSrc,
  imageAlt,
  name,
  subtitle,
  description,
  availableCountLabel,
  theme = 'default',
  className = '',
}: CharacterHeroCardProps) {
  return (
    <article
      className={[
        'char-heroCard',
        theme !== 'default' ? `char-heroCard--${theme}` : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <HeroImage src={imageSrc} alt={imageAlt} theme={theme} />
      <div className="char-heroCard-body">
        <h1 className="char-heroCard-name">{name}</h1>
        <p className="char-heroCard-subtitle">{subtitle}</p>
        <p className="char-heroCard-desc">{description}</p>
        <p className="char-heroCard-count">{availableCountLabel}</p>
      </div>
    </article>
  );
}
