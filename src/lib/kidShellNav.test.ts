import type { NavigateFunction } from 'react-router-dom';
import { kidPlayShellNavigate } from './kidShellNav';

describe('kidPlayShellNavigate', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('uses router navigation without scheduling a timed reload fallback', () => {
    window.history.pushState({}, '', '/play/session/session-123/weekly-adventures');
    const navigate = jest.fn() as unknown as NavigateFunction;
    const setTimeoutSpy = jest.spyOn(window, 'setTimeout');

    kidPlayShellNavigate(navigate, '/play/session/session-123/collections');

    expect(navigate).toHaveBeenCalledWith('/play/session/session-123/collections', {
      replace: undefined,
      state: undefined,
    });
    expect(setTimeoutSpy).not.toHaveBeenCalled();
  });
});
