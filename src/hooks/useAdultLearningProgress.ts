import { useCallback, useEffect, useState } from 'react';
import { ADULT_ASSESSMENT_PROGRESS_EVENT } from '../lib/adultAssessmentStorage';
import {
  buildAdultLearningFlowCards,
  type AdultLearningFlowCard,
} from '../lib/adultAssessmentProgress';

export function useAdultLearningProgress(pathname: string): AdultLearningFlowCard[] {
  const [cards, setCards] = useState(() => buildAdultLearningFlowCards(pathname));

  const refresh = useCallback(() => {
    setCards(buildAdultLearningFlowCards(pathname));
  }, [pathname]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const handleProgress = () => refresh();
    window.addEventListener(ADULT_ASSESSMENT_PROGRESS_EVENT, handleProgress);
    return () => window.removeEventListener(ADULT_ASSESSMENT_PROGRESS_EVENT, handleProgress);
  }, [refresh]);

  return cards;
}
