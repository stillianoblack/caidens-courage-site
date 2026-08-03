import React from 'react';
import { Link } from 'react-router-dom';
import { PORTAL_PATH } from '../../config/courageRoutes';
import './portal-access-required.css';

type PortalAccessRequiredProps = {
  message?: string;
  showRetry?: boolean;
  linkLabel?: string;
};

export default function PortalAccessRequired({
  message = 'Enter your access code to continue',
  showRetry = false,
  linkLabel = 'Enter your access code to continue',
}: PortalAccessRequiredProps) {
  return (
    <div className="portalAccessRequired" role="status">
      <p className="portalAccessRequiredMessage">{message}</p>
      {showRetry ? (
        <button
          className="portalAccessRequiredBtn portalAccessRequiredBtn--secondary"
          type="button"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      ) : null}
      <Link className="portalAccessRequiredBtn" to={PORTAL_PATH}>
        {linkLabel}
      </Link>
    </div>
  );
}
