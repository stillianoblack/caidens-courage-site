import { useCallback, useEffect, useState } from 'react';
import { readActiveChildNickname } from '../config/activeChildNickname';
import { readActivePilotProgram } from '../config/activePilotProgram';
import { checkBaselineCompletion } from '../lib/baselineCompletion';

export function useBaselineGate() {
  const program = readActivePilotProgram();
  const [nickname, setNickname] = useState(readActiveChildNickname);
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setNickname(readActiveChildNickname());
    setLoading(true);
    const done = await checkBaselineCompletion(program?.programCode, readActiveChildNickname());
    setComplete(done);
    setLoading(false);
  }, [program?.programCode]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (
        event.key === 'activeChildNickname' ||
        event.key === 'caidens-courage-b4-baseline-check' ||
        event.key === 'caidens-courage-b4-baseline-results-archive'
      ) {
        void refresh();
      }
    };

    const onBaselineComplete = () => {
      void refresh();
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('cc-baseline-complete', onBaselineComplete);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('cc-baseline-complete', onBaselineComplete);
    };
  }, [refresh]);

  return {
    complete,
    loading,
    nickname,
    programCode: program?.programCode,
    refresh,
  };
}
