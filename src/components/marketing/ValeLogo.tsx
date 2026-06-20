import React from 'react';
import { CAIDEN_VALE_LOGO_SRC } from '../../design-system/brand/brandLogos';
import './vale-logo.css';

export type ValeLogoSize = 'header' | 'footer';

export type ValeLogoProps = {
  size?: ValeLogoSize;
  className?: string;
  alt?: string;
};

export default function ValeLogo({
  size = 'header',
  className = '',
  alt = 'Caiden Vale',
}: ValeLogoProps) {
  return (
    <img
      src={CAIDEN_VALE_LOGO_SRC}
      alt={alt}
      className={['logo--vale', `logo--vale--${size}`, className].filter(Boolean).join(' ')}
      decoding="async"
    />
  );
}
