import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { playGameSuccessSound } from '../../lib/gameSuccessSound';
import type { RewardClaimResult } from '../../lib/rewardClaimService';
import './reward-claim-modal.css';

export type RewardClaimModalProps = {
  result: RewardClaimResult | null;
  inventoryPath?: string;
  inventoryLabel?: string;
  onClose: () => void;
};

function resolveBody(result: RewardClaimResult): string {
  if (result.alreadyClaimed) {
    return result.message ?? 'You already claimed this reward.';
  }
  if (result.rewardKind === 'coins' && result.coinsAwarded) {
    return `+${result.coinsAwarded} Focus Coins added to your wallet.`;
  }
  if (result.rewardKind === 'chest') {
    return `${result.rewardName ?? 'Reward'} added to your Collections.`;
  }
  if (result.rewardKind === 'badge') {
    const coinLine =
      result.coinsAwarded && result.coinsAwarded > 0
        ? ` You also earned +${result.coinsAwarded} Focus Coins.`
        : '';
    return `${result.rewardName ?? 'Badge'} unlocked.${coinLine}`;
  }
  return result.message ?? `${result.rewardName ?? 'Your reward'} is ready.`;
}

export default function RewardClaimModal({
  result,
  inventoryPath,
  inventoryLabel,
  onClose,
}: RewardClaimModalProps) {
  const playedRef = useRef(false);

  useEffect(() => {
    if (!result?.ok || playedRef.current) return;
    playedRef.current = true;
    playGameSuccessSound();
  }, [result]);

  useEffect(() => {
    if (!result) playedRef.current = false;
  }, [result]);

  if (!result?.ok) return null;

  const title = result.alreadyClaimed ? 'Reward Already Claimed' : 'Reward Claimed!';
  const viewLabel = inventoryLabel ?? 'Collections';

  return (
    <div className="rewardClaimBackdrop" role="presentation" onClick={onClose}>
      <div
        className="rewardClaimModal"
        role="dialog"
        aria-labelledby="reward-claim-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="rewardClaimClose" onClick={onClose} aria-label="Close">
          ×
        </button>
        {result.imageSrc ? (
          <img
            src={result.imageSrc}
            alt=""
            className="rewardClaimArt"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span className="rewardClaimArt rewardClaimArt--emoji" aria-hidden="true">
            🎁
          </span>
        )}
        <h2 id="reward-claim-title" className="rewardClaimTitle">
          {title}
        </h2>
        {result.rewardName ? (
          <p className="rewardClaimName">{result.rewardName}</p>
        ) : null}
        <p className="rewardClaimBody">{resolveBody(result)}</p>
        <div className="rewardClaimActions">
          {inventoryPath ? (
            <Link to={inventoryPath} className="rewardClaimBtn rewardClaimBtn--primary">
              View {viewLabel}
            </Link>
          ) : null}
          <button type="button" className="rewardClaimBtn" onClick={onClose}>
            {result.alreadyClaimed ? 'Close' : 'Keep Playing'}
          </button>
        </div>
      </div>
    </div>
  );
}
