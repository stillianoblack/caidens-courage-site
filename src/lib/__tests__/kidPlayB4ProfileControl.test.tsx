import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import KidPlayB4ProfileControl from '../../components/kid-play-shell/KidPlayB4ProfileControl';

jest.mock('../../hooks/useB4Variant', () => ({
  useB4Variant: (participantId: string) => ({
    variant: participantId === 'nova-id' ? 'fusion' : 'anchor',
    selectionRequired: false,
    loading: false,
    error: null,
    save: jest.fn(),
    refresh: jest.fn(),
  }),
}));

describe('child B-4 profile control', () => {
  test('shows the canonical participant unit and opens an accessible profile menu', () => {
    render(<KidPlayB4ProfileControl participantId="nova-id" displayName="Nova" />);
    const trigger = screen.getByRole('button', { name: "Open Nova's B-4 Fusion profile" });
    expect(trigger.querySelector('img')).toHaveAttribute(
      'src',
      '/assets/b4/fusion/idle/b4-fusion-idle.png',
    );

    fireEvent.click(trigger);
    const popover = screen.getByRole('dialog', { name: "Nova's B-4 profile" });
    expect(popover).toHaveTextContent('Balanced Focus');
    expect(popover).toHaveClass('kidPlayB4ProfileMenu');
    expect(screen.getByRole('button', { name: 'Change B-4' })).toBeEnabled();
  });

  test('closes on Escape and outside click without saving a draft choice', () => {
    const { rerender } = render(
      <div>
        <KidPlayB4ProfileControl participantId="nova-id" displayName="Nova" />
        <button type="button">Outside</button>
      </div>,
    );
    const trigger = screen.getByRole('button', { name: "Open Nova's B-4 Fusion profile" });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('button', { name: 'Change B-4' }));
    const picker = screen.getByRole('dialog', { name: 'Change B-4 for Nova' });
    expect(picker.querySelector('.b4VariantSelector--game')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: 'B-4 Pattern — Pattern Power' }));
    fireEvent.click(screen.getByRole('button', { name: 'Close B-4 picker' }));
    expect(screen.queryByRole('dialog', { name: 'Change B-4 for Nova' })).not.toBeInTheDocument();
    expect(trigger).toHaveAccessibleName("Open Nova's B-4 Fusion profile");

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('button', { name: 'Outside' }));
    expect(screen.queryByRole('dialog', { name: "Nova's B-4 profile" })).not.toBeInTheDocument();

    rerender(<KidPlayB4ProfileControl participantId="scout-id" displayName="Scout" />);
    expect(screen.getByRole('button', { name: "Open Scout's B-4 Anchor profile" })).toBeInTheDocument();
  });
});
