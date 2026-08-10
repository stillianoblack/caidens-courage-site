import React from 'react';
import { render, screen } from '@testing-library/react';
import { ToastProvider } from '../portal-design-system/ToastProvider';
import type { ActivePilotProgram } from '../../types/pilotProgram';
import FacilitatorShareInviteDrawer from './FacilitatorShareInviteDrawer';

const program: ActivePilotProgram = {
  programName: 'Imaginary Lantern Pilot',
  programCode: 'STAGING-LANTERN-2026',
  programType: 'Camp / Youth Program',
  adminFirstName: 'Testing',
  adminEmail: 'facilitator@example.com',
  estimatedStudents: 10,
  ageRange: 'Mixed Ages',
  groupName: 'Imaginary Lantern Pilot',
  familyAccessCode: 'LANTERN-FAMILY',
  facilitatorAccessCode: 'LANTERN-FACILITATOR',
  pricingTier: 'camp_pilot',
  paymentStatus: 'paid',
  pilotStatus: 'active',
  agreedAt: '2026-08-01T00:00:00.000Z',
};

describe('FacilitatorShareInviteDrawer', () => {
  test('uses the canonical program values in one share surface', () => {
    render(
      <ToastProvider>
        <FacilitatorShareInviteDrawer open onClose={jest.fn()} program={program} focus="family" />
      </ToastProvider>,
    );

    expect(screen.getByRole('dialog', { name: 'Share & Invite' })).toBeInTheDocument();
    expect(screen.getByText(program.programCode)).toBeInTheDocument();
    expect(screen.getByText(program.familyAccessCode)).toBeInTheDocument();
    expect(screen.getByText(program.facilitatorAccessCode!)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Copy Code' })).toHaveLength(3);
  });

  test('does not offer copy for an absent code', () => {
    render(
      <ToastProvider>
        <FacilitatorShareInviteDrawer
          open
          onClose={jest.fn()}
          program={{ ...program, facilitatorAccessCode: null }}
        />
      </ToastProvider>,
    );

    expect(screen.getByText('Not generated')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Copy Code' })).toHaveLength(2);
  });
});
