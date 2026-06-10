import React from 'react';
import './learning-moment.css';

export type AvatarContainerVariant = 'b4' | 'dr-victoria' | 'default';

export type AvatarContainerProps = {
  src: string;
  alt: string;
  variant?: AvatarContainerVariant;
  className?: string;
};

export default function AvatarContainer({
  src,
  alt,
  variant = 'default',
  className = '',
}: AvatarContainerProps) {
  return (
    <div
      className={['ds-circleAvatar', `ds-circleAvatar--${variant}`, className].filter(Boolean).join(' ')}
    >
      <img className="ds-circleAvatarImg" src={src} alt={alt} width={56} height={56} />
    </div>
  );
}
