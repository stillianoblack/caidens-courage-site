import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import WeeklyReviewSheet from './WeeklyReviewSheet';
import type { Week1ExtrasPaths } from '../../components/courage-in-the-dark/Week1ExtrasCards';
import { B4_AVATAR_SRC } from '../../data/b4/avatar';
import type { CourageInTheDarkMission } from '../../data/courageInTheDarkMap';
import { useCourageInTheDarkProgress } from '../../hooks/useCourageInTheDarkProgress';
import { useMobileViewport } from '../../hooks/useMobileViewport';
import { resolveCourageWeekId } from '../../lib/courageInTheDarkProgress';
import type { WeeklyQuestRewardConfig } from '../../lib/adventureWeekAssets';
import { buildWeekReviewViewModel, type WeekReviewViewModel } from '../../lib/weekReviewPanelData';
import type { AdventureModuleRecord } from '../../types/adventureModule';
import type { AdventureTrailWeekView } from '../../types/adventureTrail';
import type { CourageInTheDarkProgressSnapshot } from '../../types/courageMissionProgress';
import './week-review-panel.css';

export type WeekReviewPanelProps = {
  open: boolean;
  onClose: () => void;
  weekNumber: number;
  participantId: string | null;
  childDisplayName: string;
  trailWeek: AdventureTrailWeekView | null;
  cmsModule: AdventureModuleRecord | null;
  mapMissions: CourageInTheDarkMission[];
  completedMissionIds: readonly string[];
  pathname: string;
  weekExtrasPaths: Week1ExtrasPaths;
  weeklyQuestReward: WeeklyQuestRewardConfig | null;
  inventoryHref: string;
  cachedProgress?: CourageInTheDarkProgressSnapshot | null;
  weeklyRewardClaimed?: boolean;
};

type WeekReviewPanelBodyProps = WeekReviewPanelProps & {
  progress: CourageInTheDarkProgressSnapshot;
  loading: boolean;
  isMobile: boolean;
};

