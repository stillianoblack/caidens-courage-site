import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import type { CompleteMissionResult, CourageMissionRewardPayload } from '../../types/courageMissionProgress';
import { buildCourageMissionPayload } from '../../data/courageMissionRewards';
import { parseWeekNumberFromWeekId, resolveMissionCompleteBadgeDisplay } from '../../lib/cmsBadgeArtwork';
import { GENERIC_BADGE_PLACEHOLDER_SRC } from '../../lib/weeklyRewardDisplay';
import { getRewardItemArtworkPath } from '../../lib/rewardArtwork';
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
import { claimMissionReward } from '../../lib/missionRewardClaimService';
import { resolvePlayerParticipantId } from '../../lib/resolvePlayerParticipantId';
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
  cinematic = false,
  hideClose = false,
  children,
  footer,
  toastMessage,
}: {
  themeId: CharacterThemeId | null;
  titleId: string;
  onClose: () => void;
  showConfetti?: boolean;
  cinematic?: boolean;
  hideClose?: boolean;
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
    <div
      className={['courageMissionCompleteModal', cinematic ? 'courageMissionCompleteModal--cinematic' : '']
        .filter(Boolean)
        .join(' ')}
      role="presentation"
    >
      <button
        type="button"
        className="courageMissionCompleteModalBackdrop"
        aria-label="Close mission complete celebration"
        onClick={onClose}
      />
      <aside
        className={[
          'courageMissionCompleteModalPanel',
          cinematic ? 'courageMissionCompleteModalPanel--cinematic' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <GoldConfetti active={showConfetti} />
        <div className="characterSheetPanelShell courageMissionCompleteSheet">
          <div
            className={[
              'characterSheetPanelInner courageMissionCompleteSheetInner',
              cinematic ? 'courageMissionCompleteSheetInner--cinematic' : '',
              themeClass,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <button
              type="button"
              className="characterSheetPanelClose courageMissionCompleteClose"
              aria-label="Close and return to adventure map"
              onClick={onClose}
              hidden={hideClose}
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
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [localResult, setLocalResult] = useState<CompleteMissionResult>(result);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const shareDate = useMemo(() => new Date(), []);
  const returnLabel = useMemo(
    () => resolveMissionCompleteReturnLabel(location.pathname, location.search),
    [location.pathname, location.search],
  );

  const isReplay = localResult.ok && localResult.alreadyCompleted && localResult.rewardClaimed;
  const rewardPending =
    localResult.ok && !claimed && (localResult.rewardPending || !localResult.rewardClaimed);
  const hasCoinReward =
    localResult.ok && !isReplay && (claimed || (!rewardPending && !localResult.alreadyCompleted));
  const weekProgress = localResult.ok
    ? {
        completed: localResult.weekMissionsCompleted,
        total: localResult.weekMissionsTotal,
        badgeUnlocked: localResult.weekBadgeUnlocked,
        badgeJustUnlocked: localResult.weekBadgeJustUnlocked,
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
    const resolved = resolveMissionCompleteBadgeDisplay(
      adventureModules,
      weekNumber,
      payload.mission_id,
      payload.badge_unlocked,
    );
    return {
      name: resolved.name,
      imageUrl: resolved.imageUrl,
      weekLabel: resolved.weekLabel,
    };
  }, [adventureModules, payload.badge_unlocked, payload.mission_id, weekNumber]);

  const discoveryName = payload.character_discovery_name?.trim() || null;
  const discoveryImage = payload.character_discovery_image_url?.trim() || null;
  const missionRewardImage = getRewardItemArtworkPath(payload.reward_item);
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
    setLocalResult(result);
    setClaimed(Boolean(result.ok && result.rewardClaimed));
  }, [result]);

  useEffect(() => {
    if (!localResult.ok || isReplay || rewardPending) return;
    sounds?.playMissionComplete?.();
    if ('newCoinTotal' in localResult && localResult.newCoinTotal != null) {
      notifyFocusCoinWalletUpdated(localResult.newCoinTotal);
    }
  }, [isReplay, localResult, rewardPending, sounds]);

  useEffect(() => {
    if (!localResult.ok || isReplay || !showWeekBadgeCelebration) return;
    const timer = window.setTimeout(() => {
      sounds?.playBadgeSparkle?.();
    }, 420);
    return () => window.clearTimeout(timer);
  }, [isReplay, localResult, showWeekBadgeCelebration, sounds]);

  const handleClaimReward = useCallback(async () => {
    if (claiming || claimed) return;
    const participantId = resolvePlayerParticipantId();
    const weekNumber = payload.week_number ?? parseWeekNumberFromWeekId(payload.week_id);
    const completionPayload = buildCourageMissionPayload(payload.mission_id, weekNumber, participantId ?? undefined);
    if (!completionPayload) {
      setClaimError('Select a child in the Family Portal to claim rewards.');
      return;
    }

    setClaiming(true);
    setClaimError(null);
    try {
      const claimResult = await claimMissionReward({
        ...completionPayload,
        mission_title: payload.mission_title,
        badge_unlocked: payload.badge_unlocked,
        character_discovery_id: payload.character_discovery_id,
        character_discovery_name: payload.character_discovery_name,
        character_discovery_image_url: payload.character_discovery_image_url,
      });

      if (!claimResult.ok) {
        setClaimError(claimResult.message ?? 'Could not claim reward. Please try again.');
        return;
      }

      setClaimed(true);
      sounds?.playCoinTick?.();
      if (claimResult.weekBadgeJustUnlocked) {
        window.setTimeout(() => sounds?.playBadgeSparkle?.(), 320);
      }

      setLocalResult((current) => {
        if (!current.ok) return current;
        return {
          ...current,
          rewardPending: false,
          rewardClaimed: true,
          weekBadgeJustUnlocked: claimResult.weekBadgeJustUnlocked ?? current.weekBadgeJustUnlocked,
          ...(!current.alreadyCompleted
            ? {
                newCoinTotal: claimResult.newCoinTotal,
                coinsEarned: claimResult.coinsAwarded ?? payload.coins_earned,
              }
            : {}),
        };
      });
    } finally {
      setClaiming(false);
    }
  }, [claimed, claiming, payload, sounds]);

  const handleShareAchievement = useCallback(async () => {
    if (!captureRef.current || sharing) return;
    setSharing(true);
    try {
      const coinsEarned =
        hasCoinReward && localResult.ok && 'coinsEarned' in localResult
          ? localResult.coinsEarned
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
  }, [hasCoinReward, localResult, payload, shareDate, sharing]);

  const footerActions = rewardPending ? (
    <>
      <button
        type="button"
        className={['characterDetailCta', ctaThemeClass, 'courageMissionCompletePrimaryCta', 'courageMissionCompleteClaimCta'].filter(Boolean).join(' ')}
        onClick={() => {
          void handleClaimReward();
        }}
        disabled={claiming}
      >
        {claiming ? 'Claiming…' : 'Claim Reward'}
      </button>
      {claimError ? (
        <p className="courageMissionCompleteClaimError" role="alert">
          {claimError}
        </p>
      ) : null}
    </>
  ) : (
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

  if (!localResult.ok) {
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
          <p className="characterProfileTagline">{localResult.message}</p>
        </div>
      </MissionCompleteModalShell>
    );
  }

  return (
    <MissionCompleteModalShell
      themeId={themeId}
      titleId={titleId}
      onClose={rewardPending ? () => {} : onReturnToMap}
      showConfetti={showWeekBadgeCelebration || claimed}
      cinematic={rewardPending}
      hideClose={rewardPending}
      footer={footerActions}
      toastMessage={toastMessage}
    >
      <div className="characterSheetPanelScroll courageMissionCompleteScroll">
        <div ref={captureRef} className="courageMissionCompleteContent courageMissionCompleteContent--claim">
          <header className={rewardPending ? 'courageMissionCompleteClaimHero' : 'courageMissionCompleteHeroCompact'}>
            {!rewardPending ? (
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
                {hasCoinReward && 'coinsEarned' in localResult ? (
                  <span className="courageMissionCompleteCoinChip" aria-label={`+${localResult.coinsEarned} Focus Coins`}>
                    <FocusCoinIcon size={16} />
                    +{localResult.coinsEarned}
                  </span>
                ) : null}
              </div>
            ) : null}

            <div className="courageMissionCompleteHeadlines">
              <h2 id={titleId} className="courageMissionCompleteMainTitle">
                {isReplay ? 'Replay Complete!' : 'Mission Complete!'}
              </h2>
              <p className="courageMissionCompleteWeekEyebrow">{weekHeader}</p>
              <p className="courageMissionCompleteGameTitle">{gameTitle}</p>
              {rewardPending ? (
                <p className="courageMissionCompletePendingCoins" aria-label={`+${payload.coins_earned} Focus Coins ready to claim`}>
                  <FocusCoinIcon size={18} />
                  +{payload.coins_earned} Focus Coins
                </p>
              ) : null}
              {weekProgress ? (
                <p className="courageMissionCompleteProgressStat" aria-label={`${weekProgress.completed} of ${weekProgress.total} missions complete`}>
                  {weekProgress.completed} / {weekProgress.total} Missions Complete
                </p>
              ) : null}
            </div>
          </header>

          <section
            className={[
              'courageMissionCompleteBadgeShowcase',
              rewardPending ? 'courageMissionCompleteBadgeShowcase--claimHero' : '',
              badgeLocked ? 'courageMissionCompleteBadgeShowcase--locked' : 'courageMissionCompleteBadgeShowcase--unlocked',
              showWeekBadgeCelebration ? 'courageMissionCompleteBadgeShowcase--celebrate' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-label={badgeLocked ? 'Locked week badge preview' : 'Week badge unlocked'}
          >
            <div className="courageMissionCompleteBadgeFrame courageMissionCompleteBadgeFrame--hero">
              <img
                src={badgeDisplay.imageUrl ?? GENERIC_BADGE_PLACEHOLDER_SRC}
                alt=""
                className={[
                  'courageMissionCompleteBadgeArt',
                  !badgeDisplay.imageUrl ? 'courageMissionCompleteBadgeArt--placeholder' : '',
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
            {discoveryName ? (
              <p className="courageMissionCompleteDiscoveryLabel">
                Discovery: {discoveryName}
              </p>
            ) : null}
          </section>

          {!rewardPending && !isReplay && (discoveryName || payload.reward_item) ? (
            <section className="courageMissionCompleteMissionRewards" aria-label="Mission rewards">
              {discoveryName ? (
                <div className="courageMissionCompleteMissionReward">
                  {discoveryImage ? (
                    <img
                      src={discoveryImage}
                      alt=""
                      className="courageMissionCompleteMissionRewardArt"
                    />
                  ) : null}
                  <div>
                    <p className="courageMissionCompleteMissionRewardLabel">Character Discovery</p>
                    <p className="courageMissionCompleteMissionRewardName">{discoveryName}</p>
                  </div>
                </div>
              ) : null}
              {payload.reward_item ? (
                <div className="courageMissionCompleteMissionReward">
                  {missionRewardImage ? (
                    <img
                      src={missionRewardImage}
                      alt=""
                      className="courageMissionCompleteMissionRewardArt courageMissionCompleteMissionRewardArt--item"
                    />
                  ) : (
                    <span
                      className="courageMissionCompleteMissionRewardArt courageMissionCompleteMissionRewardArt--item courageMissionCompleteMissionRewardArt--placeholder"
                      aria-hidden="true"
                    >
                      ★
                    </span>
                  )}
                  <div>
                    <p className="courageMissionCompleteMissionRewardLabel">Mission Reward</p>
                    <p className="courageMissionCompleteMissionRewardName">{payload.reward_item}</p>
                  </div>
                </div>
              ) : null}
            </section>
          ) : null}

          {weekProgress && !rewardPending ? (
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
