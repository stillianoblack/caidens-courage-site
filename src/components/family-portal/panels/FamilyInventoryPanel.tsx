import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ActiveChildSelector from '../ActiveChildSelector';
import { useActiveChild } from '../../../hooks/useActiveChild';
import { useFamilyDashboardMetrics } from '../../../hooks/useFamilyDashboardMetrics';
import { useFocusCoinWallet } from '../../../hooks/useFocusCoinWallet';
import FocusCoinWalletBadge from '../../rewards/FocusCoinWalletBadge';
import { REWARD_SHOP_ITEMS, type RewardShopCategory } from '../../../data/rewardShopItems';
import { getBadgeArtworkPath, getRewardItemArtworkPath } from '../../../lib/rewardArtwork';
import { getPlayerInventory, type PlayerInventorySnapshot } from '../../../lib/getPlayerInventory';
import { resolveTrackingProgramCode } from '../../../lib/activeProgramContext';
import { MODULE_COMPLETE_EVENT } from '../../../lib/activeChildContext';
import { PortalPageIntro } from '../../portal-design-system';
import InventoryItemCard, {
  type InventoryCardRarity,
  type InventoryShopState,
} from '../../../design-system/kids-adventure/InventoryItemCard';
import '../inventory-panel.css';

const SHOP_CATEGORY_LABELS: Record<RewardShopCategory, string> = {
  decoration: 'Decoration',
  pack: 'Pack',
  skin: 'Skin',
  sticker: 'Sticker',
};

const BADGE_RARITY: Record<string, InventoryCardRarity> = {
  'Focus Flame Badge': 'Epic',
  'Courage Badge': 'Rare',
};

function resolveBadgeRarity(label: string): InventoryCardRarity {
  return BADGE_RARITY[label] ?? 'Common';
}

function resolveShopState(
  itemName: string,
  cost: number,
  walletTotal: number,
  ownedDecorations: string[],
  ownedItems: string[],
): InventoryShopState {
  const owned = ownedDecorations.includes(itemName) || ownedItems.includes(itemName);
  if (owned) return 'owned';
  if (walletTotal >= cost) return 'available';
  return 'need_coins';
}

function InventorySection({
  title,
  emptyLabel,
  items,
  renderItem,
}: {
  title: string;
  emptyLabel: string;
  items: string[];
  renderItem: (item: string) => React.ReactNode;
}) {
  return (
    <section className="inventorySection">
      <h3 className="inventorySectionTitle">{title}</h3>
      {items.length === 0 ? (
        <p className="inventorySectionEmpty">{emptyLabel}</p>
      ) : (
        <div className="inventoryCardGrid">{items.map(renderItem)}</div>
      )}
    </section>
  );
}

export default function FamilyInventoryPanel() {
  const programCode = resolveTrackingProgramCode() ?? undefined;
  const { visibleChildren } = useFamilyDashboardMetrics(programCode);
  const { totalCoins } = useFocusCoinWallet();
  const selectableChildren = useMemo(
    () =>
      visibleChildren
        .map((child) => ({
          participantId: child.studentId,
          displayName: child.displayName,
          firstName: child.displayName,
        }))
        .filter((child) => Boolean(child.participantId)),
    [visibleChildren],
  );
  const { activeChild, selectChild } = useActiveChild(selectableChildren);
  const [inventory, setInventory] = useState<PlayerInventorySnapshot>({
    badges: [],
    items: [],
    stickers: [],
    decorations: [],
  });
  const [loading, setLoading] = useState(true);

  const refreshInventory = useCallback(async () => {
    setLoading(true);
    const snapshot = await getPlayerInventory(activeChild?.participantId);
    setInventory(snapshot);
    setLoading(false);
  }, [activeChild?.participantId]);

  useEffect(() => {
    void refreshInventory();
    const handleRefresh = () => {
      void refreshInventory();
    };
    window.addEventListener(MODULE_COMPLETE_EVENT, handleRefresh);
    return () => window.removeEventListener(MODULE_COMPLETE_EVENT, handleRefresh);
  }, [refreshInventory]);

  return (
    <div className="inventoryPanel">
      <div className="inventoryPanelHeader">
        <PortalPageIntro>
          Collect badges, stickers, and decorations as you explore Courage in the Dark.
        </PortalPageIntro>
        <FocusCoinWalletBadge />
      </div>

      <ActiveChildSelector
        children={selectableChildren}
        activeParticipantId={activeChild?.participantId}
        onSelect={selectChild}
      />

      {loading ? <p className="inventorySectionEmpty">Loading your rewards…</p> : null}

      <InventorySection
        title="Owned Badges"
        emptyLabel="Complete missions to earn badges."
        items={inventory.badges}
        renderItem={(badge) => (
          <InventoryItemCard
            key={badge}
            label={badge}
            imageSrc={getBadgeArtworkPath(badge)}
            variant="badge"
            themeHint={badge}
            owned
            rarity={resolveBadgeRarity(badge)}
          />
        )}
      />

      <InventorySection
        title="Owned Items"
        emptyLabel="Mission rewards will show up here."
        items={inventory.items}
        renderItem={(item) => (
          <InventoryItemCard
            key={item}
            label={item}
            imageSrc={getRewardItemArtworkPath(item)}
            variant="item"
            owned
            themeHint={item}
          />
        )}
      />

      <InventorySection
        title="Game Stickers"
        emptyLabel="Sticker packs unlock from weekly adventures."
        items={inventory.stickers}
        renderItem={(item) => (
          <InventoryItemCard
            key={item}
            label={item}
            imageSrc={getRewardItemArtworkPath(item)}
            variant="sticker"
            themeHint={item}
            owned
          />
        )}
      />

      <InventorySection
        title="Owned Decorations"
        emptyLabel="Save up Focus Coins to unlock decorations in the shop."
        items={inventory.decorations}
        renderItem={(item) => (
          <InventoryItemCard
            key={item}
            label={item}
            imageSrc={getRewardItemArtworkPath(item)}
            variant="decoration"
            owned
            themeHint={item}
          />
        )}
      />

      <section className="inventoryShop">
        <h3 className="inventorySectionTitle">Reward Shop</h3>
        <p className="inventoryShopNote">Unlock rewards with Focus Coins you earn on adventures.</p>
        <div className="inventoryCardGrid inventoryCardGrid--shop">
          {REWARD_SHOP_ITEMS.map((item) => {
            const shopState = resolveShopState(
              item.name,
              item.cost,
              totalCoins,
              inventory.decorations,
              [...inventory.items, ...inventory.stickers],
            );
            return (
              <InventoryItemCard
                key={item.id}
                label={item.name}
                imageSrc={item.image}
                variant="shop"
                cost={item.cost}
                description={item.description.split('.')[0]}
                themeHint={item.name}
                category={SHOP_CATEGORY_LABELS[item.category]}
                shopState={shopState}
                owned={shopState === 'owned'}
                rarity={item.cost >= 150 ? 'Epic' : item.cost >= 100 ? 'Rare' : 'Common'}
                disabled={shopState === 'locked'}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