type WeekReviewAccordionProps = {
  id: string;
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

function WeekReviewAccordion({ id, title, defaultOpen = false, children }: WeekReviewAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = `${id}-panel`;

  return (
    <div className={`weekReviewAccordion${open ? ' weekReviewAccordion--open' : ''}`}>
      <button
        type="button"
        id={id}
        className="weekReviewAccordionToggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="weekReviewAccordionTitle">{title}</span>
        <span className="weekReviewAccordionChevron" aria-hidden="true" />
      </button>
      {open ? (
        <div id={panelId} className="weekReviewAccordionBody" role="region" aria-labelledby={id}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

function WeekReviewHeader({ viewModel }: { viewModel: WeekReviewViewModel }) {
  return (
    <header className="weekReviewHero">
      <div className="weekReviewHeroCover" aria-hidden="true">
        {viewModel.hasCoverImage ? (
          <img
            className="weekReviewHeroCoverImage"
            src={viewModel.coverImageSrc}
            alt=""
            decoding="async"
          />
        ) : null}
        <div className="weekReviewHeroOverlay" />
      </div>

      <div className="weekReviewHeroContent">
        <div className="weekReviewHeroTop">
          <div className="weekReviewHeroMain">
            {viewModel.thumbnailUrl ? (
              <img
                className="weekReviewHeroThumb"
                src={viewModel.thumbnailUrl}
                alt=""
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="weekReviewHeroThumb weekReviewHeroThumbFallback" aria-hidden="true">
                W{viewModel.weekNumber}
              </div>
            )}
            <div className="weekReviewHeroCopy">
              <p className="weekReviewEyebrow">Week {viewModel.weekNumber}</p>
              <h2 id="week-review-title" className="weekReviewTitle">
                {viewModel.title}
              </h2>
              {viewModel.selFocusLine ? <p className="weekReviewSel">{viewModel.selFocusLine}</p> : null}
            </div>
          </div>

          <div className="weekReviewHeroActions">
            <div className="weekReviewB4Guide" aria-hidden="true">
              <img
                className="weekReviewB4GuideImage"
                src={B4_AVATAR_SRC}
                alt=""
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>

        {viewModel.description ? (
          <p className="weekReviewDescription">{viewModel.description}</p>
        ) : null}

        <div className="weekReviewBadges">
          <span className="weekReviewBadge">{viewModel.childName}</span>
          <span className="weekReviewBadge weekReviewBadge--complete">Complete</span>
        </div>
      </div>
    </header>
  );
}

function WeekReviewSummarySections({ viewModel }: { viewModel: WeekReviewViewModel }) {
  return (
    <>
      <section className="weekReviewSection" aria-labelledby="week-review-progress">
        <h3 id="week-review-progress" className="weekReviewSectionTitle">
          Week progress
        </h3>
        <div className="weekReviewProgressBar" aria-hidden="true">
          <div className="weekReviewProgressFill" style={{ width: `${viewModel.progressPct}%` }} />
        </div>
        <div className="weekReviewProgressMeta">
          <span>
            {viewModel.completedCount} of {viewModel.totalMissions} missions
          </span>
          <span>{viewModel.progressPct}%</span>
        </div>
      </section>

      <section className="weekReviewSection" aria-labelledby="week-review-stats">
        <h3 id="week-review-stats" className="weekReviewSectionTitle">
          This week
        </h3>
        <div className="weekReviewStatGrid">
          <div className="weekReviewStat">
            <span className="weekReviewStatValue">{viewModel.coinsEarned}</span>
            <span className="weekReviewStatLabel">Coins</span>
          </div>
          <div className="weekReviewStat">
            <span className="weekReviewStatValue">{viewModel.badges.length}</span>
            <span className="weekReviewStatLabel">Badges</span>
          </div>
          <div className="weekReviewStat">
            <span className="weekReviewStatValue">{viewModel.completedCount}</span>
            <span className="weekReviewStatLabel">Missions</span>
          </div>
        </div>
      </section>

      {viewModel.b4Insights.length > 0 ? (
        <section className="weekReviewSection" aria-labelledby="week-review-b4">
          <h3 id="week-review-b4" className="weekReviewSectionTitle">
            What B-4 noticed
          </h3>
          <ul className="weekReviewInsights">
            {viewModel.b4Insights.map((insight) => (
              <li key={insight} className="weekReviewInsight">
                {insight}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}

function WeekReviewMissionsSection({
  completedMissions,
}: {
  completedMissions: WeekReviewViewModel['missions'];
}) {
  const done = completedMissions.filter((mission) => mission.complete);

  return (
    <section className="weekReviewSection" aria-labelledby="week-review-missions">
      <h3 id="week-review-missions" className="weekReviewSectionTitle">
        Completed missions
      </h3>
      {done.length === 0 ? (
        <p className="weekReviewEmpty">No completed missions for this week yet.</p>
      ) : (
        <ul className="weekReviewMissionList">
          {done.map((mission) => (
            <li key={mission.id} className="weekReviewMissionItem weekReviewMissionItem--complete">
              <span>
                {mission.title}
                <span className="weekReviewMissionCharacter"> · {mission.characterName}</span>
              </span>
              <span className="weekReviewMissionStatus">Done</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function WeekReviewRewardsSection({ viewModel }: { viewModel: WeekReviewViewModel }) {
  return (
    <>
      <section className="weekReviewSection" aria-labelledby="week-review-rewards">
        <h3 id="week-review-rewards" className="weekReviewSectionTitle">
          Week rewards
        </h3>
        {viewModel.weeklyReward ? (
          <div className="weekReviewRewardCard">
            {viewModel.weeklyReward.imageUrl ? (
              <img
                className="weekReviewRewardIcon"
                src={viewModel.weeklyReward.imageUrl}
                alt=""
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="weekReviewRewardIconFallback" aria-hidden="true">
                🏅
              </div>
            )}
            <div className="weekReviewRewardCopy">
              <strong>{viewModel.weeklyReward.name}</strong>
              {viewModel.weeklyReward.coins > 0 ? (
                <span>{viewModel.weeklyReward.coins} bonus coins</span>
              ) : null}
              {viewModel.weeklyReward.storedInInventory ? (
                <span>Stored in Inventory</span>
              ) : null}
            </div>
          </div>
        ) : (
          <p className="weekReviewEmpty">Weekly reward coming soon.</p>
        )}
      </section>

      {viewModel.badges.length > 0 ? (
        <section className="weekReviewSection" aria-labelledby="week-review-badges">
          <h3 id="week-review-badges" className="weekReviewSectionTitle">
            Badges earned
          </h3>
          <ul className="weekReviewBadgeList">
            {viewModel.badges.map((badge) => (
              <li key={badge} className="weekReviewBadgeItem">
                {badge}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}

function WeekReviewDownloadsSection({ viewModel }: { viewModel: WeekReviewViewModel }) {
  return (
    <section className="weekReviewSection" aria-labelledby="week-review-activities">
      <h3 id="week-review-activities" className="weekReviewSectionTitle">
        Activities & downloads
      </h3>
      {viewModel.activities.length === 0 ? (
        <p className="weekReviewEmpty">Activities coming soon for this week.</p>
      ) : (
        <ul className="weekReviewActivityList">
          {viewModel.activities.map((activity) => (
            <li key={activity.id} className="weekReviewActivityItem">
              <span>{activity.title}</span>
              {activity.href ? (
                <a
                  className="weekReviewActivityLink"
                  href={activity.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download
                </a>
              ) : (
                <span className="weekReviewEmpty">Soon</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function WeekReviewNextStepSection({ viewModel }: { viewModel: WeekReviewViewModel }) {
  return (
    <section className="weekReviewSection weekReviewSection--nextStep" aria-labelledby="week-review-next">
      <h3 id="week-review-next" className="weekReviewSectionTitle">
        Next step
      </h3>
      <p className="weekReviewNextCopy">
        You finished Week {viewModel.weekNumber}. Jump back into Weekly Adventures to keep your journey
        going, or grab your certificate and activity downloads below.
      </p>
      <ul className="weekReviewNextList">
        <li>Continue to your next weekly adventure</li>
        {viewModel.certificateHref ? <li>View or save your certificate</li> : null}
        {viewModel.activityKitHref ? <li>Download the activity kit for offline fun</li> : null}
      </ul>
    </section>
  );
}

function WeekReviewFooter({
  viewModel,
  onClose,
  isMobile,
}: {
  viewModel: WeekReviewViewModel;
  onClose: () => void;
  isMobile: boolean;
}) {
  return (
    <footer
      className={`weekReviewFooter${isMobile ? ' ds-sheetFooter weekReviewFooter--mobileSticky' : ''}`}
    >
      <Link className="weekReviewBtn weekReviewBtn--primary" to={viewModel.continueHref} onClick={onClose}>
        Continue Weekly Adventures
      </Link>
      {viewModel.certificateHref ? (
        <a
          className="weekReviewBtn weekReviewBtn--secondary"
          href={viewModel.certificateHref}
          target="_blank"
          rel="noopener noreferrer"
        >
          View Certificate
        </a>
      ) : null}
      {viewModel.activityKitHref ? (
        <a
          className={`weekReviewBtn ${isMobile ? 'weekReviewBtn--tertiary' : 'weekReviewBtn--secondary'}`}
          href={viewModel.activityKitHref}
          target="_blank"
          rel="noopener noreferrer"
        >
          Download Activity Kit
        </a>
      ) : null}
    </footer>
  );
}

function WeekReviewDesktopContent({
  viewModel,
  loading,
}: {
  viewModel: WeekReviewViewModel;
  loading: boolean;
}) {
  if (loading) {
    return (
      <p className="weekReviewLoading" role="status">
        Loading week progress…
      </p>
    );
  }

  return (
    <div className="weekReviewBody">
      <WeekReviewSummarySections viewModel={viewModel} />
      <WeekReviewMissionsSection completedMissions={viewModel.missions} />
      <WeekReviewRewardsSection viewModel={viewModel} />
      <WeekReviewDownloadsSection viewModel={viewModel} />
    </div>
  );
}

function WeekReviewMobileContent({
  viewModel,
  loading,
}: {
  viewModel: WeekReviewViewModel;
  loading: boolean;
}) {
  if (loading) {
    return (
      <p className="weekReviewLoading" role="status">
        Loading week progress…
      </p>
    );
  }

  return (
    <div className="weekReviewBody weekReviewBody--mobile">
      <WeekReviewAccordion id="week-review-acc-summary" title="Week Summary" defaultOpen>
        <WeekReviewSummarySections viewModel={viewModel} />
      </WeekReviewAccordion>

      <WeekReviewAccordion id="week-review-acc-missions" title="Completed Missions">
        <WeekReviewMissionsSection completedMissions={viewModel.missions} />
      </WeekReviewAccordion>

      <WeekReviewAccordion id="week-review-acc-rewards" title="Rewards Earned">
        <WeekReviewRewardsSection viewModel={viewModel} />
      </WeekReviewAccordion>

      <WeekReviewAccordion id="week-review-acc-downloads" title="Downloads">
        <WeekReviewDownloadsSection viewModel={viewModel} />
      </WeekReviewAccordion>

      <WeekReviewAccordion id="week-review-acc-next" title="Next Step">
        <WeekReviewNextStepSection viewModel={viewModel} />
      </WeekReviewAccordion>
    </div>
  );
}

function WeekReviewPanelBody({
  onClose,
  progress,
  loading,
  isMobile,
  ...props
}: WeekReviewPanelBodyProps) {
  const viewModel = useMemo(
    () =>
      buildWeekReviewViewModel({
        weekNumber: props.weekNumber,
        trailWeek: props.trailWeek,
        cmsModule: props.cmsModule,
        mapMissions: props.mapMissions,
        completedMissionIds: props.completedMissionIds,
        progress,
        childDisplayName: props.childDisplayName || 'Your player',
        pathname: props.pathname,
        weekExtrasPaths: props.weekExtrasPaths,
        weeklyQuestReward: props.weeklyQuestReward,
        weeklyRewardClaimed: props.weeklyRewardClaimed,
        inventoryHref: props.inventoryHref,
      }),
    [
      progress,
      props.childDisplayName,
      props.cmsModule,
      props.completedMissionIds,
      props.inventoryHref,
      props.mapMissions,
      props.pathname,
      props.trailWeek,
      props.weekExtrasPaths,
      props.weekNumber,
      props.weeklyQuestReward,
      props.weeklyRewardClaimed,
    ],
  );

  if (isMobile) {
    return (
      <div className="weekReviewPanelInner weekReviewPanelInner--mobile">
        <div className="ds-sheetBody">
          <WeekReviewHeader viewModel={viewModel} />
          <WeekReviewMobileContent viewModel={viewModel} loading={loading} />
          <WeekReviewFooter viewModel={viewModel} onClose={onClose} isMobile />
        </div>
      </div>
    );
  }

  return (
    <div className="weekReviewPanelInner">
      <WeekReviewHeader viewModel={viewModel} />

      <div className="weekReviewContentPanel">
        <div className="weekReviewPanelScroll">
          <WeekReviewDesktopContent viewModel={viewModel} loading={loading} />
        </div>
      </div>

      <WeekReviewFooter viewModel={viewModel} onClose={onClose} isMobile={false} />
    </div>
  );
}

function WeekReviewPanelWithFetch(props: WeekReviewPanelProps & { isMobile: boolean }) {
  const weekId = resolveCourageWeekId(props.weekNumber);
  const { progress, loading } = useCourageInTheDarkProgress(
    weekId,
    props.participantId,
    props.mapMissions.length,
  );

  return <WeekReviewPanelBody {...props} progress={progress} loading={loading} />;
}

function WeekReviewPanelShell(props: WeekReviewPanelProps & { isMobile: boolean }) {
  if (props.cachedProgress) {
    return (
      <WeekReviewPanelBody {...props} progress={props.cachedProgress} loading={false} />
    );
  }
  return <WeekReviewPanelWithFetch {...props} />;
}

export default function WeekReviewPanel(props: WeekReviewPanelProps) {
  const { open, onClose } = props;
  const isMobile = useMobileViewport();

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  const content = <WeekReviewPanelShell {...props} isMobile={isMobile} />;

  return (
    <WeeklyReviewSheet
      open={open}
      onClose={onClose}
      titleId="week-review-title"
      closeLabel="Close week review"
    >
      {content}
    </WeeklyReviewSheet>
  );
}
