import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { PORTAL_PATH } from '../../config/courageRoutes';
import './portal-error-boundary.css';

type PortalErrorBoundaryProps = {
  children: ReactNode;
  label?: string;
};

type PortalErrorBoundaryState = {
  error: Error | null;
};

export default class PortalErrorBoundary extends Component<
  PortalErrorBoundaryProps,
  PortalErrorBoundaryState
> {
  state: PortalErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): PortalErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (process.env.NODE_ENV === 'development') {
      console.error('[PortalErrorBoundary]', error, info.componentStack);
    }
  }

  render() {
    const { error } = this.state;
    const { children, label = 'Portal' } = this.props;

    if (!error) {
      return children;
    }

    return (
      <div className="portalErrorBoundary" role="alert">
        <h1 className="portalErrorBoundaryTitle">{label} ran into a problem</h1>
        <p className="portalErrorBoundaryMessage">
          Something went wrong while loading this page. You can return to the portal and sign in
          again.
        </p>
        {process.env.NODE_ENV === 'development' ? (
          <pre className="portalErrorBoundaryDetails">{error.message}</pre>
        ) : null}
        <Link className="portalErrorBoundaryBtn" to={PORTAL_PATH}>
          Go to Portal
        </Link>
      </div>
    );
  }
}
