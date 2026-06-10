import React, { Suspense, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DesignSystemErrorBoundary from '../components/design-system/DesignSystemErrorBoundary';
import '../components/design-system/design-system-page.css';
import { ADMIN_PORTAL_PATH } from '../config/courageRoutes';
import { canAccessDesignSystem } from '../config/designSystemAccess';

const DesignSystemPageContent = React.lazy(
  () => import('../components/design-system/DesignSystemPageContent'),
);

function DesignSystemLoading() {
  return (
    <div className="dsPageHero">
      <h1 className="dsPageHeroTitle">Focus Flame Design System</h1>
      <p className="dsPageHeroSub">Loading shared components…</p>
    </div>
  );
}

export default function DesignSystemPage() {
  const allowed = canAccessDesignSystem();

  useEffect(() => {
    document.title = "Focus Flame Design System | Caiden's Courage";
  }, []);

  if (!allowed) {
    return (
      <div className="dsPage">
        <div className="dsPageDenied">
          <h1>Internal access required</h1>
          <p>
            The design system page is private. Unlock the admin portal first, or use a development
            build.
          </p>
          <p>
            <Link to={ADMIN_PORTAL_PATH}>Go to Admin Portal</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dsPage">
      <DesignSystemErrorBoundary>
        <Suspense fallback={<DesignSystemLoading />}>
          <DesignSystemPageContent />
        </Suspense>
      </DesignSystemErrorBoundary>
    </div>
  );
}
