import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminAuthProvider } from '../context/AdminAuthContext';

/** Layout shell for private /admin routes (portal + design system). */
export default function AdminRouteLayout() {
  return (
    <AdminAuthProvider>
      <Outlet />
    </AdminAuthProvider>
  );
}
