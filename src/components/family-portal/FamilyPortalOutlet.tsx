import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

function FamilyPanelLoading() {
  return (
    <div className="family-panelLoading" role="status" aria-live="polite">
      Loading...
    </div>
  );
}

export default function FamilyPortalOutlet() {
  return (
    <Suspense fallback={<FamilyPanelLoading />}>
      <Outlet />
    </Suspense>
  );
}
