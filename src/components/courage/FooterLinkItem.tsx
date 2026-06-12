import React from 'react';
import { Link } from 'react-router-dom';
import type { CourageNavLink } from '../../config/courageNav';
import PilotAccessNavLink from './PilotAccessNavLink';

type FooterLink = CourageNavLink & { external?: boolean };

function FooterLinkItem({ link }: { link: FooterLink }) {
  const className = 'text-sm text-white/70 transition-colors hover:text-white';

  if (link.external) {
    return (
      <a href={link.href} rel="noopener noreferrer" className={className}>
        {link.label}
      </a>
    );
  }

  if (link.pilotInterest) {
    return (
      <PilotAccessNavLink
        label={link.label}
        className={`${className} text-left`}
        interestType={link.pilotInterest}
        clickSource="footer_nav"
      />
    );
  }

  return (
    <Link to={link.href} className={className}>
      {link.label}
    </Link>
  );
}

export default FooterLinkItem;
