import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ActiveChildSelector from '../ActiveChildSelector';
import InventoryBadgeDetailSheet, {
  type InventoryBadgeDetail,
} from '../InventoryBadgeDetailSheet';
import InventoryEarnedRewardsCallout from '../InventoryEarnedRewardsCallout';
import InventoryHelpCard from '../InventoryHelpCard';
import InventoryShopUnlockSheet from '../InventoryShopUnlockSheet';
import { useActiveChild } from '../../../hooks/useActiveChild';
import { useFamilyDashboardMetrics } from '../../../hooks/useFamilyDashboardMetrics';
import { useFocusCoinWallet } from '../../../hooks/useFocusCoinWallet';
import FocusCoinWalletBadge from '../../rewards/FocusCoinWalletBadge';
import { type RewardShopCategory, type RewardShopItem } from '../../../data/rewardShopItems';
import {
  loadChildBadgeEarnedState,
  resolveActiveWeekNumbersFromModules,
  resolveLockedBadgeGuidance,
  type ChildBadgeEarnedInput,
} from '../../../lib/childInventoryEarnedState';
import { getPlayerInventory, type PlayerInventorySnapshot } from '../../../lib/getPlayerInventory';
import {
  hasInventoryEarnedContent,
  INVENTORY_CHARACTER_DISCOVERIES_EMPTY_MESSAGE,
  resolveWeek1AdventureHref,
  resolveWeek1BadgePreviewDisplay,
} from '../../../lib/inventoryEmptyState';
import { resolveShopItemState } from '../../../lib/playerInventoryModel';
import { resolveShopItemImage } from '../../../lib/inventoryRewardImage';
import { GENERIC_BADGE_PLACEHOLDER_SRC } from '../../../lib/weeklyRewardDisplay';
import { useFamilyAdventureModules } from '../../../hooks/useAdventureModules';
import { useInventoryHelpPlacement } from '../../../hooks/useInventoryHelpPlacement';
import { resolveTrackingProgramCode } from '../../../lib/activeProgramContext';
import { MODULE_COMPLETE_EVENT } from '../../../lib/activeChildContext';
import { clearInventoryNewRewards } from '../../../lib/inventoryNotificationService';
import { familyPortalPath } from '../../../lib/familyPortalPaths';
import { getPortalRoute, resolvePortalKidsBasePath } from '../../../lib/portalGamePaths';
import { resolveFamilyBasePath } from '../../../lib/familyPortalNav';
import { WEEKLY_SOURCE_VALUE, WEEKLY_WEEK_PARAM } from '../../../lib/weeklyAdventureRouteContext';
import { PortalPageIntro } from '../../portal-design-system';
import AchievementBadgeCard from '../../../design-system/kids-adventure/AchievementBadgeCard';
import CharacterDiscoveryCard from '../../../design-system/kids-adventure/CharacterDiscoveryCard';
import MonthChallengeProgressCard from '../../../design-system/kids-adventure/MonthChallengeProgressCard';
import InventoryItemCard, {
  type InventoryShopState,
} from '../../../design-system/kids-adventure/InventoryItemCard';
import '../../../design-system/kids-adventure/character-discovery.css';
import '../inventory-panel.css';

const SHOP_CATEGORY_LABELS: Record<RewardShopCategory, string> = {
  decoration: 'Decoration',
  pack: 'Pack',
  skin: 'Skin',
  sticker: 'Sticker',
  frame: 'Frame',
  trail: 'Trail',
  background: 'Background',
};

const EMPTY_EARNED: ChildBadgeEarnedInput = {
  ownsCheckIn: false,
  baselineComplete: false,
  earnedWeeklyWeeks: new Set(),
  completedMissionIds: [],
};

const EMPTY_INVENTORY: PlayerInventorySnapshot = {
  badges: [],
  items: [],
  stickers: [],
  decorations: [],
  earnedRewards: [],
  purchasedShopItemIds: new Set(),
  rewardSnapshot: null,
};

function InventorySection({
  title,
  infoControl,
  children,
}: {
  title: string;
  infoControl?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="inventorySection">
      <div className="inventorySectionHeader">
        <h3 className="inventorySectionTitle">{title}</h3>
        {infoControl}
      </div>
      {children}
    </section>
  );
}

function InventoryInfoButton({
  label,
  expanded,
  onClick,
  className,
}: {
  label: string;
  expanded: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={['inventoryInfoButton', className].filter(Boolean).join(' ')}
      aria-label={label}
      aria-expanded={expanded}
      onClick={onClick}
    >
      <span className="inventoryInfoButtonIcon" aria-hidden="true">
        i
      </span>
    </button>
  );
}

