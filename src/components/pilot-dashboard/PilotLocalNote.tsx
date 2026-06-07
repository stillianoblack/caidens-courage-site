import React from 'react';
import { PILOT_CONNECTED_NOTE, PILOT_LOCAL_TESTING_NOTE } from '../../data/pilotDashboardContent';

type PilotLocalNoteProps = {
  source?: 'supabase' | 'local';
};

export default function PilotLocalNote({ source = 'local' }: PilotLocalNoteProps) {
  return (
    <p className="pilot-localNote" role="note">
      {source === 'supabase' ? PILOT_CONNECTED_NOTE : PILOT_LOCAL_TESTING_NOTE}
    </p>
  );
}
