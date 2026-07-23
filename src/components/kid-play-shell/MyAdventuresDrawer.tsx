import React, { useEffect, useId, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { B4_VARIANTS } from '../../data/b4/variantManifest';
import { useB4Variant } from '../../hooks/useB4Variant';
import { useDocumentModalScrollLock } from '../../hooks/useDocumentModalScrollLock';
import { requestKidPlayB4Picker } from '../../lib/kidPlayB4PickerEvents';
import type { AdventureJourneyMonthView } from '../../lib/weeklyAdventureJourneyMonths';
import type { AdventureMonthRecord } from '../../types/adventureMonth';
import B4CircleAvatar from '../b4/B4CircleAvatar';
import { useMyAdventures } from '../../context/MyAdventuresContext';
import './my-adventures-drawer.css';

export type MyAdventuresMonthItem = {
  month: AdventureJourneyMonthView;
  locked: boolean;
};

type Props = {
  participantId: string;
  displayName: string;
  currentWeek: number;
  focusCoins: number;
  focusCoinsLoading: boolean;
  months: MyAdventuresMonthItem[];
  selectedMonthNumber: number;
  currentMonthNumber: number;
  selectedMonthRecord: AdventureMonthRecord | null;
  onSelectMonth: (monthNumber: number) => void;
};

function focusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
}

export default function MyAdventuresDrawer({
  participantId,
  displayName,
  currentWeek,
  focusCoins,
  focusCoinsLoading,
  months,
  selectedMonthNumber,
  currentMonthNumber,
  selectedMonthRecord,
  onSelectMonth,
}: Props) {
  const { open, closeDrawer } = useMyAdventures();
  const titleId = useId();
  const drawerRef = useRef<HTMLElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const { variant, selectionRequired, loading: b4Loading } = useB4Variant(participantId);
  const b4Definition = B4_VARIANTS[variant];
  const selectedMonth = useMemo(
    () => months.find((item) => item.month.monthNumber === selectedMonthNumber)?.month ?? null,
    [months, selectedMonthNumber],
  );
  const weeksCompleted = selectedMonth?.progress.weeksCompleted ?? 0;
  const weeksTotal = selectedMonth?.progress.weeksTotal ?? 0;
  const progressPercent = weeksTotal > 0 ? Math.round((weeksCompleted / weeksTotal) * 100) : 0;
  const certificateTitle =
    selectedMonthRecord?.certificate_title ||
    selectedMonthRecord?.certificate_reward_name ||
    'Monthly certificate';

  useDocumentModalScrollLock(open);

  useEffect(() => {
    if (!open) return undefined;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeDrawer();
        return;
      }
      if (event.key !== 'Tab' || !drawerRef.current) return;
      const focusable = focusableElements(drawerRef.current);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closeDrawer, open]);

  if (!open) return null;

  return createPortal(
    <div
      className="myAdventuresBackdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeDrawer();
      }}
    >
      <aside
        ref={drawerRef}
        className="myAdventuresDrawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="myAdventuresDrawer__header">
          <div>
            <p className="myAdventuresDrawer__eyebrow">Focus Flame Journey</p>
            <h1 id={titleId}>My Adventures</h1>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="myAdventuresDrawer__close"
            onClick={closeDrawer}
            aria-label="Close My Adventures"
          >
            ×
          </button>
        </header>

        <div className="myAdventuresDrawer__scroll">
          <section className="myAdventuresCard myAdventuresPlayer" aria-labelledby="my-adventures-player">
            <div className="myAdventuresPlayer__summary">
              <span className="myAdventuresPlayer__avatar" aria-hidden="true">
                {displayName.trim().charAt(0).toUpperCase() || 'P'}
              </span>
              <div>
                <p className="myAdventuresCard__label">Playing as</p>
                <h2 id="my-adventures-player">{displayName}</h2>
                <p>Week {currentWeek} · {focusCoinsLoading ? 'Loading coins…' : `${focusCoins} Focus Coins`}</p>
              </div>
            </div>
            <div className="myAdventuresPlayer__b4">
              <B4CircleAvatar variant={variant} loading={b4Loading} size="small" alt="" />
              <span className="myAdventuresPlayer__b4Name">
                {selectionRequired ? 'Choose your B-4' : b4Definition.name}
              </span>
              <button
                type="button"
                onClick={() => {
                  closeDrawer();
                  window.setTimeout(requestKidPlayB4Picker, 0);
                }}
              >
                Change B-4
              </button>
            </div>
          </section>

          <section aria-labelledby="my-adventures-months">
            <div className="myAdventuresSectionHeading">
              <p className="myAdventuresCard__label">Journey map</p>
              <h2 id="my-adventures-months">Choose a month</h2>
            </div>
            <div className="myAdventuresMonths">
              {months.map(({ month, locked }) => {
                const selected = month.monthNumber === selectedMonthNumber;
                const current = month.monthNumber === currentMonthNumber;
                const complete = month.progress.weeksTotal > 0 && month.progress.weeksCompleted >= month.progress.weeksTotal;
                return (
                  <button
                    key={month.monthNumber}
                    type="button"
                    className={[
                      'myAdventuresMonth',
                      selected ? 'myAdventuresMonth--selected' : '',
                      complete ? 'myAdventuresMonth--complete' : '',
                    ].filter(Boolean).join(' ')}
                    disabled={locked}
                    aria-current={selected ? 'page' : undefined}
                    onClick={() => onSelectMonth(month.monthNumber)}
                  >
                    <span className="myAdventuresMonth__number">Month {month.monthNumber}</span>
                    <strong>{month.cmsMonth?.month_title || month.title.replace(/^Month \d+:?\s*/i, '')}</strong>
                    <span>{month.progress.weeksCompleted}/{month.progress.weeksTotal} weeks</span>
                    <span className="myAdventuresMonth__status">
                      {locked ? '🔒 Locked' : complete ? '✓ Complete' : current ? 'Current' : 'Available'}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {selectedMonth ? (
            <section className="myAdventuresCard myAdventuresProgress" aria-labelledby="my-adventures-progress">
              <p className="myAdventuresCard__label">Current month progress</p>
              <h2 id="my-adventures-progress">
                {selectedMonthRecord?.month_title || selectedMonth.title}
              </h2>
              {selectedMonthRecord?.month_subtitle ? <h3>{selectedMonthRecord.month_subtitle}</h3> : null}
              <p>{selectedMonth.progress.description}</p>
              <div className="myAdventuresProgress__meta">
                <span>{weeksCompleted}/{weeksTotal} required weeks</span>
                <strong>{progressPercent}%</strong>
              </div>
              <div
                className="myAdventuresProgress__track"
                role="progressbar"
                aria-label={`${selectedMonth.title} progress`}
                aria-valuemin={0}
                aria-valuemax={weeksTotal}
                aria-valuenow={weeksCompleted}
              >
                <span style={{ width: `${progressPercent}%` }} />
              </div>
              <div className="myAdventuresProgress__certificate">
                <span aria-hidden="true">🏅</span>
                <div>
                  <strong>{certificateTitle}</strong>
                  <p>
                    {selectedMonth.progress.certificateEarned
                      ? 'Earned — great work!'
                      : `Complete ${weeksTotal} required weeks to earn this reward.`}
                  </p>
                </div>
              </div>
            </section>
          ) : null}
        </div>
      </aside>
    </div>,
    document.body,
  );
}
