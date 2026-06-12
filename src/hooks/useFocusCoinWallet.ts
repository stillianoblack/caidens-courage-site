import { useCallback, useEffect, useState } from 'react';
import {
  ACTIVE_CHILD_EVENT,
  MODULE_COMPLETE_EVENT,
} from '../lib/activeChildContext';
import { readActiveChildParticipantId, CHILD_PROFILE_UPDATED_EVENT } from '../config/activeChildParticipant';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export const FOCUS_COIN_WALLET_EVENT = 'cc-focus-coin-wallet-updated';

type WalletEventDetail = {
  totalCoins?: number;
};

export function useFocusCoinWallet(): { totalCoins: number; loading: boolean; refresh: () => Promise<void> } {
  const [totalCoins, setTotalCoins] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured() || !supabase) {
      setTotalCoins(0);
      setLoading(false);
      return;
    }

    const participantId = readActiveChildParticipantId();
    if (!participantId) {
      setTotalCoins(0);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('player_wallets')
      .select('total_coins')
      .eq('participant_id', participantId)
      .maybeSingle();

    if (error) {
      console.warn('[FOCUS_COIN_WALLET] Failed to load wallet', error);
      setLoading(false);
      return;
    }

    setTotalCoins(data?.total_coins ?? 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();

    const handleRefresh = () => {
      void refresh();
    };

    const handleWalletEvent = (event: Event) => {
      const detail = (event as CustomEvent<WalletEventDetail>).detail;
      if (typeof detail?.totalCoins === 'number') {
        setTotalCoins(detail.totalCoins);
        setLoading(false);
        return;
      }
      void refresh();
    };

    window.addEventListener(MODULE_COMPLETE_EVENT, handleRefresh);
    window.addEventListener(ACTIVE_CHILD_EVENT, handleRefresh);
    window.addEventListener(CHILD_PROFILE_UPDATED_EVENT, handleRefresh);
    window.addEventListener(FOCUS_COIN_WALLET_EVENT, handleWalletEvent);

    return () => {
      window.removeEventListener(MODULE_COMPLETE_EVENT, handleRefresh);
      window.removeEventListener(ACTIVE_CHILD_EVENT, handleRefresh);
      window.removeEventListener(CHILD_PROFILE_UPDATED_EVENT, handleRefresh);
      window.removeEventListener(FOCUS_COIN_WALLET_EVENT, handleWalletEvent);
    };
  }, [refresh]);

  return { totalCoins, loading, refresh };
}

export function notifyFocusCoinWalletUpdated(totalCoins: number): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(FOCUS_COIN_WALLET_EVENT, { detail: { totalCoins } }),
  );
}
