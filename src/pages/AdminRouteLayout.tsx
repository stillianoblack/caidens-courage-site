import React from 'react';
import { Outlet } from 'react-router-dom';

/** Layout shell for private /admin routes (portal + design system). */
export default function AdminRouteLayout() {
  return <Outlet />;
}
