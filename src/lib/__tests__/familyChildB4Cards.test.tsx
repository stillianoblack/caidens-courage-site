import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FamilyChildB4Control from '../../components/family-portal/FamilyChildB4Control';
import { ToastProvider } from '../../components/portal-design-system';

jest.mock('../../hooks/useB4Variant', () => ({
  useB4Variant: (participantId: string) => ({
    variant: participantId === 'child-pattern' ? 'pattern' : 'anchor',
    selectionRequired: false,
    loading: false,
    error: null,
    save: jest.fn(),
    refresh: jest.fn(),
  }),
}));

describe('participant-specific B-4 child cards', () => {
  test('keeps each child preview and play action independent', () => {
    render(
      <MemoryRouter>
        <ToastProvider>
          <FamilyChildB4Control participantId="child-pattern" displayName="Trace" />
          <FamilyChildB4Control participantId="child-anchor" displayName="Scout" />
        </ToastProvider>
      </MemoryRouter>,
    );
    expect(screen.getByRole('region', { name: 'B-4 Unit for Trace' })).toHaveTextContent('B-4 Pattern');
    expect(screen.getByRole('region', { name: 'B-4 Unit for Scout' })).toHaveTextContent('B-4 Anchor');
    expect(screen.getByRole('button', { name: 'Start child game for Trace' })).toHaveTextContent('Play as Trace');
    expect(screen.getByRole('button', { name: 'Start child game for Scout' })).toHaveTextContent('Play as Scout');
  });
});
