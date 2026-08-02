import React, { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import FacilitatorDrawer from './FacilitatorDrawer';

function Harness() {
  const [open, setOpen] = useState(false);
  return <><button type="button" onClick={() => setOpen(true)}>Open details</button><FacilitatorDrawer open={open} onClose={() => setOpen(false)} eyebrow="TEST" title="Student Details" description="Details"><button type="button">First action</button><button type="button">Last action</button></FacilitatorDrawer></>;
}

describe('FacilitatorDrawer', () => {
  test('coordinates backdrop and panel from one state and closes with Escape', async () => {
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: 'Open details' });
    fireEvent.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Student Details' });
    expect(dialog.closest('.facilitatorDrawerRoot')).toHaveAttribute('data-state', 'open');
    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(dialog.closest('.facilitatorDrawerRoot')).toHaveAttribute('data-state', 'closed');
    await waitFor(() => expect(document.body.style.overflow).toBe(''));
  });

  test('restores focus to the precise trigger after close', async () => {
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: 'Open details' });
    trigger.focus();
    fireEvent.click(trigger);
    fireEvent.click(await screen.findByRole('button', { name: 'Close' }));
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  test('keeps the stable shell mounted while loading changes', () => {
    const { rerender } = render(<FacilitatorDrawer open onClose={jest.fn()} eyebrow="TEST" title="Codes" loading><div>Loaded codes</div></FacilitatorDrawer>);
    const root = screen.getByRole('dialog', { name: 'Codes' }).closest('.facilitatorDrawerRoot');
    expect(screen.getByRole('status')).toHaveTextContent('Loading drawer content');
    rerender(<FacilitatorDrawer open onClose={jest.fn()} eyebrow="TEST" title="Codes"><div>Loaded codes</div></FacilitatorDrawer>);
    expect(screen.getByText('Loaded codes').closest('.facilitatorDrawerRoot')).toBe(root);
  });
});
