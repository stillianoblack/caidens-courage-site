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
  default: ({ onSubmit, onRetry, submitting, error }: {
    onSubmit: (input: PilotProgramSignupInput) => Promise<void>;
    onRetry?: () => Promise<void>;
    submitting: boolean;
    error: { title: string; body: string } | null;
  }) => (
    <div>
      <button type="button" onClick={() => onSubmit(familyInput)} disabled={submitting}>
        Submit test family
      </button>
      <output data-testid="submitting">{submitting ? 'submitting' : 'idle'}</output>
      {error ? (
        <div role="alert">
          <strong>{error.title}</strong>
          <span>{error.body}</span>
          <button type="button" onClick={() => void onRetry?.()}>Try Again</button>
        </div>
      ) : null}
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

  test('shows friendly copy without diagnostics and retries the same request in place', async () => {
    (submitPilotProgramSignup as jest.Mock)
      .mockResolvedValueOnce({
        success: false,
        code: 'timeout',
        message: 'Creating your program is taking too long. Please refresh and try again.',
        supportCode: 'E87DAF',
        correlationId: 'internal-correlation-id',
      })
      .mockResolvedValueOnce(success);

    render(<MemoryRouter><PilotProgramSignupPage /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Submit test family' }));

    expect(await screen.findByRole('alert')).toHaveTextContent("We couldn't create your program.");
    expect(screen.getByRole('alert')).toHaveTextContent(
      "Your information hasn't been lost. Please try again. If the problem continues, contact hello@caidenscourage.com.",
    );
    expect(screen.queryByText(/support code|correlation|refresh/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Try Again' }));
    await waitFor(() => expect(submitPilotProgramSignup).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.getByTestId('submitting')).toHaveTextContent('idle'));
    expect(submitPilotProgramSignup).toHaveBeenNthCalledWith(
      2,
      familyInput,
      expect.objectContaining({ requestId: expect.any(String) }),
    );
  });

  test('keeps correlation IDs in diagnostic logs without rendering them', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    (submitPilotProgramSignup as jest.Mock).mockResolvedValue({
      success: false,
      code: 'server_error',
      message: 'function pilot-family-signup returned HTTP 500',
      correlationId: 'server-log-only-123',
    });

    render(<MemoryRouter><PilotProgramSignupPage /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Submit test family' }));

    await waitFor(() =>
      expect(warn).toHaveBeenCalledWith(
        '[PILOT_SIGNUP_FAILED]',
        expect.objectContaining({ correlation_id: 'server-log-only-123' }),
      ),
    );
    expect(screen.queryByText(/server-log-only-123|pilot-family-signup|HTTP 500/i)).not.toBeInTheDocument();
    warn.mockRestore();
  });
});
