import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';

export default function FamilyPortalOutlet() {
  const location = useLocation();

  return <Outlet key={location.pathname} />;
}
