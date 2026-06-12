import React from 'react';
import LearningMomentCard from './LearningMomentCard';

export type B4LockInTipProps = {
  message: string;
  tips?: string[];
  actionLabel?: string;
  onAction?: () => void;
  avatarSrc?: string;
  label?: string;
  className?: string;
};

/** @deprecated Prefer LearningMomentCard with variant="B4_LOCK_IN" */
export default function B4LockInTip({
  message,
  tips = [],
  actionLabel,
  onAction,
  avatarSrc,
  label = 'B-4 Coach',
  className = '',
}: B4LockInTipProps) {
  return (
    <LearningMomentCard
      variant="B4_LOCK_IN"
      title={label}
      headline={message}
      tips={tips}
      avatarSrc={avatarSrc}
      actionLabel={actionLabel}
      onAction={onAction}
      className={className}
    />
  );
}
