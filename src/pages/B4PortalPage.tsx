import React, { useEffect } from 'react';
import B4FocusMissionHub from '../components/b4/B4FocusMissionHub';
import '../components/b4/b4-portal-hub.css';

export default function B4PortalPage() {
  useEffect(() => {
    document.title = "B-4 Focus Missions | Caiden's Courage";
  }, []);

  return <B4FocusMissionHub />;
}
