import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { PilotRosterRow } from '../../hooks/usePilotRosterData';
import { ToastProvider } from '../portal-design-system/ToastProvider';
import PilotAdminStudentTable from './PilotAdminStudentTable';

const row: PilotRosterRow = {
  participantId: 'participant-legacy-1',
  childName: 'Legacy Student',
  nickname: 'Legacy',
  parentGuardianName: '—',
  parentGuardianShort: '—',
  parentFirstName: '—',
  parentLastName: '—',
  parentEmail: '—',
  parentPhone: '—',
  emergencyContact: '—',
  campProgramCode: 'PROGRAM',
  programCode: 'PROGRAM',
  familyAccessCode: '—',
  familyProgramCode: '—',
  baselineStatus: 'Not Started',
  status: 'not-started',
  moduleCompletions: 0,
  lastActivityAt: null,
  gradeLevel: '4',
  gradeBand: '3-5',
  parentConnectionStatus: 'unclaimed',
  parentConnectionLabel: 'Parent Not Connected',
  hasPin: true,
  pinStatus: 'ready',
  pinLastRotatedAt: null,
  familyClaimCode: null,
  familyClaimUrl: null,
};

function renderTable(onStudentClick = jest.fn(), onInviteParent = jest.fn()) {
  render(
    <MemoryRouter>
      <ToastProvider>
        <PilotAdminStudentTable
          rows={[row]}
          variant="roster"
          onStudentClick={onStudentClick}
          onInviteParent={onInviteParent}
        />
      </ToastProvider>
    </MemoryRouter>,
  );
  return { onStudentClick, onInviteParent };
}

describe('PilotAdminStudentTable interaction boundaries', () => {
  test('student-name activation opens details', () => {
    const { onStudentClick, onInviteParent } = renderTable();
    fireEvent.click(screen.getByRole('button', { name: 'Legacy Student' }));
    expect(onStudentClick).toHaveBeenCalledWith('participant-legacy-1');
    expect(onInviteParent).not.toHaveBeenCalled();
  });

  test('Invite Parent activation does not invoke the student-details handler', () => {
    const { onStudentClick, onInviteParent } = renderTable();
    fireEvent.click(screen.getAllByRole('button', { name: 'Invite Parent' })[0]);
    expect(onInviteParent).toHaveBeenCalledWith(row);
    expect(onStudentClick).not.toHaveBeenCalled();
  });
});
