import React from 'react';
import { Link } from 'react-router-dom';
import { PORTAL_PATH } from '../../config/courageRoutes';
import './portal-access-required.css';

type PortalAccessRequiredProps = {
  message?: string;
};

export default function PortalAccessRequired({
  message = 'Enter your access code to continue',
}: PortalAccessRequiredProps) {
  return (
    <div className="portalAccessRequired" role="status">
      <p className="portalAccessRequiredMessage">{message}</p>
      <Link className="portalAccessRequiredBtn" to={PORTAL_PATH}>
        Enter your access code to continue
      </Link>
    </div>
  );
}
