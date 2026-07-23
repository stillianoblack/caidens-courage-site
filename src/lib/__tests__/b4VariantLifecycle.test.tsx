import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { useB4Variant } from '../../hooks/useB4Variant';
import fs from 'fs';
import path from 'path';

const mockLoad = jest.fn();
const mockReadCache = jest.fn();

jest.mock('../b4VariantService', () => ({
  B4_VARIANT_UPDATED_EVENT: 'b4:variant-updated',
  loadB4Variant: (...args: unknown[]) => mockLoad(...args),
  readCachedB4Preference: (...args: unknown[]) => mockReadCache(...args),
  saveB4Variant: jest.fn(),
}));

jest.mock('../portalSessionEvents', () => ({
  PORTAL_SESSION_CHANGED_EVENT: 'portal:session-changed',
}));

function Probe({ participantId }: { participantId: string }) {
  const state = useB4Variant(participantId);
  return (
    <div>
      <span data-testid="variant">{state.variant}</span>
      <span data-testid="loading">{String(state.loading)}</span>
      <span data-testid="error">{state.error ?? ''}</span>
    </div>
  );
}

describe('B-4 participant lifecycle resilience', () => {
  beforeEach(() => {
    mockLoad.mockReset();
    mockReadCache.mockReset();
  });

  test('renders the saved participant immediately while background revalidation is pending', async () => {
    let resolveLoad: ((value: { variant: 'anchor'; selectionRequired: false }) => void) | null = null;
    mockReadCache.mockReturnValue({ variant: 'anchor', selectionRequired: false });
    mockLoad.mockReturnValue(
      new Promise((resolve) => {
        resolveLoad = resolve;
      }),
    );

    render(<Probe participantId="child-1" />);

    expect(screen.getByTestId('variant')).toHaveTextContent('anchor');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    await act(async () => {
      resolveLoad?.({ variant: 'anchor', selectionRequired: false });
      await Promise.resolve();
    });
  });

  test('keeps a usable saved choice when a background refresh fails', async () => {
    mockReadCache.mockReturnValue({ variant: 'pattern', selectionRequired: false });
    mockLoad.mockRejectedValue(new Error('temporary network failure'));

    render(<Probe participantId="child-1" />);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByTestId('variant')).toHaveTextContent('pattern');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('error')).toBeEmptyDOMElement();
  });

  test('inner-tab rerenders keep the saved choice without starting another request', async () => {
    mockReadCache.mockReturnValue({ variant: 'anchor', selectionRequired: false });
    mockLoad.mockResolvedValue({ variant: 'anchor', selectionRequired: false });

    const { rerender } = render(<Probe participantId="child-1" />);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(mockLoad).toHaveBeenCalledTimes(1);

    rerender(<Probe participantId="child-1" />);
    expect(mockLoad).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('variant')).toHaveTextContent('anchor');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
  });

  test('does not leak the prior participant choice during a participant switch', async () => {
    mockReadCache.mockImplementation((participantId: string) =>
      participantId === 'child-1'
        ? { variant: 'shield', selectionRequired: false }
        : null,
    );
    mockLoad.mockImplementation((participantId: string) =>
      participantId === 'child-1'
        ? Promise.resolve({ variant: 'shield', selectionRequired: false })
        : Promise.resolve({ variant: 'fusion', selectionRequired: false }),
    );

    const { rerender } = render(<Probe participantId="child-1" />);
    expect(screen.getByTestId('variant')).toHaveTextContent('shield');

    rerender(<Probe participantId="child-2" />);
    expect(screen.getByTestId('loading')).toHaveTextContent('true');
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(screen.getByTestId('variant')).toHaveTextContent('fusion');
  });

  test('does not force a full kid-shell reload when Safari restores from bfcache', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'src/index.js'), 'utf8');
    expect(source).not.toContain('installKidShellBackForwardRecovery');
    expect(source).not.toMatch(
      /pageshow[\s\S]*persisted[\s\S]*play\/session[\s\S]*location\.reload/,
    );
  });
});
