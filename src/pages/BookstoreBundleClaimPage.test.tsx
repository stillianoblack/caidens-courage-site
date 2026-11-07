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
    fetchMock.mockImplementation(async (url: string, init?: { body?: string }) => {
      const target = String(url);
      if (target.includes('academy-bundle-verification')) {
        const request = JSON.parse(String(init?.body || '{}'));
        if (request.action === 'confirm') return jsonResponse(200, { verified: true, granted: false });
        return jsonResponse(200, { sent: true, granted: false });
      }
      if (target.includes('academy-bundle-claim')) {
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

    expect(await screen.findByRole('heading', { name: 'Your Adventure Starts Here!' })).toBeInTheDocument();
    expect(screen.getByText("Founder's Reserve includes 90 days of Focus Flame Academy. These days start when you activate access.")).toBeInTheDocument();
    expect(screen.queryByText(/now active/i)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Create a Family Account' })).toHaveAttribute('href', '/pilot-program-signup');
    expect(screen.getByRole('link', { name: 'Already Have an Account? Sign In' })).toHaveAttribute('href', '/portal/family');
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

    fireEvent.click(await screen.findByRole('button', { name: 'Email verification code' }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const verification = fetchMock.mock.calls[1];
    expect(String(verification[0])).toContain('academy-bundle-verification');
    expect(JSON.parse(verification[1].body)).toEqual({
      action: 'send',
      familyAccessCode: 'FAM-EXAMPLE',
    });
    expect(verification[1].body).not.toContain('parent@example.com');
    fireEvent.change(await screen.findByLabelText('Verification code'), { target: { value: '12345678' } });
    fireEvent.click(screen.getByRole('button', { name: 'Verify email' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Activate My Academy Access' }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(4));
    const claim = fetchMock.mock.calls[3];
    expect(String(claim[0])).toContain('academy-bundle-claim');
    expect(JSON.parse(claim[1].body)).toEqual({});
    expect(claim[1].body).not.toContain('invite-fixture-token');
    expect(claim[1].body).not.toContain('programCode');
    expect(claim[1].body).not.toContain('FAM-EXAMPLE');
    expect(await screen.findByRole('heading', { name: 'Welcome to Focus Flame Academy!' })).toBeInTheDocument();
    expect(screen.getByText(/Your included Academy access is now active/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Enter Family Portal' })).toHaveAttribute('href', '/portal/family');
  });

  test('an existing signed-in family must verify by email before activation', async () => {
    writeLastPilotProgram(family, 'family', family.adminEmail, family.familyAccessCode);
    writeActivePortalRole('family');
    fetchMock.mockResolvedValue(jsonResponse(200, {
      granted: false,
      ready: true,
      days: 90,
      productKey: 'courage_adventure_bundle',
    }));

    renderPage();

    expect(await screen.findByRole('button', { name: 'Email verification code' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Activate My Academy Access' })).not.toBeInTheDocument();
    expect(screen.getByText("Founder's Reserve includes 90 days of Focus Flame Academy. These days start when you activate access.")).toBeInTheDocument();
    expect(screen.queryByText(/now active/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Create a Family Account' })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/family access code/i)).not.toBeInTheDocument();
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({});
  });

  test('an expired handoff offers invitation recovery without another order', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (String(url).includes('academy-bundle-recovery')) {
        return jsonResponse(200, {
          message: 'If an eligible purchase matches this request, a new one-time link is emailed to that purchase email.',
        });
      }
      return jsonResponse(409, { error: 'token_expired', granted: false });
    });

    renderPage();

    expect(await screen.findByText(/invitation link has expired or is no longer available/i)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Founder\'s Reserve'));
    fireEvent.change(screen.getByLabelText('Purchase email'), { target: { value: 'parent@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Request a new invitation' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(String(fetchMock.mock.calls[1][0])).toContain('academy-bundle-recovery');
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({
      email: 'parent@example.com',
      bundle: 'hardcover',
    });
    expect(fetchMock.mock.calls.some((call) => String(call[0]).includes('checkout'))).toBe(false);
    expect(await screen.findByText(/if an eligible purchase matches this request/i)).toBeInTheDocument();
    expect(screen.queryByText(/on its way/i)).not.toBeInTheDocument();
  });

  test('shows a purchase-email mismatch without activating', async () => {
    writeLastPilotProgram(family, 'family', family.adminEmail, family.familyAccessCode);
    writeActivePortalRole('family');
    fetchMock.mockImplementation(async (url: string) => {
      if (String(url).includes('academy-bundle-verification')) {
        return jsonResponse(409, { error: 'email_mismatch', granted: false });
      }
      return jsonResponse(200, { granted: false, ready: true, days: 90, productKey: 'courage_adventure_bundle' });
    });

    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Email verification code' }));
    expect(await screen.findByText(/family account for the purchase email/i)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Enter Family Portal' })).not.toBeInTheDocument();
    expect(screen.queryByText(/now active/i)).not.toBeInTheDocument();
  });

  test('a duplicate activation tells the family access is already on the account', async () => {
    writeLastPilotProgram(family, 'family', family.adminEmail, family.familyAccessCode);
    writeActivePortalRole('family');
    fetchMock.mockImplementation(async (url: string, init?: { body?: string }) => {
      const target = String(url);
      if (target.includes('academy-bundle-verification')) {
        const request = JSON.parse(String(init?.body || '{}'));
        return jsonResponse(200, request.action === 'confirm'
          ? { verified: true, granted: false }
          : { sent: true, granted: false });
      }
      if (target.includes('academy-bundle-claim')) {
        return jsonResponse(200, { granted: true, duplicate: true, progressRetained: true });
      }
      return jsonResponse(200, { granted: false, ready: true, days: 90, productKey: 'courage_adventure_bundle' });
    });

    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Email verification code' }));
    fireEvent.change(await screen.findByLabelText('Verification code'), { target: { value: '12345678' } });
    fireEvent.click(screen.getByRole('button', { name: 'Verify email' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Activate My Academy Access' }));
    expect(await screen.findByText(/already on the family account/i)).toBeInTheDocument();
    expect(screen.queryByText(/now active/i)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Enter Family Portal' })).toBeInTheDocument();
  });

  test('a paperback invitation shows 30 days and does not say access is active', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, {
      granted: false,
      ready: true,
      days: 30,
      productKey: 'courage_adventure_paperback_bundle',
    }));

    renderPage();

    expect(await screen.findByText('Paperback Adventure Bundle includes 30 days of Focus Flame Academy. These days start when you activate access.')).toBeInTheDocument();
    expect(screen.queryByText(/now active/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/90 days/i)).not.toBeInTheDocument();
  });

  test('a refunded claim does not show the welcome state', async () => {
    writeLastPilotProgram(family, 'family', family.adminEmail, family.familyAccessCode);
    writeActivePortalRole('family');
    fetchMock.mockImplementation(async (url: string, init?: { body?: string }) => {
      const target = String(url);
      if (target.includes('academy-bundle-verification')) {
        const request = JSON.parse(String(init?.body || '{}'));
        return jsonResponse(200, request.action === 'confirm'
          ? { verified: true, granted: false }
          : { sent: true, granted: false });
      }
      if (target.includes('academy-bundle-claim')) {
        return jsonResponse(409, { error: 'refunded', granted: false });
      }
      return jsonResponse(200, { granted: false, ready: true, days: 30, productKey: 'courage_adventure_paperback_bundle' });
    });

    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Email verification code' }));
    fireEvent.change(await screen.findByLabelText('Verification code'), { target: { value: '12345678' } });
    fireEvent.click(screen.getByRole('button', { name: 'Verify email' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Activate My Academy Access' }));
    expect(await screen.findByText(/invitation link has expired or is no longer available/i)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Welcome to Focus Flame Academy!' })).not.toBeInTheDocument();
    expect(screen.queryByText(/now active/i)).not.toBeInTheDocument();
  });

  test('a failed recovery keeps the form and explains that no invitation was sent', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (String(url).includes('academy-bundle-recovery')) {
        return jsonResponse(503, { error: 'invitation_email_failed' });
      }
      return jsonResponse(409, { error: 'token_expired', granted: false });
    });

    renderPage();
    fireEvent.click(await screen.findByLabelText('Paperback Adventure Bundle'));
    fireEvent.change(screen.getByLabelText('Purchase email'), { target: { value: 'parent@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Request a new invitation' }));
    expect(await screen.findByText(/couldn't send a new invitation/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Purchase email')).toHaveValue('parent@example.com');
    expect(screen.queryByText(/is emailed to that purchase email/i)).not.toBeInTheDocument();
  });
});
