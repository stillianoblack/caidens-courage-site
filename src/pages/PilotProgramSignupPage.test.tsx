import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { PilotProgramSignupInput } from '../types/pilotProgram';
import PilotProgramSignupPage from './PilotProgramSignupPage';
import { submitPilotProgramSignup, type PilotProgramSignupResult } from '../lib/pilotProgramService';
import { replaceWithAuthenticatedPortalRoute } from '../lib/portalHardNavigation';
import { fetchPortalProgramAccess } from '../lib/portalProgramAccessApi';
import { activateSecureFacilitatorSession } from '../lib/facilitatorSessionClient';

jest.mock('../components/courage/CourageHeader', () => () => null);
jest.mock('../components/courage/CourageFooter', () => () => null);
jest.mock('../lib/pilotProgramService', () => ({ submitPilotProgramSignup: jest.fn() }));
jest.mock('../lib/independentFamilyPortalSignup', () => ({
  activateIndependentFamilyPortalSession: jest.fn(),
}));
jest.mock('../lib/portalHardNavigation', () => ({ replaceWithAuthenticatedPortalRoute: jest.fn() }));
jest.mock('../lib/portalProgramAccessApi', () => ({ fetchPortalProgramAccess: jest.fn() }));
jest.mock('../lib/facilitatorSessionClient', () => ({ activateSecureFacilitatorSession: jest.fn() }));
jest.mock('../lib/analytics', () => ({
  refreshAnalyticsIdentity: jest.fn(),
  trackContactFormSubmitted: jest.fn(),
}));
jest.mock('../components/pilot-program/PilotProgramSignupForm', () => ({
  __esModule: true,
  default: ({ onSubmit, submitting, error }: {
    onSubmit: (input: PilotProgramSignupInput) => Promise<void>;
    submitting: boolean;
    error: { title: string; body: string } | null;
  }) => (
    <div>
      <button type="button" onClick={() => onSubmit(familyInput)} disabled={submitting}>
        Submit test family
      </button>
      <button type="button" onClick={() => onSubmit(mockFacilitatorInput)} disabled={submitting}>
        Submit test facilitator
      </button>
      <output data-testid="submitting">{submitting ? 'submitting' : 'idle'}</output>
      {error ? <div role="alert">{error.title} {error.body}</div> : null}
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

const mockFacilitatorInput: PilotProgramSignupInput = {
  ...familyInput,
  programType: 'Teacher / Classroom',
  childFirstName: '',
  programName: 'Release Test Classroom',
  groupName: 'Release Test Classroom',
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

const facilitatorSuccess: PilotProgramSignupResult = {
  success: true,
  program: {
    ...success.program,
    programType: 'Teacher / Classroom',
    programCode: 'CMP-TEACHER',
    familyAccessCode: 'FAM-TEACHER',
    facilitatorAccessCode: 'FAC-TEACHER',
  },
  redirectDestination: '/program-dashboard?welcome=1',
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
    (replaceWithAuthenticatedPortalRoute as jest.Mock).mockReset();
    (fetchPortalProgramAccess as jest.Mock).mockReset();
    (activateSecureFacilitatorSession as jest.Mock).mockReset();
  });

  test('renders the branded facilitator setup experience with only orange B-4 artwork', () => {
    const { container } = render(<MemoryRouter><PilotProgramSignupPage /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'Start Your Focus Flame Adventure' })).toBeInTheDocument();
    expect(screen.getByText("Let's build your program.")).toBeInTheDocument();
    const images = Array.from(container.querySelectorAll('img'));
    expect(images).toHaveLength(2);
    expect(images.every((image) => image.getAttribute('src')?.includes('B-4orange'))).toBe(true);
    expect(container.querySelector('[src*="B-4student"], [src*="b-4facilitator"]')).toBeNull();
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

  test('hands a completed family signup directly to the Family dashboard', async () => {
    (submitPilotProgramSignup as jest.Mock).mockResolvedValue({
      ...success,
      redirectDestination: '/family-hub',
    });
    render(<MemoryRouter><PilotProgramSignupPage /></MemoryRouter>);

    fireEvent.click(screen.getByRole('button', { name: 'Submit test family' }));

    await waitFor(() => {
      expect(replaceWithAuthenticatedPortalRoute).toHaveBeenCalledWith('/family-hub');
    });
  });

  test('creates the secure facilitator cookie before opening the dashboard', async () => {
    const safeProgram = {
      ...facilitatorSuccess.program,
      adminEmail: '',
      familyAccessCode: '',
      facilitatorAccessCode: null,
    };
    (submitPilotProgramSignup as jest.Mock).mockResolvedValue(facilitatorSuccess);
    (fetchPortalProgramAccess as jest.Mock).mockResolvedValue({
      status: 'found',
      role: 'facilitator',
      program: safeProgram,
    });
    render(<MemoryRouter><PilotProgramSignupPage /></MemoryRouter>);

    fireEvent.click(screen.getByRole('button', { name: 'Submit test facilitator' }));

    await waitFor(() => {
      expect(fetchPortalProgramAccess).toHaveBeenCalledWith({
        accessCode: 'FAC-TEACHER',
        intent: 'facilitator',
        credential: mockFacilitatorInput.adminEmail,
        rememberDevice: true,
      });
      expect(activateSecureFacilitatorSession).toHaveBeenCalledWith(safeProgram);
      expect(replaceWithAuthenticatedPortalRoute).toHaveBeenCalledWith(
        '/program-dashboard?welcome=1',
      );
    });
  });

  test('does not redirect or invite a duplicate signup when secure session creation fails', async () => {
    (submitPilotProgramSignup as jest.Mock).mockResolvedValue(facilitatorSuccess);
    (fetchPortalProgramAccess as jest.Mock).mockResolvedValue({ status: 'unavailable' });
    render(<MemoryRouter><PilotProgramSignupPage /></MemoryRouter>);

    fireEvent.click(screen.getByRole('button', { name: 'Submit test facilitator' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Your program was created.');
    expect(screen.getByRole('alert')).toHaveTextContent('Do not create the program again');
    expect(replaceWithAuthenticatedPortalRoute).not.toHaveBeenCalled();
  });
});
