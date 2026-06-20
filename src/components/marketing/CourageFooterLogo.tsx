import React from 'react';
import { MARKETING_FOOTER_LOGO_SRC } from '../../design-system/brand/brandLogos';

/** Marketing footer only — gold square + white Courage mark + white wordmark (native SVG fills). */
export default function CourageFooterLogo({ className = '' }: { className?: string }) {
  return (
    <img
      src={MARKETING_FOOTER_LOGO_SRC}
      alt="Caiden's Courage"
      className={['courage-footer-logo-img', className].filter(Boolean).join(' ')}
      style={{ height: 48, width: 'auto', maxWidth: '9.5rem' }}
      decoding="async"
    />
  );
}
