import React, { useEffect } from 'react';
import CharlieNatureNookHub from '../components/charlie/CharlieNatureNookHub';

export default function CharliePortalHubPage() {
  useEffect(() => {
    document.title = "Charlie Perk\u2019s Science Lab | Caiden's Courage";
  }, []);

  return <CharlieNatureNookHub />;
}
