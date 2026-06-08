import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { isInternalAppHref } from '../../lib/appNavigation';

type AppLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
};

export default function AppLink({ href, onClick, className, children, ...rest }: AppLinkProps) {
  const location = useLocation();

  if (!isInternalAppHref(href)) {
    return (
      <a href={href} className={className} onClick={onClick} {...rest}>
        {children}
      </a>
    );
  }

  const to = href.startsWith('#')
    ? { pathname: location.pathname, search: location.search, hash: href }
    : href;

  return (
    <Link to={to} className={className} onClick={onClick} {...rest}>
      {children}
    </Link>
  );
}
