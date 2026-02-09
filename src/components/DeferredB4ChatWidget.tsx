import React, { Suspense, useEffect, useState } from 'react';
import { afterPaint } from '../lib/afterPaint';

const LazyB4ChatWidget = React.lazy(() => import('./B4ChatWidget'));

/**
 * Defers B-4 chat widget initialization until after first paint / idle.
 * Ensures route transitions and initial render never wait on chat code or network calls.
 */
const DeferredB4ChatWidget: React.FC = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    afterPaint(() => setReady(true));
  }, []);

  if (!ready) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <LazyB4ChatWidget />
    </Suspense>
  );
};

export default DeferredB4ChatWidget;

