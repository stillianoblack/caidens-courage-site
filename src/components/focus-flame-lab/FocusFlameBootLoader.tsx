import React, { useEffect, useState } from 'react';

type Phase = 'in' | 'out' | 'done';

export default function FocusFlameBootLoader({
  markSrc,
  reduceMotion,
  onDone,
}: {
  markSrc: string;
  reduceMotion: boolean;
  onDone: () => void;
}) {
  const [phase, setPhase] = useState<Phase>('in');

  useEffect(() => {
    const holdMs = reduceMotion ? 450 : 2400;
    const t = window.setTimeout(() => setPhase('out'), holdMs);
    return () => window.clearTimeout(t);
  }, [reduceMotion]);

  useEffect(() => {
    if (phase !== 'out') return;
    const fadeMs = reduceMotion ? 200 : 520;
    const t = window.setTimeout(() => {
      setPhase('done');
      onDone();
    }, fadeMs);
    return () => window.clearTimeout(t);
  }, [phase, onDone, reduceMotion]);

  if (phase === 'done') return null;

  return (
    <div
      className={`ffl-bootLoader ffl-loading-screen ${phase === 'out' ? 'ffl-bootLoader--exit' : ''}`}
      aria-busy="true"
      aria-live="polite"
    >
      <div className="ffl-bootLoaderGlow" aria-hidden="true" />
      <div className="ffl-bootLoaderInner">
        <img className="ffl-bootLoaderMark" src={markSrc} alt="" width={120} height={120} decoding="async" />
        <p className="ffl-bootLoaderCopy">Igniting the Focus Flame…</p>
      </div>
    </div>
  );
}
