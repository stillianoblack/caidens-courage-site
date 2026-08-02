import React, { useRef, useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import FacilitatorDrawer from './FacilitatorDrawer';

function Harness() {
  const [open, setOpen] = useState(false);
  return <><button type="button" onClick={() => setOpen(true)}>Open details</button><FacilitatorDrawer open={open} onClose={() => setOpen(false)} eyebrow="TEST" title="Student Details" description="Details"><button type="button">First action</button><button type="button">Last action</button></FacilitatorDrawer></>;
}

function FormHarness() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  return <><button type="button" onClick={() => setOpen(true)}>Add Student</button><FacilitatorDrawer open={open} onClose={() => setOpen(false)} eyebrow="NEW LEARNER" title="Add a Student" initialFocusRef={inputRef}><input ref={inputRef} aria-label="Child first name" value={value} onChange={(event) => setValue(event.target.value)} /></FacilitatorDrawer></>;
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

  test('focuses the first field once and keeps focus there through form rerenders', async () => {
    render(<FormHarness />);
    fireEvent.click(screen.getByRole('button', { name: 'Add Student' }));
    const input = screen.getByRole('textbox', { name: 'Child first name' });
    await waitFor(() => expect(input).toHaveFocus());

    for (const value of ['N', 'No', 'Nov', 'Nova', 'Noval', 'Novali']) {
      fireEvent.change(input, { target: { value } });
      expect(input).toHaveFocus();
      expect(screen.getByRole('button', { name: 'Close' })).not.toHaveFocus();
    }
    expect(input).toHaveValue('Novali');
  });
});