function InventoryPlaceholderMessage({ children }: { children: React.ReactNode }) {
  return <p className="inventorySectionPlaceholder">{children}</p>;
}

function InventoryEmptyHero({ onStartWeek1 }: { onStartWeek1: () => void }) {
  return (
    <section className="inventoryEmptyHero" aria-labelledby="inventory-empty-hero-title">
      <div className="inventoryEmptyHeroCopy">
        <h2 id="inventory-empty-hero-title" className="inventoryEmptyHeroTitle">
          Earn your first badge
        </h2>
        <p className="inventoryEmptyHeroDesc">
          Complete Week 1: Courage in the Dark to unlock your first Focus Flame badge.
        </p>
        <button type="button" className="inventoryEmptyHeroCta" onClick={onStartWeek1}>
          Start Week 1
        </button>
      </div>
    </section>
  );
}

export default function FamilyInventoryPanel() {
  const location = useLocation();
  const navigate = useNavigate();
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
  const { modules: adventureModules } = useFamilyAdventureModules();
  const helpPlacement = useInventoryHelpPlacement();
  const showHelpSheet = helpPlacement === 'sheet';
  const activeWeekNumbers = useMemo(
    () => resolveActiveWeekNumbersFromModules(adventureModules),
    [adventureModules],
  );
  const progressPaths = useMemo(() => {
    const basePath = resolveFamilyBasePath(location.pathname);
    const kidsBase = resolvePortalKidsBasePath(location.pathname);
    return {
      kidsBasePath: kidsBase,
      downloadsPath: `${basePath}/downloads`,
      certificatesPath: familyPortalPath('certificates', location.pathname),
    };
  }, [location.pathname]);
  const progressOptions = useMemo(
    () => ({
      cmsModules: adventureModules,
      paths: progressPaths,
    }),
    [adventureModules, progressPaths],
  );
  const [inventory, setInventory] = useState<PlayerInventorySnapshot>(EMPTY_INVENTORY);
  const [earned, setEarned] = useState<ChildBadgeEarnedInput>(EMPTY_EARNED);
  const [loading, setLoading] = useState(true);
  const [badgeDetail, setBadgeDetail] = useState<InventoryBadgeDetail | null>(null);
  const [helpSheetOpen, setHelpSheetOpen] = useState(false);
  const [shopUnlockTarget, setShopUnlockTarget] = useState<{
    item: RewardShopItem;
    shopState: InventoryShopState;
  } | null>(null);

  const rewardSnapshot = inventory.rewardSnapshot;

  const refreshInventory = useCallback(async () => {
    const participantId = activeChild?.participantId?.trim();
    if (!participantId) {
      setInventory(EMPTY_INVENTORY);
      setEarned(EMPTY_EARNED);
      setLoading(false);
      return;
    }

    setLoading(true);
    const [snapshot, earnedState] = await Promise.all([
      getPlayerInventory(participantId, adventureModules, progressPaths),
      loadChildBadgeEarnedState(participantId, activeWeekNumbers, progressOptions),
    ]);
    setInventory(snapshot);
    setEarned(earnedState);
    setLoading(false);
  }, [activeChild?.participantId, activeWeekNumbers, adventureModules, progressOptions, progressPaths]);

  useEffect(() => {
    const participantId = activeChild?.participantId?.trim();
    if (participantId) {
      clearInventoryNewRewards(participantId);
    }
    void refreshInventory();
    const handleRefresh = () => {
      void refreshInventory();
    };
    window.addEventListener(MODULE_COMPLETE_EVENT, handleRefresh);
    window.addEventListener('cc-reward-claimed', handleRefresh);
    return () => {
      window.removeEventListener(MODULE_COMPLETE_EVENT, handleRefresh);
      window.removeEventListener('cc-reward-claimed', handleRefresh);
    };
  }, [activeChild?.participantId, refreshInventory]);

  useEffect(() => {
    if (!showHelpSheet) {
      setHelpSheetOpen(false);
    }
  }, [showHelpSheet]);

  const badgeCatalog = useMemo(
    () => rewardSnapshot?.badgeCatalog ?? [],
    [rewardSnapshot],
  );
  const monthlyChallenge = rewardSnapshot?.monthlyChallenge;
  const discoveryCatalog = rewardSnapshot?.discoveryCatalog ?? [];
  const shopItems = rewardSnapshot?.shopItems ?? [];

  const earnedBadgeCount = useMemo(
    () => badgeCatalog.filter((entry) => entry.owned).length,
    [badgeCatalog],
  );

  const earnedDiscoveryCount = rewardSnapshot?.earnedDiscoveries.length ?? 0;

  const displayableEarnedRewards = useMemo(
    () => inventory.earnedRewards.filter((reward) => Boolean(reward.imageSrc?.trim())),
    [inventory.earnedRewards],
  );

  const hasEarnedContent = useMemo(
    () => hasInventoryEarnedContent(inventory, earnedBadgeCount),
    [earnedBadgeCount, inventory],
  );

  const badgeRows = useMemo(() => {
    if (badgeCatalog.length > 0) return badgeCatalog;
    const preview = resolveWeek1BadgePreviewDisplay();
    return [
      {
        key: 'week-1-preview',
        kind: 'weekly' as const,
        weekNumber: 1,
        display: preview,
        owned: false,
        locked: true,
        unlockRequirement: '',
      },
    ];
  }, [badgeCatalog]);

  const startWeek1 = useCallback(() => {
    navigate(resolveWeek1AdventureHref(location.pathname));
  }, [location.pathname, navigate]);

  const handleLockedBadgeClick = useCallback(
    (entry: (typeof badgeRows)[number]) => {
      if (entry.kind === 'monthly') {
        if (showHelpSheet) {
          setHelpSheetOpen(true);
        }
        return;
      }

      const guidance = resolveLockedBadgeGuidance(entry, earned, progressOptions);
      if (!guidance) return;

      if (guidance.action === 'navigate_baseline') {
        navigate(getPortalRoute('baseline-check', location.pathname));
        return;
      }

      if (guidance.action === 'navigate_week' && guidance.weekNumber) {
        const params = new URLSearchParams({
          [WEEKLY_WEEK_PARAM]: String(guidance.weekNumber),
          source: WEEKLY_SOURCE_VALUE,
        });
        navigate(`${familyPortalPath('continue-learning', location.pathname)}?${params.toString()}`);
      }
    },
    [earned, location.pathname, navigate, progressOptions, showHelpSheet],
  );

  const handleEarnedBadgeClick = useCallback((entry: (typeof badgeRows)[number]) => {
    setBadgeDetail({
      title: entry.display.name,
      subtitle: entry.display.weekLabel ?? (entry.kind === 'monthly' ? 'Month 1' : 'Badge'),
      imageSrc: entry.display.imageUrl,
    });
  }, []);

  const handleShopUnlockClick = useCallback(
    (item: RewardShopItem, shopState: InventoryShopState) => {
      if (shopState === 'owned' || shopState === 'locked') return;
      setShopUnlockTarget({ item, shopState });
    },
    [],
  );

  const handleStartMission = useCallback(() => {
    setShopUnlockTarget(null);
    navigate(familyPortalPath('continue-learning', location.pathname));
  }, [location.pathname, navigate]);

  return (
    <div className="inventoryPanel">
      <div className="inventoryPanelHeader">
        <div className="inventoryPanelHeaderCopy">
          <PortalPageIntro>
            Collect badges, discoveries, and rewards as you explore Courage in the Dark.
          </PortalPageIntro>
        </div>
        <div className="inventoryPanelHeaderActions">
          {showHelpSheet ? (
            <InventoryInfoButton
              label="How rewards work"
              expanded={helpSheetOpen}
              onClick={() => setHelpSheetOpen(true)}
              className="inventoryMobileHelpTrigger"
            />
          ) : null}
          <FocusCoinWalletBadge />
        </div>
      </div>

      <ActiveChildSelector
        children={selectableChildren}
        activeParticipantId={activeChild?.participantId}
        onSelect={selectChild}
      />

      <div className="inventoryPanelContent">
          {!loading && activeChild?.participantId && hasEarnedContent ? (
            <p className="inventoryEarnedSummary" role="status">
              {`${activeChild.displayName} has earned ${earnedBadgeCount} badge${earnedBadgeCount === 1 ? '' : 's'} and ${earnedDiscoveryCount} character discover${earnedDiscoveryCount === 1 ? 'y' : 'ies'}.`}
            </p>
          ) : null}

          {!loading && activeChild?.participantId && !hasEarnedContent ? (
            <InventoryEmptyHero onStartWeek1={startWeek1} />
          ) : null}

          {loading ? (
            <div className="inventoryCardGrid inventoryCardGrid--skeleton" aria-hidden="true">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="inventorySkeletonCard" />
              ))}
            </div>
          ) : null}

          {!loading ? (
            <>
              <InventorySection title="Badges">
                <div className="inventoryCardGrid inventoryCardGrid--badges">
                  {badgeRows.map((entry) => (
                    <AchievementBadgeCard
                      key={entry.key}
                      label={entry.display.name}
                      kind={entry.kind}
                      weekNumber={entry.weekNumber}
                      imageSrc={entry.display.imageUrl}
                      themeHint={entry.display.name}
                      earned={entry.owned}
                      locked={entry.locked}
                      category={entry.display.weekLabel ?? undefined}
                      onLockedClick={entry.locked ? () => handleLockedBadgeClick(entry) : undefined}
                      onEarnedClick={entry.owned ? () => handleEarnedBadgeClick(entry) : undefined}
                    />
                  ))}
                </div>
              </InventorySection>

              <InventorySection title="Character Discoveries">
                {discoveryCatalog.length > 0 ? (
                  <div className="inventoryCardGrid inventoryCardGrid--discoveries">
                    {discoveryCatalog.map((entry) => (
                      <CharacterDiscoveryCard key={entry.definition.id} entry={entry} />
                    ))}
                  </div>
                ) : (
                  <InventoryPlaceholderMessage>
                    {INVENTORY_CHARACTER_DISCOVERIES_EMPTY_MESSAGE}
                  </InventoryPlaceholderMessage>
                )}
              </InventorySection>

              <InventorySection title="Earned Rewards">
                {displayableEarnedRewards.length > 0 ? (
                  <div className="inventoryCardGrid inventoryCardGrid--collectibles">
                    {displayableEarnedRewards.map((reward) => (
                      <InventoryItemCard
                        key={reward.id}
                        label={reward.label}
                        imageSrc={reward.imageSrc}
                        variant={reward.category}
                        owned
                        themeHint={reward.label}
                      />
                    ))}
                  </div>
                ) : (
                  <InventoryEarnedRewardsCallout />
                )}
              </InventorySection>

              <InventorySection title="Certificates">
                {monthlyChallenge?.certificateEarned ? (
                  <div className="inventoryCertificateCard inventoryCertificateCard--earned">
                    <img
                      src={rewardSnapshot?.certificateImageUrl ?? GENERIC_BADGE_PLACEHOLDER_SRC}
                      alt=""
                      className="inventoryCertificateCardArt"
                    />
                    <p className="inventoryCertificateCardLabel">
                      {monthlyChallenge.certificateName}
                    </p>
                  </div>
                ) : monthlyChallenge ? (
                  <MonthChallengeProgressCard progress={monthlyChallenge} />
                ) : (
                  <InventoryPlaceholderMessage>
                    Complete all 4 weeks in Month 1 to earn your certificate.
                  </InventoryPlaceholderMessage>
                )}
              </InventorySection>

              <section className="inventoryShop">
                <div className="inventorySectionHeader">
                  <h3 className="inventorySectionTitle">Reward Shop</h3>
                </div>
                <p className="inventoryShopNote">Unlock cosmetic extras with Focus Coins you earn on adventures.</p>
                <div className="inventoryCardGrid inventoryCardGrid--shop">
                  {shopItems.map((item) => {
                    const shopState = resolveShopItemState(
                      item,
                      totalCoins,
                      inventory.purchasedShopItemIds,
                    );
                    return (
                      <InventoryItemCard
                        key={item.id}
                        label={item.name}
                        imageSrc={resolveShopItemImage(item.id, item.image)}
                        variant="shop"
                        cost={item.cost}
                        description={item.description.split('.')[0]}
                        themeHint={item.name}
                        category={SHOP_CATEGORY_LABELS[item.category]}
                        shopState={shopState}
                        owned={shopState === 'owned'}
                        rarity={item.cost >= 150 ? 'Epic' : item.cost >= 100 ? 'Rare' : 'Common'}
                        onShopCtaClick={() => handleShopUnlockClick(item, shopState)}
                      />
                    );
                  })}
                </div>
              </section>
            </>
          ) : null}
      </div>

      {showHelpSheet && helpSheetOpen ? (
        <div className="inventoryHelpSheet" role="presentation">
          <button
            type="button"
            className="inventoryHelpSheetBackdrop"
            aria-label="Close help"
            onClick={() => setHelpSheetOpen(false)}
          />
          <div className="inventoryHelpSheetPanel" role="dialog" aria-modal="true">
            <button
              type="button"
              className="inventoryHelpSheetClose"
              onClick={() => setHelpSheetOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
            <InventoryHelpCard variant="sheet" showRarityGuide />
          </div>
        </div>
      ) : null}

      <InventoryShopUnlockSheet
        item={shopUnlockTarget?.item ?? null}
        shopState={shopUnlockTarget?.shopState ?? null}
        onClose={() => setShopUnlockTarget(null)}
        onStartMission={handleStartMission}
        onConfirmUnlock={() => setShopUnlockTarget(null)}
        purchasesEnabled={false}
      />

      <InventoryBadgeDetailSheet badge={badgeDetail} onClose={() => setBadgeDetail(null)} />
    </div>
  );
}
