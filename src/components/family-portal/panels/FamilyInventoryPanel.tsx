import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ActiveChildSelector from '../ActiveChildSelector';
import InventoryBadgeDetailSheet, {
  type InventoryBadgeDetail,
} from '../InventoryBadgeDetailSheet';
import InventoryEarnedRewardsCallout from '../InventoryEarnedRewardsCallout';
import InventoryHelpCard from '../InventoryHelpCard';
import InventoryShopUnlockSheet from '../InventoryShopUnlockSheet';
import { useActiveChild } from '../../../hooks/useActiveChild';
import { useActiveParticipant } from '../../../hooks/useActiveParticipant';
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
import type { InventoryBadgeCatalogEntry } from '../../../lib/cmsBadgeArtwork';
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
import '../../../design-system/kids-adventure/character-art-image.css';
import KidPlayShellLoader from '../../kid-play-shell/KidPlayShellLoader';
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

type InventorySessionSnapshot = {
  inventory: PlayerInventorySnapshot;
  earned: ChildBadgeEarnedInput;
};

const inventorySessionCache = new Map<string, InventorySessionSnapshot>();

function InventorySection({
  title,
  infoControl,
  children,
  unified = false,
}: {
  title: string;
  infoControl?: React.ReactNode;
  children: React.ReactNode;
  unified?: boolean;
}) {
  if (unified) {
    return (
      <section className="inventoryCollectionSection">
        <div className="inventoryCollectionSectionHeader">
          <h3 className="inventoryCollectionSectionTitle">{title}</h3>
          {infoControl}
        </div>
        {children}
      </section>
    );
  }

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

function InventoryLockedCertificateCard({
  certificateName,
  weeksCompleted,
  weeksTotal,
}: {
  certificateName: string;
  weeksCompleted: number;
  weeksTotal: number;
}) {
  return (
    <div className="inventoryCertificateCard inventoryCertificateCard--locked" role="status">
      <span className="inventoryCertificateCardLockIcon" aria-hidden="true">
        🔒
      </span>
      <p className="inventoryCertificateCardLabel">{certificateName}</p>
      <p className="inventoryCertificateCardHint">
        Complete all 4 Week 1–4 adventures to unlock.
      </p>
      <p className="inventoryCertificateCardProgress">
        Progress: {weeksCompleted} / {weeksTotal} complete
      </p>
    </div>
  );
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

export default function FamilyInventoryPanel({ kidPlayShell = false }: { kidPlayShell?: boolean }) {
  const location = useLocation();
  const navigate = useNavigate();
  const shellParticipant = useActiveParticipant();
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
  const resolvedParticipantId = kidPlayShell
    ? shellParticipant.participantId
    : activeChild?.participantId;
  const resolvedDisplayName = kidPlayShell
    ? shellParticipant.displayName
    : activeChild?.displayName ?? 'Your player';
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
  const initialParticipantId = resolvedParticipantId?.trim() ?? '';
  const initialCachedInventory = initialParticipantId
    ? inventorySessionCache.get(initialParticipantId)
    : undefined;
  const [inventory, setInventory] = useState<PlayerInventorySnapshot>(
    initialCachedInventory?.inventory ?? EMPTY_INVENTORY,
  );
  const [earned, setEarned] = useState<ChildBadgeEarnedInput>(
    initialCachedInventory?.earned ?? EMPTY_EARNED,
  );
  const [loading, setLoading] = useState(!initialCachedInventory);
  const refreshRequestRef = useRef(0);
  const [badgeDetail, setBadgeDetail] = useState<InventoryBadgeDetail | null>(null);
  const [helpSheetOpen, setHelpSheetOpen] = useState(false);
  const [shopUnlockTarget, setShopUnlockTarget] = useState<{
    item: RewardShopItem;
    shopState: InventoryShopState;
  } | null>(null);

  const rewardSnapshot = inventory.rewardSnapshot;

  const refreshInventory = useCallback(async () => {
    const participantId = resolvedParticipantId?.trim();
    const requestId = ++refreshRequestRef.current;
    if (!participantId) {
      setInventory(EMPTY_INVENTORY);
      setEarned(EMPTY_EARNED);
      setLoading(false);
      return;
    }

    const cached = inventorySessionCache.get(participantId);
    if (cached) {
      setInventory(cached.inventory);
      setEarned(cached.earned);
    }
    setLoading(!cached);
    const [snapshot, earnedState] = await Promise.all([
      getPlayerInventory(participantId, adventureModules, progressPaths),
      loadChildBadgeEarnedState(participantId, activeWeekNumbers, progressOptions),
    ]);
    if (requestId !== refreshRequestRef.current) return;
    inventorySessionCache.set(participantId, {
      inventory: snapshot,
      earned: earnedState,
    });
    setInventory(snapshot);
    setEarned(earnedState);
    setLoading(false);
    clearInventoryNewRewards(participantId);
  }, [resolvedParticipantId, activeWeekNumbers, adventureModules, progressOptions, progressPaths]);

  useEffect(() => {
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
  }, [resolvedParticipantId, refreshInventory]);

  useEffect(
    () => () => {
      refreshRequestRef.current += 1;
    },
    [],
  );

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

  const badgeRows = useMemo((): InventoryBadgeCatalogEntry[] => {
    if (badgeCatalog.length > 0) return badgeCatalog;
    const preview = resolveWeek1BadgePreviewDisplay();
    return [
      {
        key: 'week-1-preview',
        kind: 'weekly' as const,
        weekNumber: 1,
        display: {
          ...preview,
          weekNumber: 1,
          rarity: 'Common' as const,
        },
        owned: false,
        locked: true,
        unlockRequirement: '',
      },
    ];
  }, [badgeCatalog]);

  const checkInBadgeRows = useMemo(
    () => badgeRows.filter((entry) => entry.kind === 'check-in'),
    [badgeRows],
  );
  const weeklyBadgeRows = useMemo(
    () => badgeRows.filter((entry) => entry.kind === 'weekly'),
    [badgeRows],
  );
  const monthlyBadgeRows = useMemo(
    () => badgeRows.filter((entry) => entry.kind === 'monthly'),
    [badgeRows],
  );

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

  const renderBadgeCard = (entry: (typeof badgeRows)[number]) => (
    <AchievementBadgeCard
      key={entry.key}
      label={entry.display.name}
      kind={entry.kind}
      weekNumber={entry.weekNumber}
      imageSrc={entry.display.imageUrl}
      themeHint={entry.display.name}
      earned={entry.owned}
      locked={entry.locked}
      pendingClaim={entry.pendingClaim}
      category={entry.display.weekLabel ?? undefined}
      onLockedClick={entry.locked ? () => handleLockedBadgeClick(entry) : undefined}
      onEarnedClick={entry.owned ? () => handleEarnedBadgeClick(entry) : undefined}
    />
  );

  const startWeek1 = useCallback(() => {
    navigate(resolveWeek1AdventureHref(location.pathname));
  }, [location.pathname, navigate]);

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
    <div
      className={['inventoryPanel', kidPlayShell ? 'inventoryPanel--kidShell' : '']
        .filter(Boolean)
        .join(' ')}
    >
      <div className="inventoryPanelHeader">
        <div className="inventoryPanelHeaderCopy">
          {kidPlayShell ? (
            <header>
              <h1 className="kidPlayShellPageTitle">Collections</h1>
            </header>
          ) : (
            <PortalPageIntro>
              Collect badges, discoveries, and rewards as you explore Courage in the Dark.
            </PortalPageIntro>
          )}
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

      {!kidPlayShell ? (
        <ActiveChildSelector
          children={selectableChildren}
          activeParticipantId={activeChild?.participantId}
          onSelect={selectChild}
        />
      ) : null}

      <div className="inventoryPanelContent">
          {!loading && resolvedParticipantId && !hasEarnedContent ? (
            <InventoryEmptyHero onStartWeek1={startWeek1} />
          ) : null}

          {loading ? (
            kidPlayShell ? (
              <KidPlayShellLoader fullScreen={false} />
            ) : (
              <div className="inventoryCardGrid inventoryCardGrid--skeleton" aria-hidden="true">
                {Array.from({ length: 4 }, (_, index) => (
                  <div key={index} className="inventorySkeletonCard" />
                ))}
              </div>
            )
          ) : null}

          {!loading ? (
            <article className={kidPlayShell ? 'inventoryCollectionPanel' : undefined}>
              {kidPlayShell ? (
                <header className="inventoryCollectionPanelHead">
                  <h2 className="inventoryCollectionPanelTitle">Your Focus Flame Collection</h2>
                  {resolvedParticipantId && hasEarnedContent ? (
                    <p className="inventoryCollectionPanelSummary" role="status">
                      {`${resolvedDisplayName} has earned ${earnedBadgeCount} badge${earnedBadgeCount === 1 ? '' : 's'} and ${earnedDiscoveryCount} character discover${earnedDiscoveryCount === 1 ? 'y' : 'ies'}.`}
                    </p>
                  ) : (
                    <p className="inventoryCollectionPanelSummary">
                      Badges, discoveries, and rewards from every adventure live here.
                    </p>
                  )}
                </header>
              ) : resolvedParticipantId && hasEarnedContent ? (
                <p className="inventoryEarnedSummary" role="status">
                  {`${resolvedDisplayName} has earned ${earnedBadgeCount} badge${earnedBadgeCount === 1 ? '' : 's'} and ${earnedDiscoveryCount} character discover${earnedDiscoveryCount === 1 ? 'y' : 'ies'}.`}
                </p>
              ) : null}

              <div className={kidPlayShell ? 'inventoryCollectionPanelBody' : undefined}>
              {kidPlayShell ? (
                checkInBadgeRows.length > 0 || weeklyBadgeRows.length > 0 ? (
                  <InventorySection title="Weekly Adventure Badges" unified>
                    <div className="inventoryCardGrid inventoryCardGrid--badges">
                      {[...checkInBadgeRows, ...weeklyBadgeRows].map(renderBadgeCard)}
                    </div>
                  </InventorySection>
                ) : null
              ) : (
                <>
                  {checkInBadgeRows.length > 0 ? (
                    <InventorySection title="B-4 Check-In">
                      <div className="inventoryCardGrid inventoryCardGrid--badges">
                        {checkInBadgeRows.map(renderBadgeCard)}
                      </div>
                    </InventorySection>
                  ) : null}
                  {weeklyBadgeRows.length > 0 ? (
                    <InventorySection title="Weekly Adventure Badges">
                      <div className="inventoryCardGrid inventoryCardGrid--badges">
                        {weeklyBadgeRows.map(renderBadgeCard)}
                      </div>
                    </InventorySection>
                  ) : null}
                </>
              )}

              {kidPlayShell ? (
                monthlyBadgeRows.length > 0 || monthlyChallenge ? (
                  <InventorySection title="Monthly Challenge" unified>
                    {monthlyBadgeRows.length > 0 ? (
                      <div className="inventoryCardGrid inventoryCardGrid--badges">
                        {monthlyBadgeRows.map(renderBadgeCard)}
                      </div>
                    ) : null}
                    {monthlyChallenge && !monthlyChallenge.certificateEarned ? (
                      <MonthChallengeProgressCard progress={monthlyChallenge} />
                    ) : null}
                  </InventorySection>
                ) : null
              ) : monthlyBadgeRows.length > 0 ? (
                <InventorySection title="Monthly Challenge">
                  <div className="inventoryCardGrid inventoryCardGrid--badges">
                    {monthlyBadgeRows.map(renderBadgeCard)}
                  </div>
                </InventorySection>
              ) : null}

              <InventorySection title="Character Discoveries" unified={kidPlayShell}>
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

              <InventorySection title="Earned Rewards" unified={kidPlayShell}>
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

              <InventorySection title="Certificates" unified={kidPlayShell}>
                {monthlyChallenge?.certificateEarned ? (
                  <div className="inventoryCertificateCard inventoryCertificateCard--earned">
                    <img
                      src={rewardSnapshot?.certificateImageUrl ?? GENERIC_BADGE_PLACEHOLDER_SRC}
                      alt=""
                      className="inventoryCertificateCardArt"
                      onError={(event) => {
                        event.currentTarget.style.visibility = 'hidden';
                      }}
                    />
                    <p className="inventoryCertificateCardLabel">
                      {monthlyChallenge.certificateName}
                    </p>
                  </div>
                ) : monthlyChallenge ? (
                  <InventoryLockedCertificateCard
                    certificateName={monthlyChallenge.certificateName}
                    weeksCompleted={monthlyChallenge.weeksCompleted}
                    weeksTotal={monthlyChallenge.weeksTotal}
                  />
                ) : (
                  <InventoryPlaceholderMessage>
                    Complete all 4 weeks in Month 1 to earn your certificate.
                  </InventoryPlaceholderMessage>
                )}
              </InventorySection>

              {!kidPlayShell ? (
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
              ) : null}
              </div>
            </article>
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
