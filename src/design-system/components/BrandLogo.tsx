import React from 'react';
import {
  BRAND_LOGO_ALTS,
  resolveBrandLogoSrc,
  type BrandLogoVariant,
} from '../brand/brandLogos';
import './brand-logo.css';

export type BrandLogoSize = 'portalIcon' | 'portalWordmark' | 'marketingHeader' | 'accessCode';

export type BrandLogoProps = {
  variant?: BrandLogoVariant;
  size?: BrandLogoSize;
  className?: string;
  alt?: string;
  decorative?: boolean;
};

function resolveSize(variant: BrandLogoVariant, size?: BrandLogoSize): BrandLogoSize {
  if (size) return size;
  if (variant === 'facilitator') return 'portalIcon';
  return 'portalWordmark';
}

export default function BrandLogo({
  variant = 'marketing',
  size,
  className = '',
  alt,
  decorative = false,
}: BrandLogoProps) {
  const resolvedSize = resolveSize(variant, size);
  const src = resolveBrandLogoSrc(variant, resolvedSize);
  const label = alt ?? BRAND_LOGO_ALTS[variant];

  return (
    <img
      src={src}
      alt={decorative ? '' : label}
      aria-hidden={decorative || undefined}
      className={['ds-brandLogo', `ds-brandLogo--${resolvedSize}`, className].filter(Boolean).join(' ')}
      decoding="async"
    />
  );
}
