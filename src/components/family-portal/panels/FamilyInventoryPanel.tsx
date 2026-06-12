import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ActiveChildSelector from '../ActiveChildSelector';
import { useActiveChild } from '../../../hooks/useActiveChild';
import { useFamilyDashboardMetrics } from '../../../hooks/useFamilyDashboardMetrics';
import FocusCoinWalletBadge from '../../rewards/FocusCoinWalletBadge';
import { REWARD_SHOP_ITEMS } from '../../../data/rewardShopItems';
import { getBadgeArtworkPath, getRewardItemArtworkPath } from '../../../lib/rewardArtwork';
import { getPlayerInventory, type PlayerInventorySnapshot } from '../../../lib/getPlayerInventory';
import { resolveTrackingProgramCode } from '../../../lib/activeProgramContext';
import { MODULE_COMPLETE_EVENT } from '../../../lib/activeChildContext';
import { PortalPageIntro } from '../../portal-design-system';
import '../inventory-panel.css';

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
          <article key={badge} className="inventoryCard">
            <img src={getBadgeArtworkPath(badge)} alt="" className="inventoryCardArt" />
            <p className="inventoryCardLabel">{badge}</p>
          </article>
        )}
      />

      <InventorySection
        title="Owned Items"
        emptyLabel="Mission rewards will show up here."
        items={inventory.items}
        renderItem={(item) => (
          <article key={item} className="inventoryCard">
            <img src={getRewardItemArtworkPath(item)} alt="" className="inventoryCardArt" />
            <p className="inventoryCardLabel">{item}</p>
          </article>
        )}
      />

      <InventorySection
        title="Owned Stickers"
        emptyLabel="Sticker packs unlock from weekly adventures."
        items={inventory.stickers}
        renderItem={(item) => (
          <article key={item} className="inventoryCard inventoryCard--sticker">
            <img src={getRewardItemArtworkPath(item)} alt="" className="inventoryCardArt" />
            <p className="inventoryCardLabel">{item}</p>
          </article>
        )}
      />

      <InventorySection
        title="Owned Decorations"
        emptyLabel="Save up Focus Coins to unlock decorations in the shop."
        items={inventory.decorations}
        renderItem={(item) => (
          <article key={item} className="inventoryCard inventoryCard--decoration">
            <img src={getRewardItemArtworkPath(item)} alt="" className="inventoryCardArt" />
            <p className="inventoryCardLabel">{item}</p>
          </article>
        )}
      />

      <section className="inventoryShop">
        <h3 className="inventorySectionTitle">Reward Shop</h3>
        <p className="inventoryShopNote">Preview only — purchasing coming soon.</p>
        <div className="inventoryCardGrid inventoryCardGrid--shop">
          {REWARD_SHOP_ITEMS.map((item) => (
            <article key={item.id} className="inventoryShopCard">
              <img src={item.image} alt="" className="inventoryCardArt" />
              <p className="inventoryCardLabel">{item.name}</p>
              <p className="inventoryShopCost">{item.cost} Focus Coins</p>
              <p className="inventoryShopDesc">{item.description}</p>
              <button type="button" className="inventoryShopBtn" disabled>
                Coming Soon
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
