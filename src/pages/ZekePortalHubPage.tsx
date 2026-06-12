import React, { useEffect } from 'react';
import ZekeQuestHub from '../components/zeke/ZekeQuestHub';

export default function ZekePortalHubPage() {
  useEffect(() => {
    document.title = "Zeke's Team Quest | Caiden's Courage";
  }, []);

  return <ZekeQuestHub />;
}
