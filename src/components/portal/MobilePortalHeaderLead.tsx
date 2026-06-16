import React from 'react';

type MobilePortalHeaderLeadProps = {
  logoSrc: string;
  className?: string;
};

export default function MobilePortalHeaderLead({
  logoSrc,
  className = '',
}: MobilePortalHeaderLeadProps) {
  return (
    <div className={['portal-headerMobileLead', className].filter(Boolean).join(' ')}>
      <img
        src={logoSrc}
        alt=""
        aria-hidden="true"
        className="portal-headerMobileLeadLogo"
        decoding="async"
      />
    </div>
  );
}
