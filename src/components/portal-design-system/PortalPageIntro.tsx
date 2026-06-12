import React from 'react';

export type PortalPageIntroProps = {
  children: React.ReactNode;
  className?: string;
};

/** Supporting copy directly under the portal top-bar title — not a duplicate page heading. */
export default function PortalPageIntro({ children, className = '' }: PortalPageIntroProps) {
  return (
    <p className={['portal-pageIntro', className].filter(Boolean).join(' ')}>
      {children}
    </p>
  );
}
