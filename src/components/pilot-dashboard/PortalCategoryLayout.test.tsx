import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import PortalCategoryLayout from './PortalCategoryLayout';

const ITEMS = [
  { id: 'results', label: 'Results' },
  { id: 'dr-victoria', label: 'Dr. Victoria Training' },
  { id: 'uncle-t', label: 'Uncle T Training' },
] as const;

function Harness() {
  const [active, setActive] = useState<(typeof ITEMS)[number]['id']>('results');
  return (
    <PortalCategoryLayout items={ITEMS} activeItem={active} ariaLabel="Training and results sections" onSelect={setActive}>
      <p>{active} content</p>
    </PortalCategoryLayout>
  );
}

describe('PortalCategoryLayout', () => {
  it('renders the shared rail and moves between tabs with the keyboard', () => {
    render(<Harness />);
    const results = screen.getByRole('tab', { name: 'Results' });
    expect(results).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(results, { key: 'ArrowDown' });
    expect(screen.getByRole('tab', { name: 'Dr. Victoria Training' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('dr-victoria content')).toBeInTheDocument();
  });
});
