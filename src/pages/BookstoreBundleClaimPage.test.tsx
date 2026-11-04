import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ActivePilotProgram } from '../types/pilotProgram';
import BookstoreBundleClaimPage from './BookstoreBundleClaimPage';
import { writeLastPilotProgram } from '../config/lastPilotProgram';
import { writeActivePortalRole } from '../config/portalContext';
import { captureAcademyClaimToken, releaseAcademyClaimToken } from '../lib/academyClaimHandoff';

jest.mock('../lib/academyClaimHandoff', () => ({
  captureAcademyClaimToken: jest.fn(() => ''),
  releaseAcademyClaimToken: jest.fn(),
}));

const family: ActivePilotProgram = {
  id: 'program-1',
  programName: 'Example Family',
  programCode: 'CMP-EXAMPLE',
  programType: 'Independent Family',
  adminFirstName: 'Parent',
  adminEmail: 'parent@example.com',
  estimatedStudents: 1,
  ageRange: 'Ages 8–10',
  groupName: 'Example Family',
  familyAccessCode: 'FAM-EXAMPLE',
  facilitatorAccessCode: null,
  pricingTier: 'independent_family',
  paymentStatus: 'pending',
  pilotStatus: 'active',
  agreedAt: '2026-11-03T00:00:00.000Z',
};

function jsonResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

function renderPage() {
  return render(
    <MemoryRouter>
      <BookstoreBundleClaimPage />
    </MemoryRouter>,
  );
}

describe('BookstoreBundleClaimPage', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    fetchMock.mockReset();
    (captureAcademyClaimToken as jest.Mock).mockReturnValue('');
    (releaseAcademyClaimToken as jest.Mock).mockClear();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  test('a new family can use the existing signup and return signed in to activate', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (String(url).includes('academy-bundle-claim')) {
        return jsonResponse(200, {
          granted: true,
          duplicate: false,
          startsAt: '2026-11-03T15:30:00.000Z',
          endsAt: '2027-02-01T15:30:00.000Z',
        });
      }
      return jsonResponse(200, { granted: false, ready: true, days: 90, productKey: 'courage_adventure_bundle' });
    });
    (captureAcademyClaimToken as jest.Mock).mockReturnValue('invite-fixture-token');

    renderPage();

    expect(await screen.findByRole('link', { name: 'Create a family account' })).toHaveAttribute('href', '/pilot-program-signup');
    expect(screen.getByRole('link', { name: 'Sign in to your family' })).toHaveAttribute('href', '/portal/family');
    expect(screen.queryByLabelText(/family access code/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/parent email/i)).not.toBeInTheDocument();
    expect(releaseAcademyClaimToken).toHaveBeenCalled();
    expect(window.localStorage.getItem('invite-fixture-token')).toBeNull();
    expect(window.sessionStorage.getItem('invite-fixture-token')).toBeNull();
    const exchange = fetchMock.mock.calls[0];
    expect(JSON.parse(exchange[1].body)).toEqual({ token: 'invite-fixture-token' });
    expect(exchange[1].credentials).toBe('include');

    writeLastPilotProgram(family, 'family', family.adminEmail, family.familyAccessCode);
    writeActivePortalRole('family');
    fireEvent.focus(window);

    fireEvent.click(await screen.findByRole('button', { name: 'Activate included access' }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const claim = fetchMock.mock.calls[1];
    expect(String(claim[0])).toContain('academy-bundle-claim');
    expect(JSON.parse(claim[1].body)).toEqual({
      parentEmail: 'parent@example.com',
      familyAccessCode: 'FAM-EXAMPLE',
    });
    expect(claim[1].body).not.toContain('invite-fixture-token');
    expect(claim[1].body).not.toContain('programCode');
    expect(await screen.findByRole('link', { name: 'Enter Focus Flame Academy' })).toHaveAttribute('href', '/portal/family');
  });

  test('an existing signed-in family can activate without typing a code', async () => {
    writeLastPilotProgram(family, 'family', family.adminEmail, family.familyAccessCode);
    writeActivePortalRole('family');
    fetchMock.mockResolvedValue(jsonResponse(200, {
      granted: false,
      ready: true,
      days: 90,
      productKey: 'courage_adventure_bundle',
    }));

    renderPage();

    expect(await screen.findByRole('button', { name: 'Activate included access' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Create a family account' })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/family access code/i)).not.toBeInTheDocument();
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({});
  });

  test('an expired handoff offers invitation recovery without another order', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (String(url).includes('academy-bundle-recovery')) {
        return jsonResponse(200, {
          message: 'If an unclaimed Academy invitation matches that email, a new one-time link is on its way.',
        });
      }
      return jsonResponse(409, { error: 'token_expired', granted: false });
    });

    renderPage();

    expect(await screen.findByText(/does not create another order/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Purchase email'), { target: { value: 'parent@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Email a new invitation' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(String(fetchMock.mock.calls[1][0])).toContain('academy-bundle-recovery');
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ email: 'parent@example.com' });
    expect(fetchMock.mock.calls.some((call) => String(call[0]).includes('checkout'))).toBe(false);
    expect(await screen.findByText(/new one-time link is on its way/i)).toBeInTheDocument();
  });

  test('shows a purchase-email mismatch without activating', async () => {
    writeLastPilotProgram(family, 'family', family.adminEmail, family.familyAccessCode);
    writeActivePortalRole('family');
    fetchMock.mockImplementation(async (url: string) => {
      if (String(url).includes('academy-bundle-claim')) {
        return jsonResponse(403, { error: 'email_mismatch', granted: false });
      }
      return jsonResponse(200, { granted: false, ready: true, days: 90, productKey: 'courage_adventure_bundle' });
    });

    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Activate included access' }));
    expect(await screen.findByText(/family account for the purchase email/i)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Enter Focus Flame Academy' })).not.toBeInTheDocument();
  });

  test('a duplicate activation tells the family access is already on the account', async () => {
    writeLastPilotProgram(family, 'family', family.adminEmail, family.familyAccessCode);
    writeActivePortalRole('family');
    fetchMock.mockImplementation(async (url: string) => {
      if (String(url).includes('academy-bundle-claim')) {
        return jsonResponse(200, { granted: true, duplicate: true, progressRetained: true });
      }
      return jsonResponse(200, { granted: false, ready: true, days: 90, productKey: 'courage_adventure_bundle' });
    });

    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Activate included access' }));
    expect(await screen.findByText(/already on the family account/i)).toBeInTheDocument();
  });
});
