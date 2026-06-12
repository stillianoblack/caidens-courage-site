import { useCallback, useEffect, useState } from 'react';
import { ACTIVE_CHILD_EVENT } from '../lib/activeChildContext';
import { CHILD_PROFILE_UPDATED_EVENT } from '../config/activeChildParticipant';
import {
  COURAGE_WEEK1_WELCOME_STATE_KEY,
  readParticipantUiDismissed,
  saveParticipantUiDismissed,
} from '../lib/participantUiState';

type UseCourageWeekWelcomeResult = {
  showWelcome: boolean;
  dismissWelcome: () => void;
};

export function useCourageWeekWelcome(week: number): UseCourageWeekWelcomeResult {
  const [showWelcome, setShowWelcome] = useState(false);
  const [checked, setChecked] = useState(false);

  const refresh = useCallback(async () => {
    if (week !== 1) {
      setShowWelcome(false);
      setChecked(true);
      return;
    }

    const dismissed = await readParticipantUiDismissed(COURAGE_WEEK1_WELCOME_STATE_KEY);
    setShowWelcome(!dismissed);
    setChecked(true);
  }, [week]);

  useEffect(() => {
    setChecked(false);
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const handleRefresh = () => {
      void refresh();
    };
    window.addEventListener(ACTIVE_CHILD_EVENT, handleRefresh);
    window.addEventListener(CHILD_PROFILE_UPDATED_EVENT, handleRefresh);
    return () => {
      window.removeEventListener(ACTIVE_CHILD_EVENT, handleRefresh);
      window.removeEventListener(CHILD_PROFILE_UPDATED_EVENT, handleRefresh);
    };
  }, [refresh]);

  const dismissWelcome = useCallback(() => {
    setShowWelcome(false);
    void saveParticipantUiDismissed(COURAGE_WEEK1_WELCOME_STATE_KEY);
  }, []);

  return {
    showWelcome: checked && showWelcome,
    dismissWelcome,
  };
}
