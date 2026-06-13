import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CompleteMissionResult, CourageMissionRewardPayload } from '../../types/courageMissionProgress';
import { readActiveChildNickname } from '../../config/activeChildNickname';
import { getNextUnlockPreview } from '../../data/rewardShopItems';
import { getBadgeArtworkPath, getRewardItemArtworkPath } from '../../lib/rewardArtwork';
import { shareCampAchievement } from '../../lib/shareCampAchievement';
import { notifyFocusCoinWalletUpdated } from '../../hooks/useFocusCoinWallet';
import { COURAGE_LOGO_SRC } from '../../config/courageNav';
import FocusCoinIcon from '../rewards/FocusCoinIcon';
import { resolveCharacterThemeId, CHARACTER_HOTSPOT_IMAGES } from '../../design-system/kids-adventure/characterThemes';
import GoldConfetti from '../rewards/GoldConfetti';
import './courage-mission-complete.css';
import '../rewards/gold-confetti.css';

const FOCUS_FLAME_BRAND_SRC = '/images/icons/focus-flame-mark.svg';

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

function buildCoinSteps(from: number, to: number, stepCount = 6): number[] {
  if (from >= to) return [to];
  const steps: number[] = [];
  for (let i = 0; i < stepCount; i += 1) {
    const progress = i / (stepCount - 1);
    steps.push(Math.round(from + (to - from) * progress));
  }
  return Array.from(new Set(steps));
}

function useSteppedCoinCounter(
  from: number,
  to: number,
  enabled: boolean,
  durationMs = 1000,
  onStep?: (value: number) => void,
): number {
  const [displayValue, setDisplayValue] = useState(enabled ? from : to);
  const lastTickedRef = useRef(from);

  useEffect(() => {
    if (!enabled) {
      setDisplayValue(to);
      return undefined;
    }

    const steps = buildCoinSteps(from, to);
    if (steps.length <= 1) {
      setDisplayValue(to);
      onStep?.(to);
      return undefined;
    }

    let frameId = 0;
    let stepIndex = 0;
    const start = performance.now();
    lastTickedRef.current = steps[0];
    setDisplayValue(steps[0]);

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = 1 - (1 - progress) ** 3;
      const targetIndex = Math.min(
        steps.length - 1,
        Math.floor(eased * (steps.length - 1)),
      );

      while (stepIndex < targetIndex) {
        stepIndex += 1;
        const nextValue = steps[stepIndex];
        if (nextValue !== lastTickedRef.current) {
          lastTickedRef.current = nextValue;
          setDisplayValue(nextValue);
          onStep?.(nextValue);
        }
      }

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
        return;
      }

      if (lastTickedRef.current !== to) {
        lastTickedRef.current = to;
        setDisplayValue(to);
        onStep?.(to);
      }
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [durationMs, enabled, from, onStep, to]);

  return displayValue;
}

function formatShareDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function CourageMissionCompleteCelebration({
  payload,
  result,
  onReturnToMap,
  sounds,
}: CourageMissionCompleteCelebrationProps) {
  const captureRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const shareDate = useMemo(() => new Date(), []);
  const displayName = readActiveChildNickname();
  const isReplay = result.ok && result.alreadyCompleted;
  const hasCoinReward = result.ok && !result.alreadyCompleted;
  const oldTotal = hasCoinReward ? result.oldCoinTotal : 0;
  const newTotal = hasCoinReward ? result.newCoinTotal : 0;

  const handleCoinStep = useCallback(() => {
    sounds?.playCoinTick?.();
  }, [sounds]);

  const animatedCoins = useSteppedCoinCounter(
    oldTotal,
    newTotal,
    hasCoinReward,
    1000,
    handleCoinStep,
  );

  const nextUnlock = useMemo(
    () => (hasCoinReward ? getNextUnlockPreview(newTotal) : null),
    [hasCoinReward, newTotal],
  );
  const themeId = resolveCharacterThemeId(payload.character_id ?? payload.character_name);
  const themeClass = themeId ? `courageMissionComplete--${themeId}` : '';
  const characterHeroSrc = themeId ? CHARACTER_HOTSPOT_IMAGES[themeId] : null;

  useEffect(() => {
    if (!result.ok || result.alreadyCompleted) return;
    sounds?.playMissionComplete?.();
    if ('newCoinTotal' in result) {
      notifyFocusCoinWalletUpdated(result.newCoinTotal);
    }
  }, [result, sounds]);

  useEffect(() => {
    if (!result.ok || result.alreadyCompleted || !payload.badge_unlocked) return;
    const timer = window.setTimeout(() => {
      sounds?.playBadgeSparkle?.();
    }, 280);
    return () => window.clearTimeout(timer);
  }, [payload.badge_unlocked, result, sounds]);

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

  if (!result.ok) {
    return (
      <div className="courageMissionComplete courageMissionComplete--error" role="alert">
        <div className="courageMissionCompleteBadge" aria-hidden="true">
          !
        </div>
        <h2 className="courageMissionCompleteTitle">Progress Not Saved</h2>
        <p className="courageMissionCompleteBody">{result.message}</p>
        <button type="button" className="courageMissionCompleteBtn" onClick={onReturnToMap}>
          ← Back to Adventure Map
        </button>
      </div>
    );
  }

  return (
    <div className={['courageMissionComplete', themeClass].filter(Boolean).join(' ')} role="status">
      <GoldConfetti active={!isReplay} />

      <div ref={captureRef} className="courageMissionCompleteCapture">
        <div className="courageMissionCompleteInner">
          {characterHeroSrc ? (
            <img
              src={characterHeroSrc}
              alt=""
              className="courageMissionCompleteHeroArt"
            />
          ) : null}

          <div className="courageMissionCompleteBadge" aria-hidden="true">
            ✓
          </div>

          <p className="courageMissionCompleteEyebrow">Mission Complete</p>
          <h2 className="courageMissionCompleteTitle">{payload.mission_title}</h2>
          <p className="courageMissionCompleteCharacter">{payload.character_name}</p>
          <p className="courageMissionCompleteBody">
            {isReplay
              ? 'Replay complete — you already earned this reward.'
              : 'Great work! Your rewards are ready.'}
          </p>

          {!isReplay ? (
            <>
              <div className="courageMissionCompleteRewards">
                <div className="courageMissionCompleteRewardCard courageMissionCompleteRewardCard--coins">
                  <p className="courageMissionCompleteRewardLabel">Focus Coins</p>
                  <p className="courageMissionCompleteCoinTotal" aria-live="polite">
                    <FocusCoinIcon size={22} className="courageMissionCompleteCoinIcon" />
                    {animatedCoins}
                  </p>
                  <p className="courageMissionCompleteCoinEarned">+{result.coinsEarned} earned</p>
                </div>

                <div className="courageMissionCompleteRewardCard">
                  <p className="courageMissionCompleteRewardLabel">Badge Unlocked</p>
                  <img
                    src={getBadgeArtworkPath(payload.badge_unlocked)}
                    alt=""
                    className="courageMissionCompleteArt"
                  />
                  <p className="courageMissionCompleteRewardValue">{payload.badge_unlocked}</p>
                </div>

                {payload.reward_item ? (
                  <div className="courageMissionCompleteRewardCard courageMissionCompleteRewardCard--item">
                    <p className="courageMissionCompleteRewardLabel">Reward Item</p>
                    <img
                      src={getRewardItemArtworkPath(payload.reward_item)}
                      alt=""
                      className="courageMissionCompleteArt"
                    />
                    <p className="courageMissionCompleteRewardValue">{payload.reward_item}</p>
                  </div>
                ) : null}
              </div>

              <div className="courageMissionCompleteWallet">
                <p className="courageMissionCompleteWalletLabel">Your Wallet</p>
                <p className="courageMissionCompleteWalletRow">
                  <span className="courageMissionCompleteWalletOld">{oldTotal}</span>
                  <span className="courageMissionCompleteWalletArrow" aria-hidden="true">
                    →
                  </span>
                  <span className="courageMissionCompleteWalletNew">{newTotal}</span>
                  <span className="courageMissionCompleteWalletUnit">Focus Coins</span>
                </p>
              </div>
            </>
          ) : (
            <div className="courageMissionCompleteRewards">
              <div className="courageMissionCompleteRewardCard">
                <p className="courageMissionCompleteRewardLabel">Badge</p>
                <img
                  src={getBadgeArtworkPath(payload.badge_unlocked)}
                  alt=""
                  className="courageMissionCompleteArt"
                />
                <p className="courageMissionCompleteRewardValue">{payload.badge_unlocked}</p>
              </div>
            </div>
          )}

          <footer className="courageMissionCompleteBrand">
            <img
              src={FOCUS_FLAME_BRAND_SRC}
              alt=""
              className="courageMissionCompleteBrandLogo"
            />
            <img
              src={COURAGE_LOGO_SRC}
              alt=""
              className="courageMissionCompleteBrandMark"
            />
            <div>
              <p className="courageMissionCompleteBrandTitle">Caiden&apos;s Courage</p>
              <p className="courageMissionCompleteBrandSub">Focus Flame Academy</p>
            </div>
            <p className="courageMissionCompleteBrandMeta">
              {displayName ? `${displayName} · ` : ''}
              {formatShareDate(shareDate)}
            </p>
          </footer>
        </div>
      </div>

      {!isReplay && nextUnlock ? (
        <div className="courageMissionCompleteNextUnlock courageMissionCompleteNextUnlock--belowCard">
          <p className="courageMissionCompleteNextUnlockEyebrow">Next Unlock</p>
          <div className="courageMissionCompleteNextUnlockBody">
            <img src={nextUnlock.item.image} alt="" className="courageMissionCompleteNextUnlockArt" />
            <div>
              <p className="courageMissionCompleteNextUnlockName">{nextUnlock.item.name}</p>
              <p className="courageMissionCompleteNextUnlockAway">{nextUnlock.coinsAway} Coins Away</p>
            </div>
          </div>
        </div>
      ) : null}

      {!isReplay ? (
        <p className="courageMissionCompleteShareHint">Save your badge moment for the camp gallery.</p>
      ) : null}

      <div className="courageMissionCompleteActions">
        <button type="button" className="courageMissionCompleteBtn" onClick={onReturnToMap}>
          ← Back to Adventure Map
        </button>
        <button
          type="button"
          className="courageMissionCompleteBtn courageMissionCompleteBtn--secondary"
          onClick={() => {
            void handleShareAchievement();
          }}
          disabled={sharing}
        >
          {sharing ? 'Saving…' : 'Share Achievement'}
        </button>
      </div>

      {toastMessage ? (
        <p className="courageMissionCompleteToast" role="status">
          {toastMessage}
        </p>
      ) : null}
    </div>
  );
}
