import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import type { CompleteMissionResult, CourageMissionRewardPayload } from '../../types/courageMissionProgress';
import { parseWeekNumberFromWeekId, resolveBadgeDisplay } from '../../lib/cmsBadgeArtwork';
import { formatWeekHeader, sanitizeMissionGameTitle } from '../../lib/gameDisplayTitles';
import {
  resolveBadgeUnlockHint,
  resolveCmsWeekTitle,
  resolveMissionsRemainingMessage,
} from '../../lib/weekBadgeProgression';
import { useFamilyAdventureModules } from '../../hooks/useAdventureModules';
import { shareCampAchievement } from '../../lib/shareCampAchievement';
import { notifyFocusCoinWalletUpdated } from '../../hooks/useFocusCoinWallet';
import { resolveMissionCompleteReturnLabel } from '../../lib/mobileGameBackNav';
import FocusCoinIcon from '../rewards/FocusCoinIcon';
import { resolveCharacterThemeId, CHARACTER_HOTSPOT_IMAGES } from '../../design-system/kids-adventure/characterThemes';
import GoldConfetti from '../rewards/GoldConfetti';
import '../../design-system/components/character-sheet-panel.css';
import '../../design-system/components/character-profile-panel.css';
import '../../components/family-portal/character-detail-panel.css';
import './courage-mission-complete.css';
import '../rewards/gold-confetti.css';

type CelebrationSounds = {
  playMissionComplete?: () => void;
  playCoinTick?: () => void;
  playBadgeSparkle?: () => void;
};

type CourageMissionCompleteCelebrationProps = {
  payload: CourageMissionRewardPayload;
  result: CompleteMissionResult;
  onReturnToMap: () => void;
  sounds?: CelebrationSounds;
};

type CharacterThemeId = 'caiden' | 'miranda' | 'zeke' | 'charlie' | 'b4';

