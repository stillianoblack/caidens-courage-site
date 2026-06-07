import React, { useEffect } from 'react';
import CaidenFocusQuestHub from '../components/caiden/CaidenFocusQuestHub';
import '../components/caiden/caiden-quest-hub.css';

export default function CaidenQuestHubPage() {
  useEffect(() => {
    document.title = "Caiden's Focus Flame Journey | Caiden's Courage";
  }, []);

  return <CaidenFocusQuestHub />;
}
