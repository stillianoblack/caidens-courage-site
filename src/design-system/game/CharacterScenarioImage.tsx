import React from 'react';

export type CharacterScenarioImageFit = 'contain' | 'cover';

export type CharacterScenarioImageProps = {
  src: string;
  alt: string;
  objectFit?: CharacterScenarioImageFit;
  className?: string;
};

export default function CharacterScenarioImage({
  src,
  alt,
  objectFit = 'contain',
  className = '',
}: CharacterScenarioImageProps) {
  return (
    <img
      className={[
        'ds-characterScenarioImage',
        objectFit === 'cover' ? 'ds-characterScenarioImage--cover' : 'ds-characterScenarioImage--contain',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      src={src}
      alt={alt}
      loading="lazy"
    />
  );
}
