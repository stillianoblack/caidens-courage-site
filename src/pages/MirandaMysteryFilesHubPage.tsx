import React, { useEffect } from 'react';
import MirandaMysteryFilesHub from '../components/miranda/MirandaMysteryFilesHub';
import { MIRANDA_HUB } from '../data/miranda';

export default function MirandaMysteryFilesHubPage() {
  useEffect(() => {
    document.title = `${MIRANDA_HUB.title} | Caiden's Courage`;
  }, []);

  return <MirandaMysteryFilesHub portalInset={false} />;
}
