import { act, renderHook } from '@testing-library/react';
import type { ActivePilotProgram } from '../../types/pilotProgram';
import {
  FACILITATOR_BOOT_EXIT_MS,
  FACILITATOR_BOOT_MINIMUM_MS,
  FACILITATOR_BOOT_TIMEOUT_MS,
  useFacilitatorPortalBoot,
} from '../useFacilitatorPortalBoot';

jest.mock('../../lib/facilitatorSessionClient', () => ({
  activateSecureFacilitatorSession: jest.fn(),
}));

const program = { programCode: 'STAGING-ACADEMY' } as ActivePilotProgram;
const flush = async () => {
  await act(async () => Promise.resolve());
};

describe('useFacilitatorPortalBoot', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test('starts in the single booting state', () => {
    const fetcher = jest.fn(() => new Promise<never>(() => undefined));
    const { result } = renderHook(() => useFacilitatorPortalBoot(fetcher));
    expect(result.current.state).toBe('booting');
    expect(result.current.program).toBeNull();
  });

  test('keeps a fast authenticated response visible for the minimum duration', async () => {
    const fetcher = jest.fn().mockResolvedValue({ status: 'authenticated', program });
    const { result } = renderHook(() => useFacilitatorPortalBoot(fetcher));
    await flush();
    expect(result.current.state).toBe('booting');
    act(() => jest.advanceTimersByTime(FACILITATOR_BOOT_MINIMUM_MS - 1));
    expect(result.current.state).toBe('booting');
    act(() => jest.advanceTimersByTime(1));
    expect(result.current.state).toBe('ready');
    expect(result.current.program).toBe(program);
  });

  test('maps a missing session to unauthenticated', async () => {
    const fetcher = jest.fn().mockResolvedValue({ status: 'unauthenticated' });
    const { result } = renderHook(() => useFacilitatorPortalBoot(fetcher));
    await flush();
    act(() => jest.advanceTimersByTime(FACILITATOR_BOOT_MINIMUM_MS));
    expect(result.current.state).toBe('unauthenticated');
  });

  test('maps a server-unavailable response to recoverable error', async () => {
    const fetcher = jest.fn().mockResolvedValue({ status: 'unavailable' });
    const { result } = renderHook(() => useFacilitatorPortalBoot(fetcher));
    await flush();
    act(() => jest.advanceTimersByTime(FACILITATOR_BOOT_MINIMUM_MS));
    expect(result.current.state).toBe('recoverable_error');
  });

  test('maps a rejected request to recoverable error', async () => {
    const fetcher = jest.fn().mockRejectedValue(new Error('offline'));
    const { result } = renderHook(() => useFacilitatorPortalBoot(fetcher));
    await flush();
    act(() => jest.advanceTimersByTime(FACILITATOR_BOOT_MINIMUM_MS));
    expect(result.current.state).toBe('recoverable_error');
  });

  test('times out a request that never settles', () => {
    const fetcher = jest.fn(() => new Promise<never>(() => undefined));
    const { result } = renderHook(() => useFacilitatorPortalBoot(fetcher));
    act(() => jest.advanceTimersByTime(FACILITATOR_BOOT_TIMEOUT_MS));
    expect(result.current.state).toBe('recoverable_error');
  });

  test('retry starts one new attempt and can recover', async () => {
    const fetcher = jest.fn()
      .mockResolvedValueOnce({ status: 'unavailable' })
      .mockResolvedValueOnce({ status: 'authenticated', program });
    const { result } = renderHook(() => useFacilitatorPortalBoot(fetcher));
    await flush();
    act(() => jest.advanceTimersByTime(FACILITATOR_BOOT_MINIMUM_MS));
    act(() => result.current.retry());
    await flush();
    act(() => jest.advanceTimersByTime(FACILITATOR_BOOT_MINIMUM_MS));
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(result.current.state).toBe('ready');
  });

  test('a timed-out request cannot overwrite the terminal attempt', async () => {
    let resolveRequest!: (value: { status: 'authenticated'; program: ActivePilotProgram }) => void;
    const fetcher = jest.fn(() => new Promise<{ status: 'authenticated'; program: ActivePilotProgram }>((resolve) => {
      resolveRequest = resolve;
    }));
    const { result } = renderHook(() => useFacilitatorPortalBoot(fetcher));
    act(() => jest.advanceTimersByTime(FACILITATOR_BOOT_TIMEOUT_MS));
    expect(result.current.state).toBe('recoverable_error');
    await act(async () => resolveRequest({ status: 'authenticated', program }));
    expect(result.current.state).toBe('recoverable_error');
  });

  test('uses the accepted timing window and transition duration', () => {
    expect(FACILITATOR_BOOT_MINIMUM_MS).toBeGreaterThanOrEqual(500);
    expect(FACILITATOR_BOOT_MINIMUM_MS).toBeLessThanOrEqual(700);
    expect(FACILITATOR_BOOT_EXIT_MS).toBeGreaterThanOrEqual(180);
    expect(FACILITATOR_BOOT_EXIT_MS).toBeLessThanOrEqual(300);
  });
});
