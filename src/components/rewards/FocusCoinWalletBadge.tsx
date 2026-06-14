import React from 'react';
import { useFocusCoinWallet } from '../../hooks/useFocusCoinWallet';
import FocusCoinIcon from './FocusCoinIcon';

type FocusCoinWalletBadgeProps = {
  /** Override wallet total (e.g. during celebration animation). */
  totalCoins?: number;
  className?: string;
  compact?: boolean;
};

const walletStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.35rem',
  padding: '0.35rem 0.65rem',
  borderRadius: '999px',
  background: 'rgba(251, 191, 36, 0.14)',
  border: '1px solid rgba(251, 191, 36, 0.35)',
  color: '#92400e',
  fontWeight: 800,
  fontSize: '0.875rem',
  lineHeight: 1,
  whiteSpace: 'nowrap',
  boxShadow: '0 4px 14px -10px rgba(146, 64, 14, 0.45)',
};

export default function FocusCoinWalletBadge({
  totalCoins: totalCoinsOverride,
  className = '',
  compact = false,
}: FocusCoinWalletBadgeProps) {
  const { totalCoins, loading } = useFocusCoinWallet();
  const displayValue = totalCoinsOverride ?? totalCoins;

  return (
    <div
      className={['focusCoinWalletBadge', className].filter(Boolean).join(' ')}
      style={{
        ...walletStyle,
        ...(compact
          ? { padding: '0.28rem 0.5rem', fontSize: '0.8125rem' }
          : null),
      }}
      aria-label={`${displayValue} Focus Coins`}
      title="Focus Coins"
    >
      <FocusCoinIcon size={16} className="focusCoinWalletBadgeIcon" />
      <span aria-live="polite" style={{ fontVariantNumeric: 'tabular-nums', minWidth: '1.25rem', textAlign: 'center' }}>
        {loading && totalCoinsOverride === undefined ? '—' : displayValue}
      </span>
    </div>
  );
}
