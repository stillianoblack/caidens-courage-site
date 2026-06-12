import React from 'react';
import {
  PILOT_RESULTS_HEADLINE,
  PILOT_RESULTS_STATUS_COPY,
} from '../../data/pilotDashboardContent';
import { PortalPageIntro } from '../portal-design-system';

type PilotLocalNoteProps = {
  source?: 'supabase' | 'local';
};

export default function PilotLocalNote(_props: PilotLocalNoteProps) {
  return (
    <p className="pilot-localNote" role="note">
      {PILOT_RESULTS_STATUS_COPY}
    </p>
  );
}

export function PilotResultsStatusCopy(_props: PilotLocalNoteProps) {
  return (
    <div className="pilot-resultsIntro">
      <PortalPageIntro>{PILOT_RESULTS_HEADLINE}</PortalPageIntro>
    </div>
  );
}
