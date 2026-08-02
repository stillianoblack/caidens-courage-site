import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import GoalsOnboardingDrawer from './GoalsOnboardingDrawer';
import { ToastProvider } from './ToastProvider';

describe('facilitator Program Goals drawer', () => {
  test('closes silently and preserves the saved selection', async () => {
    const onClose = jest.fn();
    const onRemindLater = jest.fn().mockResolvedValue(undefined);
    render(<ToastProvider><GoalsOnboardingDrawer open onClose={onClose} portalType="facilitator" programCode="PROGRAM" initialRecord={{ program_code: 'PROGRAM', portal_type: 'facilitator', selected_goals: ['Improve Focus'], custom_goal: null, completed_at: null, dismissed_until: null }} onSave={jest.fn()} onRemindLater={onRemindLater} onSkip={jest.fn()} /></ToastProvider>);
    expect(screen.getByLabelText('Improve Focus')).toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: 'Close for Now' }));
    await waitFor(() => expect(onRemindLater).toHaveBeenCalledTimes(1));
    expect(screen.queryByText('Closed for now. Your existing selections are unchanged.')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Improve Focus')).toBeChecked();
  });
});
