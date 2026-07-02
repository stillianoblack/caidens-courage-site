import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import type { ActivePilotProgram } from '../../types/pilotProgram';
import { writeActivePilotProgram } from '../../config/activePilotProgram';
import {
  writeActiveAccessCode,
  writeActiveFamilyContext,
  writeActivePortalRole,
} from '../../config/portalContext';
import { writeFamilyPortalSession } from '../../config/familyPortalAccess';
import { writeParentClaimContext } from '../../config/parentClaimContext';
import { setActiveChild } from '../../lib/activeChildContext';
import { writeStudentPinSession } from '../../lib/studentPinSession';
import { writeLocalKidPlaySessionId } from '../../lib/kidPlaySessionService';
import { PortalSessionProvider, usePortalSession } from '../PortalSessionContext';

const mockProgram = (overrides: Partial<ActivePilotProgram> = {}): ActivePilotProgram =>
  ({
    id: 'program-1',
    programName: 'GDI Camp',
    programCode: 'FAMILY-GDI-LONDON',
    programType: 'Independent Family',
    adminFirstName: 'Breonna',
    adminEmail: 'breonna@example.com',
    estimatedStudents: 1,
    ageRange: 'Mixed Ages',
    groupName: 'Morning Group',
    familyAccessCode: 'FAM-GDI-LONDON',
    facilitatorAccessCode: 'FAC-GDI-LONDON',
    pricingTier: 'independent_family',
    paymentStatus: 'waived',
    pilotStatus: 'active',
    agreedAt: '2026-01-01T00:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }) as ActivePilotProgram;

function Probe() {
  const session = usePortalSession();
  return (
    <div>
      <span data-testid="program-code">{session.programCode}</span>
      <span data-testid="role">{session.activeRole ?? ''}</span>
      <span data-testid="access-code">{session.activeAccessCode ?? ''}</span>
      <span data-testid="family-session">{String(session.familySessionActive)}</span>
      <span data-testid="parent-email">{session.parentClaim?.email ?? ''}</span>
      <span data-testid="participant-id">{session.activeParticipantId}</span>
      <span data-testid="pin-participant">{session.studentPinSession?.participantId ?? ''}</span>
      <span data-testid="kid-session">{session.kidPlaySessionId ?? ''}</span>
    </div>
  );
}

describe('PortalSessionProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  test('centralizes active program, family, participant, PIN, and kid session identity', () => {
    const program = mockProgram();
    writeActivePilotProgram(program);
    writeActivePortalRole('family');
    writeActiveAccessCode(program.familyAccessCode);
    writeActiveFamilyContext({
      programCode: program.programCode,
      programName: program.programName,
      familyAccessCode: program.familyAccessCode,
      groupName: program.groupName,
      programType: program.programType,
    });
    writeFamilyPortalSession();
    writeParentClaimContext({
      email: 'parent@example.com',
      confirmed: true,
      programCode: program.programCode,
      accessCode: program.familyAccessCode,
    });
    setActiveChild({ participantId: 'child-1', displayName: 'London' });
    writeStudentPinSession({
      participantId: 'child-1',
      programCode: program.programCode,
      displayName: 'London',
      verifiedAt: '2026-01-01T00:00:00.000Z',
    });
    writeLocalKidPlaySessionId('session-1');

    render(
      <PortalSessionProvider>
        <Probe />
      </PortalSessionProvider>,
    );

    expect(screen.getByTestId('program-code')).toHaveTextContent(program.programCode);
    expect(screen.getByTestId('role')).toHaveTextContent('family');
    expect(screen.getByTestId('access-code')).toHaveTextContent(program.familyAccessCode);
    expect(screen.getByTestId('family-session')).toHaveTextContent('true');
    expect(screen.getByTestId('parent-email')).toHaveTextContent('parent@example.com');
    expect(screen.getByTestId('participant-id')).toHaveTextContent('child-1');
    expect(screen.getByTestId('pin-participant')).toHaveTextContent('child-1');
    expect(screen.getByTestId('kid-session')).toHaveTextContent('session-1');
  });

  test('refreshes when the active child changes', async () => {
    writeActivePilotProgram(mockProgram());

    render(
      <PortalSessionProvider>
        <Probe />
      </PortalSessionProvider>,
    );

    expect(screen.getByTestId('participant-id')).toHaveTextContent('');

    act(() => {
      setActiveChild({ participantId: 'child-2', displayName: 'London' });
    });

    await waitFor(() => {
      expect(screen.getByTestId('participant-id')).toHaveTextContent('child-2');
    });
  });
});
