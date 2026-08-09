import React, { useEffect, useState } from 'react';
import {
  B4_VARIANTS,
  isB4VariantKey,
  type B4StateKey,
  type B4VariantKey,
} from '../../data/b4/variantManifest';
import './b4-circle-avatar.css';

type B4CircleAvatarProps = {
  variant?: string | null;
  state?: B4StateKey;
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  alt?: string;
  className?: string;
};

export default function B4CircleAvatar({
  variant,
  state = 'idle',
  size = 'medium',
  loading = false,
  alt = '',
  className = '',
}: B4CircleAvatarProps) {
  const validVariant: B4VariantKey | null =
    variant === 'spark' ? 'courage' : isB4VariantKey(variant) ? variant : null;
  const requestedSrc = validVariant ? B4_VARIANTS[validVariant].states[state].src : null;
  const [assetFailed, setAssetFailed] = useState(false);

  useEffect(() => setAssetFailed(false), [requestedSrc]);

  const showPlaceholder = loading || !requestedSrc || assetFailed;

  return (
    <span
      className={`b4CircleAvatar b4CircleAvatar--${size}${showPlaceholder ? ' b4CircleAvatar--placeholder' : ''}${className ? ` ${className}` : ''}`}
      aria-busy={loading || undefined}
    >
      {showPlaceholder ? (
        <span className="b4CircleAvatar__placeholder" aria-hidden="true">
          {loading ? '' : 'B-4'}
        </span>
      ) : (
        <span className="b4CircleAvatar__imageStage">
          <img
            src={requestedSrc}
            alt={alt}
            className="b4CircleAvatar__image"
            decoding="async"
            onError={() => setAssetFailed(true)}
          />
        </span>
      )}
    </span>
  );
}
