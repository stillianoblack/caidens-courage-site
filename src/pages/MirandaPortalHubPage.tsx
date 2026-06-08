import React, { useEffect } from 'react';
import MirandaMysteryFilesHub from '../components/miranda/MirandaMysteryFilesHub';
import '../components/miranda/miranda-portal-hub.css';
import { MIRANDA_HUB } from '../data/miranda';

export default function MirandaPortalHubPage() {
  useEffect(() => {
    document.title = `${MIRANDA_HUB.title} | Caiden's Courage`;
  }, []);

  return <MirandaMysteryFilesHub />;
}