function MissionCompleteModalShell({
  themeId,
  titleId,
  onClose,
  showConfetti = true,
  children,
  footer,
  toastMessage,
}: {
  themeId: CharacterThemeId | null;
  titleId: string;
  onClose: () => void;
  showConfetti?: boolean;
  children: React.ReactNode;
  footer: React.ReactNode;
  toastMessage?: string | null;
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const themeClass = themeId ? `characterSheetPanelInner--${themeId}` : '';

  return createPortal(
    <div className="courageMissionCompleteModal" role="presentation">
      <button
        type="button"
        className="courageMissionCompleteModalBackdrop"
        aria-label="Close mission complete celebration"
        onClick={onClose}
      />
      <aside
        className="courageMissionCompleteModalPanel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <GoldConfetti active={showConfetti} />
        <div className="characterSheetPanelShell courageMissionCompleteSheet">
          <div className={`characterSheetPanelInner courageMissionCompleteSheetInner ${themeClass}`}>
            <button
              type="button"
              className="characterSheetPanelClose courageMissionCompleteClose"
              aria-label="Close and return to adventure map"
              onClick={onClose}
            >
              ×
            </button>
            {children}
            <footer className="characterSheetPanelFooter characterProfileFooter courageMissionCompleteFooter">
              {footer}
            </footer>
          </div>
        </div>
        {toastMessage ? (
          <p className="courageMissionCompleteToast" role="status">
            {toastMessage}
          </p>
        ) : null}
      </aside>
    </div>,
    document.body,
  );
}

export default function CourageMissionCompleteCelebration({
  payload,
  result,
  onReturnToMap,
  sounds,
}: CourageMissionCompleteCelebrationProps) {
  const captureRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { modules: adventureModules } = useFamilyAdventureModules();
  const [sharing, setSharing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const shareDate = useMemo(() => new Date(), []);
  const returnLabel = useMemo(
    () => resolveMissionCompleteReturnLabel(location.pathname, location.search),
    [location.pathname, location.search],
  );

  const isReplay = result.ok && result.alreadyCompleted;
  const hasCoinReward = result.ok && !result.alreadyCompleted;
  const weekProgress = result.ok
    ? {
        completed: result.weekMissionsCompleted,
        total: result.weekMissionsTotal,
        badgeUnlocked: result.weekBadgeUnlocked,
        badgeJustUnlocked: result.weekBadgeJustUnlocked,
      }
    : null;

  const weekNumber = payload.week_number ?? parseWeekNumberFromWeekId(payload.week_id);
  const weekHeader = useMemo(
    () => formatWeekHeader(weekNumber, resolveCmsWeekTitle(adventureModules, weekNumber)),
    [adventureModules, weekNumber],
  );
  const gameTitle = useMemo(
    () => sanitizeMissionGameTitle(payload.mission_title, weekNumber),
    [payload.mission_title, weekNumber],
  );

  const badgeDisplay = useMemo(() => {
    if (payload.badge_image_url) {
      return {
        name: payload.badge_unlocked,
        imageUrl: payload.badge_image_url,
        weekLabel: payload.badge_week_label ?? null,
      };
    }
    const resolved = resolveBadgeDisplay(payload.badge_unlocked, adventureModules, weekNumber);
    return {
      name: resolved.name,
      imageUrl: resolved.imageUrl,
      weekLabel: resolved.weekLabel,
    };
  }, [adventureModules, payload, weekNumber]);

  const badgeUnlocked =
    weekProgress?.badgeUnlocked === true || weekProgress?.badgeJustUnlocked === true;
  const badgeLocked = !badgeUnlocked;
  const progressPct =
    weekProgress && weekProgress.total > 0
      ? Math.round((weekProgress.completed / weekProgress.total) * 100)
      : 0;
  const missionsRemainingLabel =
    weekProgress != null
      ? resolveMissionsRemainingMessage(weekProgress.completed, weekProgress.total)
      : '';
  const progressBadgeStatus =
    weekProgress != null
      ? badgeUnlocked
        ? '🏅 Badge unlocked'
        : `🔒 ${badgeDisplay.name} — ${resolveBadgeUnlockHint(
            weekProgress.completed,
            weekProgress.total,
            false,
          )}`
      : '';

  const themeId = resolveCharacterThemeId(payload.character_id ?? payload.character_name);
  const characterHeroSrc = themeId ? CHARACTER_HOTSPOT_IMAGES[themeId] : null;
  const ctaThemeClass = themeId ? `characterDetailCta--${themeId}` : '';
  const titleId = 'courage-mission-complete-title';
  const showWeekBadgeCelebration = !isReplay && weekProgress?.badgeJustUnlocked === true;

  useEffect(() => {
    if (!result.ok || result.alreadyCompleted) return;
    sounds?.playMissionComplete?.();
    if ('newCoinTotal' in result) {
      notifyFocusCoinWalletUpdated(result.newCoinTotal);
    }
  }, [result, sounds]);

  useEffect(() => {
    if (!result.ok || result.alreadyCompleted || !showWeekBadgeCelebration) return;
    const timer = window.setTimeout(() => {
      sounds?.playBadgeSparkle?.();
    }, 420);
    return () => window.clearTimeout(timer);
  }, [result, showWeekBadgeCelebration, sounds]);

  const handleShareAchievement = useCallback(async () => {
    if (!captureRef.current || sharing) return;
    setSharing(true);
    try {
      const coinsEarned =
        hasCoinReward && result.ok && !result.alreadyCompleted && 'coinsEarned' in result
          ? result.coinsEarned
          : payload.coins_earned;

      const shareResult = await shareCampAchievement({
        element: captureRef.current,
        payload,
        coinsEarned,
        date: shareDate,
      });
      setToastMessage(shareResult.message);
      window.setTimeout(() => setToastMessage(null), 2600);
    } catch (err) {
      console.warn('[ACHIEVEMENT_CAPTURE] Failed to save achievement image', err);
      setToastMessage('Saved to device. Camp Gallery upload failed.');
      window.setTimeout(() => setToastMessage(null), 2600);
    } finally {
      setSharing(false);
    }
  }, [hasCoinReward, payload, result, shareDate, sharing]);

  const footerActions = (
    <>
      <button
        type="button"
        className={['characterDetailCta', ctaThemeClass, 'courageMissionCompletePrimaryCta'].filter(Boolean).join(' ')}
        onClick={onReturnToMap}
      >
        {returnLabel}
      </button>
      <button
        type="button"
        className="courageMissionCompleteSecondaryCta"
        onClick={() => {
          void handleShareAchievement();
        }}
        disabled={sharing}
      >
        {sharing ? 'Saving…' : 'Share Achievement'}
      </button>
      <p className="courageMissionCompleteShareHint">
        {showWeekBadgeCelebration
          ? 'Save your week badge moment for the camp gallery.'
          : 'Save your mission moment for the camp gallery.'}
      </p>
    </>
  );

  if (!result.ok) {
    return (
      <MissionCompleteModalShell
        themeId={themeId}
        titleId={titleId}
        onClose={onReturnToMap}
        showConfetti={false}
        footer={footerActions}
        toastMessage={toastMessage}
      >
        <div className="courageMissionCompleteHero courageMissionCompleteHero--error">
          <div className="courageMissionCompleteVictoryRing courageMissionCompleteVictoryRing--error" aria-hidden="true">
            !
          </div>
          <h2 id={titleId} className="characterProfileName">
            Progress Not Saved
          </h2>
          <p className="characterProfileTagline">{result.message}</p>
        </div>
      </MissionCompleteModalShell>
    );
  }

  return (
    <MissionCompleteModalShell
      themeId={themeId}
      titleId={titleId}
      onClose={onReturnToMap}
      showConfetti={showWeekBadgeCelebration}
      footer={footerActions}
      toastMessage={toastMessage}
    >
      <div className="characterSheetPanelScroll courageMissionCompleteScroll">
        <div ref={captureRef} className="courageMissionCompleteContent">
          <header className="courageMissionCompleteHeroCompact">
            <div
              className={[
                'courageMissionCompletePortrait',
                'characterDetailPortrait',
                themeId ? `characterDetailPortrait--${themeId}` : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {characterHeroSrc ? (
                <img
                  src={characterHeroSrc}
                  alt=""
                  className="characterDetailPortraitImage"
                  width={88}
                  height={88}
                  decoding="async"
                />
              ) : (
                <span className="characterDetailPortraitFallback">
                  {payload.character_name.charAt(0)}
                </span>
              )}
              {hasCoinReward ? (
                <span className="courageMissionCompleteCoinChip" aria-label={`+${result.coinsEarned} Focus Coins`}>
                  <FocusCoinIcon size={16} />
                  +{result.coinsEarned}
                </span>
              ) : null}
            </div>

            <div className="courageMissionCompleteHeadlines">
              <h2 id={titleId} className="courageMissionCompleteMainTitle">
                {isReplay ? 'Replay Complete!' : 'Mission Complete!'}
              </h2>
              <p className="courageMissionCompleteWeekEyebrow">{weekHeader}</p>
              <p className="courageMissionCompleteGameTitle">{gameTitle}</p>
              {weekProgress ? (
                <p className="courageMissionCompleteProgressStat" aria-label={`${weekProgress.completed} of ${weekProgress.total} missions complete`}>
                  🏅 {weekProgress.completed} / {weekProgress.total} Missions Complete
                </p>
              ) : null}
            </div>
          </header>

          <section
            className={[
              'courageMissionCompleteBadgeShowcase',
              badgeLocked ? 'courageMissionCompleteBadgeShowcase--locked' : 'courageMissionCompleteBadgeShowcase--unlocked',
              showWeekBadgeCelebration ? 'courageMissionCompleteBadgeShowcase--celebrate' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-label={badgeLocked ? 'Locked week badge preview' : 'Week badge unlocked'}
          >
            <div className="courageMissionCompleteBadgeFrame courageMissionCompleteBadgeFrame--hero">
              <img
                src={badgeDisplay.imageUrl}
                alt=""
                className={[
                  'courageMissionCompleteBadgeArt',
                  badgeLocked ? 'courageMissionCompleteBadgeArt--locked' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              />
              {badgeLocked ? (
                <span className="courageMissionCompleteBadgeLock" aria-hidden="true">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5zm0 2a3 3 0 0 1 3 3v3H9V6a3 3 0 0 1 3-3z" />
                  </svg>
                </span>
              ) : null}
            </div>
            <p className="courageMissionCompleteBadgeName">{badgeDisplay.name}</p>
          </section>

          {weekProgress ? (
            <section className="courageMissionCompleteProgressCard" aria-label="Week progress">
              <span className="courageMissionCompleteProgressLabel">Week Progress</span>
              <div
                className="courageMissionCompleteProgressTrack"
                role="progressbar"
                aria-valuenow={weekProgress.completed}
                aria-valuemin={0}
                aria-valuemax={weekProgress.total}
                aria-label={`${weekProgress.completed} of ${weekProgress.total} missions complete`}
              >
                <div
                  className="courageMissionCompleteProgressFill"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="courageMissionCompleteProgressRemaining">{missionsRemainingLabel}</p>
              <p
                className={[
                  'courageMissionCompleteProgressBadgeStatus',
                  badgeUnlocked ? 'courageMissionCompleteProgressBadgeStatus--unlocked' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {progressBadgeStatus}
              </p>
            </section>
          ) : null}
        </div>
      </div>
    </MissionCompleteModalShell>
  );
}
