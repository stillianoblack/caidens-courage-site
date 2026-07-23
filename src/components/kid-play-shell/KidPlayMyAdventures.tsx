import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAdventureModules } from '../../hooks/useAdventureModules';
import { useAdventureMonths } from '../../hooks/useAdventureMonths';
import { useAdventureWeekCompletions } from '../../hooks/useAdventureWeekCompletions';
import { useFocusCoinWallet } from '../../hooks/useFocusCoinWallet';
import { useWeeklyAdventureTrail } from '../../hooks/useWeeklyAdventureTrail';
import { resolveFullyCompletedWeekNumbers } from '../../lib/adventureWeekCompletion';
import { resolveDefaultMonthNumber } from '../../lib/adventureMonthService';
import { buildAdventureJourneyMonthViews } from '../../lib/weeklyAdventureJourneyMonths';
import { getKidPlayShellKidsBase, getKidPlayShellRoute } from '../../lib/kidPlayShellRoutes';
import { kidPlayShellNavigate } from '../../lib/kidShellNav';
import {
  WEEKLY_MONTH_PARAM,
  WEEKLY_VIEW_EXPLORE_VALUE,
  WEEKLY_VIEW_PARAM,
  WEEKLY_WEEK_PARAM,
  parseWeeklyAdventureMonthParam,
} from '../../lib/weeklyAdventureRouteContext';
import MyAdventuresDrawer, { type MyAdventuresMonthItem } from './MyAdventuresDrawer';

type Props = {
  participantId: string;
  displayName: string;
  sessionId: string;
};

/**
 * Shared-shell owner for My Adventures. It deliberately lives above the route
 * outlet so navigation cannot unmount the drawer or replace its participant data.
 */
export default function KidPlayMyAdventures({
  participantId,
  displayName,
  sessionId,
}: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { modules } = useAdventureModules('family');
  const { months: cmsMonths } = useAdventureMonths('family');
  const { completedByWeek } = useAdventureWeekCompletions(participantId);
  const { totalCoins, loading: focusCoinsLoading } = useFocusCoinWallet();
  const paths = useMemo(
    () => ({
      kidsBasePath: getKidPlayShellKidsBase(sessionId),
      downloadsPath: `/play/session/${sessionId}/downloads`,
      certificatesPath: `/play/session/${sessionId}/certificates`,
    }),
    [sessionId],
  );
  const completedWeekNumbers = useMemo(
    () =>
      resolveFullyCompletedWeekNumbers({
        completedByWeek,
        cmsModules: modules,
        paths,
      }),
    [completedByWeek, modules, paths],
  );
  const visibilityCtx = useMemo(() => ({ now: new Date() }), []);
  const { weeks } = useWeeklyAdventureTrail(
    participantId,
    paths,
    { baselineLocked: false },
    null,
    {
      cmsModules: modules,
      cmsMonths,
      visibilityCtx,
      mapCompletedWeekNumbers: completedWeekNumbers,
    },
  );
  const journeyMonths = useMemo(
    () =>
      buildAdventureJourneyMonthViews({
        trailWeeks: weeks,
        completedByWeek,
        mapCompletedWeekNumbers: completedWeekNumbers,
        cmsModules: modules,
        cmsMonths,
      }),
    [cmsMonths, completedByWeek, completedWeekNumbers, modules, weeks],
  );
  const currentWeek = useMemo(() => {
    const firstIncompleteUnlocked = weeks.find(
      (week) => week.weekStatus !== 'locked' && !completedWeekNumbers.includes(week.week),
    );
    return firstIncompleteUnlocked?.week ?? Math.max(1, ...completedWeekNumbers);
  }, [completedWeekNumbers, weeks]);
  const currentMonthNumber = resolveDefaultMonthNumber(currentWeek);
  const requestedMonthNumber = parseWeeklyAdventureMonthParam(
    new URLSearchParams(location.search).get(WEEKLY_MONTH_PARAM),
  );
  const [selectedMonthNumber, setSelectedMonthNumber] = useState(
    requestedMonthNumber ?? currentMonthNumber,
  );

  useEffect(() => {
    setSelectedMonthNumber(requestedMonthNumber ?? currentMonthNumber);
  }, [currentMonthNumber, participantId, requestedMonthNumber]);

  const monthItems = useMemo<MyAdventuresMonthItem[]>(
    () =>
      journeyMonths.map((month) => ({
        month,
        locked: month.weekNumbers.every((weekNumber) => {
          const week = weeks.find((item) => item.week === weekNumber);
          return !week || week.weekStatus === 'locked';
        }),
      })),
    [journeyMonths, weeks],
  );
  const selectedMonthRecord =
    cmsMonths.find((month) => month.month_number === selectedMonthNumber) ?? null;

  const handleSelectMonth = useCallback(
    (monthNumber: number) => {
      const month = monthItems.find((item) => item.month.monthNumber === monthNumber);
      if (!month || month.locked) return;
      const targetWeek =
        month.month.weekNumbers.find((weekNumber) => {
          const week = weeks.find((item) => item.week === weekNumber);
          return week && week.weekStatus !== 'locked';
        }) ?? month.month.weekNumbers[0];
      if (!targetWeek) return;
      setSelectedMonthNumber(monthNumber);
      const params = new URLSearchParams({
        [WEEKLY_VIEW_PARAM]: WEEKLY_VIEW_EXPLORE_VALUE,
        [WEEKLY_MONTH_PARAM]: String(monthNumber),
        [WEEKLY_WEEK_PARAM]: String(targetWeek),
      });
      kidPlayShellNavigate(
        navigate,
        `${getKidPlayShellRoute(sessionId, 'weekly-adventures')}?${params.toString()}`,
      );
    },
    [monthItems, navigate, sessionId, weeks],
  );

  return (
    <MyAdventuresDrawer
      participantId={participantId}
      displayName={displayName}
      currentWeek={currentWeek}
      focusCoins={totalCoins}
      focusCoinsLoading={focusCoinsLoading}
      months={monthItems}
      selectedMonthNumber={selectedMonthNumber}
      currentMonthNumber={currentMonthNumber}
      selectedMonthRecord={selectedMonthRecord}
      onSelectMonth={handleSelectMonth}
    />
  );
}
