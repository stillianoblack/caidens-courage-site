import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import B4UnitOnboardingModal from '../../components/b4/B4UnitOnboardingModal';

const mockSave = jest.fn().mockResolvedValue('fusion');
let mockSelectionRequired = true;
let mockLoading = false;
let mockError: string | null = null;
const mockRefresh = jest.fn();

jest.mock('../../hooks/useB4Variant', () => ({
  useB4Variant: () => ({
    variant: 'courage',
    selectionRequired: mockSelectionRequired,
    loading: mockLoading,
    error: mockError,
    save: mockSave,
    refresh: mockRefresh,
  }),
}));

describe('first-time B-4 onboarding', () => {
  beforeEach(() => {
    mockSelectionRequired = true;
    mockLoading = false;
    mockError = null;
    mockSave.mockClear();
    mockRefresh.mockClear();
  });

  test('shows only for an unconfirmed preference and saves the chosen canonical variant', async () => {
    render(<B4UnitOnboardingModal participantId="child-1" />);
    const dialog = screen.getByRole('dialog', { name: 'Select Your B-4 Unit' });
    expect(dialog).toBeInTheDocument();
    expect(dialog.parentElement).toBe(document.body.querySelector('.b4OnboardingBackdrop'));
    expect(document.body).toHaveStyle({ position: 'fixed', overflow: 'hidden' });
    expect(dialog.querySelector('.b4VariantSelector--game')).toBeInTheDocument();
    expect(dialog).toHaveClass('b4OnboardingModal');
    expect(screen.getByRole('button', { name: 'Choose This B-4' })).toBeDisabled();
    expect(screen.getByRole('radio', { name: 'B-4 Fusion — Brings skills together' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: 'B-4 Fusion — Brings skills together' }));
    expect(screen.getByRole('button', { name: 'Choose This B-4' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Choose This B-4' }));
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(mockSave).toHaveBeenCalledWith('fusion');
    expect(screen.getByRole('status')).toHaveTextContent('Your B-4 is ready!');
  });

  test('does not reopen when the participant already confirmed a valid preference', () => {
    mockSelectionRequired = false;
    render(<B4UnitOnboardingModal participantId="child-1" />);
    expect(screen.queryByRole('dialog', { name: 'Select Your B-4 Unit' })).not.toBeInTheDocument();
  });

  test('does not block Weekly Adventures while the participant choice resolves', () => {
    mockLoading = true;
    render(<B4UnitOnboardingModal participantId="child-1" enforce />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Select Your B-4 Unit' })).not.toBeInTheDocument();
    expect(document.body.querySelector('.b4OnboardingBackdrop')).not.toBeInTheDocument();
  });

  test('does not show a full-screen failure when background resolution fails', () => {
    mockError = 'temporary failure';
    render(<B4UnitOnboardingModal participantId="child-1" enforce />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(document.body.querySelector('.b4OnboardingBackdrop')).not.toBeInTheDocument();
  });
});
