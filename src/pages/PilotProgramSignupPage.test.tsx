import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { PilotProgramSignupInput } from '../types/pilotProgram';
import PilotProgramSignupPage from './PilotProgramSignupPage';
import { submitPilotProgramSignup, type PilotProgramSignupResult } from '../lib/pilotProgramService';

jest.mock('../components/courage/CourageHeader', () => () => null);
jest.mock('../components/courage/CourageFooter', () => () => null);
jest.mock('../lib/pilotProgramService', () => ({ submitPilotProgramSignup: jest.fn() }));
jest.mock('../lib/independentFamilyPortalSignup', () => ({
  activateIndependentFamilyPortalSession: jest.fn(),
}));
jest.mock('../lib/portalHardNavigation', () => ({ replaceWithPortalRoute: jest.fn() }));
jest.mock('../lib/analytics', () => ({
  refreshAnalyticsIdentity: jest.fn(),
  trackContactFormSubmitted: jest.fn(),
}));
jest.mock('../components/pilot-program/PilotProgramSignupForm', () => ({
  __esModule: true,
  default: ({ onSubmit, submitting, error }: {
    onSubmit: (input: PilotProgramSignupInput) => Promise<void>;
    submitting: boolean;
    error: string | null;
  }) => (
    <div>
      <button type="button" onClick={() => onSubmit(familyInput)} disabled={submitting}>
        Submit test family
      </button>
      <output data-testid="submitting">{submitting ? 'submitting' : 'idle'}</output>
      {error ? <div role="alert">{error}</div> : null}
    </div>
  ),
}));

const familyInput: PilotProgramSignupInput = {
  programType: 'Independent Family',
  programName: 'Release Test Family',
  adminFirstName: 'Guardian',
  adminEmail: 'release-test@example.com',
  childFirstName: 'Avery',
  estimatedStudents: 1,
  estimatedStudentCountRange: '1 child',
  ageGradeBand: '3rd–5th',
  ageGradeNotes: '',
  ageRange: 'Ages 8–10',
  groupName: 'Release Test Family',
  agreedToTerms: true,
};

const success: PilotProgramSignupResult = {
  success: true,
  program: {
    id: 'program-1',
    programName: 'Release Test Family',
    programCode: 'CMP-SERVER',
    programType: 'Independent Family',
    adminFirstName: 'Guardian',
    adminEmail: 'release-test@example.com',
    estimatedStudents: 1,
    ageRange: 'Ages 8–10',
    groupName: 'Release Test Family',
    familyAccessCode: 'FAM-SERVER',
    facilitatorAccessCode: null,
    pricingTier: 'independent_family',
    paymentStatus: 'pending',
    pilotStatus: 'active',
    agreedAt: '2026-07-15T00:00:00.000Z',
  },
  participantId: 'participant-1',
  reused: false,
};

const outcomes: Array<[string, PilotProgramSignupResult]> = [
  ['success', success],
  ['HTTP 400', { success: false, code: 'validation_error', message: 'Check the submitted details.' }],
  ['HTTP 500', { success: false, code: 'server_error', message: 'The server could not complete signup.' }],
  ['timeout', { success: false, code: 'timeout', message: 'The result is uncertain.' }],
];

describe('PilotProgramSignupPage submission state', () => {
  beforeEach(() => {
    (submitPilotProgramSignup as jest.Mock).mockReset();
  });

  test.each(outcomes)('clears loading after %s', async (_label, outcome) => {
    let resolveRequest: (result: PilotProgramSignupResult) => void = () => undefined;
    (submitPilotProgramSignup as jest.Mock).mockReturnValue(
      new Promise<PilotProgramSignupResult>((resolve) => { resolveRequest = resolve; }),
    );
    render(<MemoryRouter><PilotProgramSignupPage /></MemoryRouter>);

    fireEvent.click(screen.getByRole('button', { name: 'Submit test family' }));
    expect(screen.getByTestId('submitting')).toHaveTextContent('submitting');

    await act(async () => { resolveRequest(outcome); });
    await waitFor(() => expect(screen.getByTestId('submitting')).toHaveTextContent('idle'));
  });

  test('blocks a duplicate click while the first request is pending', async () => {
    let resolveRequest: (result: PilotProgramSignupResult) => void = () => undefined;
    (submitPilotProgramSignup as jest.Mock).mockReturnValue(
      new Promise<PilotProgramSignupResult>((resolve) => { resolveRequest = resolve; }),
    );
    render(<MemoryRouter><PilotProgramSignupPage /></MemoryRouter>);
    const button = screen.getByRole('button', { name: 'Submit test family' });

    fireEvent.click(button);
    fireEvent.click(button);
    expect(submitPilotProgramSignup).toHaveBeenCalledTimes(1);

    await act(async () => { resolveRequest(success); });
  });
});
