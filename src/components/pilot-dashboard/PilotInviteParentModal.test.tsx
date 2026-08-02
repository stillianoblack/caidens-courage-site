import React, { useState } from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PilotInviteParentModal from './PilotInviteParentModal';

function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <MemoryRouter>
      <button type="button" onClick={() => setOpen(true)}>Invite Parent</button>
      <PilotInviteParentModal
        open={open}
        childName="Student Example"
        onClose={() => setOpen(false)}
        onSubmit={jest.fn()}
      />
    </MemoryRouter>
  );
}

describe('PilotInviteParentModal', () => {
  test('opens one dialog, focuses email, and restores the Invite Parent trigger', async () => {
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: 'Invite Parent' });
    trigger.focus();
    fireEvent.click(trigger);

    const dialog = screen.getByRole('dialog', { name: 'Invite Parent / Add Family' });
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    await waitFor(() => expect(within(dialog).getByLabelText('Parent / Guardian email')).toHaveFocus());

    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  test('renders Cancel before Send Invite in one action group and Escape closes only the modal', async () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'Invite Parent' }));
    const dialog = screen.getByRole('dialog', { name: 'Invite Parent / Add Family' });
    const actions = dialog.querySelector('.family-studentPinModalActions');
    expect(actions).not.toBeNull();
    expect(Array.from(actions!.querySelectorAll('button')).map((button) => button.textContent)).toEqual([
      'Cancel',
      'Send Invite',
    ]);
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
