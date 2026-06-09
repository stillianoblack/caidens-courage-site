import React from 'react';
import {
  pilotStudentStatusLabel,
  type PilotStudentStatus,
} from '../../lib/pilotStudentProgress';

type PilotStatusChipProps = {
  status: PilotStudentStatus | 'complete' | 'row-complete';
  label?: string;
};

export default function PilotStatusChip({ status, label }: PilotStatusChipProps) {
  const text =
    label ??
    (status === 'complete' || status === 'row-complete'
      ? 'Complete'
      : pilotStudentStatusLabel(status));

  return <span className={`pilot-statusChip pilot-statusChip--${status}`}>{text}</span>;
}
