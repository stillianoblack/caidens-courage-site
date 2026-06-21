import type { NavigateFunction } from 'react-router-dom';
import { kidPlaySessionStartPath } from '../config/courageRoutes';
import { kidPlayShellNavigate, resolveKidShellNavigationMethod, shouldUseImmediateShellAssign } from './kidShellNav';

describe('kidPlayShellNavigate', () => {
  afterEach(() => {
    window.history.pushState({}, '', '/');
    jest.restoreAllMocks();
  });

  it('uses direct loads for kid shell route changes', () => {
    expect(
      resolveKidShellNavigationMethod(
        '/play/session/session-123/weekly-adventures',
        '/play/session/session-123/collections',
      ),
    ).toBe('assign');
    expect(
      resolveKidShellNavigationMethod(
        '/family-hub/weekly-adventures',
        '/play/session/session-123/weekly-adventures',
      ),
    ).toBe('assign');
  });

  it('hard-loads in-shell tab changes immediately without the transition overlay', () => {
    expect(
      shouldUseImmediateShellAssign(
        '/play/session/session-123/weekly-adventures',
        '/play/session/session-123/collections',
      ),
    ).toBe(true);
    expect(
      shouldUseImmediateShellAssign(
        '/family-hub/weekly-adventures',
        '/play/session/session-123/weekly-adventures',
      ),
    ).toBe(false);
  });

  it('keeps ordinary non-shell navigation on the router', () => {
    window.history.pushState({}, '', '/family-hub/weekly-adventures');
    const navigate = jest.fn() as unknown as NavigateFunction;
    const setTimeoutSpy = jest.spyOn(window, 'setTimeout');

    kidPlayShellNavigate(navigate, '/family-hub/collections');

    expect(navigate).toHaveBeenCalledWith('/family-hub/collections', {
      replace: undefined,
      state: undefined,
    });
    expect(setTimeoutSpy).not.toHaveBeenCalled();
  });

  it('uses the weekly adventures route as the canonical session start path', () => {
    expect(kidPlaySessionStartPath(' session-123 ')).toBe(
      '/play/session/session-123/weekly-adventures',
    );
  });
});
