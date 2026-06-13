import React, { useState } from 'react';
import { useActiveParticipant } from '../../hooks/useActiveParticipant';
import { buildParticipantDebugSnapshot, logParticipantDebugSnapshot } from '../../lib/participantDebug';

export default function ParticipantDebugPanel() {
  const { participant } = useActiveParticipant();
  const [snapshot, setSnapshot] = useState<string | null>(null);

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const handleLog = async () => {
    const next = await buildParticipantDebugSnapshot(participant);
    logParticipantDebugSnapshot(next);
    setSnapshot(JSON.stringify(next, null, 2));
  };

  return (
    <section className="family-panelBlock" aria-label="Participant debug">
      <div className="family-panelBlockHead">
        <h3 className="family-panelBlockTitle">Participant debug</h3>
        <p className="family-panelHelper">Dev-only diagnostics for multi-child pilot verification.</p>
      </div>
      <button type="button" className="family-portalBtn family-portalBtn--ghost" onClick={() => void handleLog()}>
        Log participant debug
      </button>
      {snapshot ? (
        <pre className="family-panelHelper" style={{ whiteSpace: 'pre-wrap', marginTop: '0.75rem' }}>
          {snapshot}
        </pre>
      ) : null}
    </section>
  );
}
