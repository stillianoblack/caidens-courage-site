import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useCourageHubAudio } from './CourageHubAudioContext';
import {
  courageInTheDarkMissions,
  type CourageInTheDarkMission,
} from '../../data/courageInTheDarkMap';

type CourageMissionListPanelProps = {
  week: number;
  completedCount: number;
  totalAdventures: number;
  selectedMissionId: string | null;
  isMissionComplete: (mission: CourageInTheDarkMission) => boolean;
  isMissionLocked: (mission: CourageInTheDarkMission) => boolean;
  getMissionUnlockReason?: (mission: CourageInTheDarkMission) => string;
  getMissionHref?: (mission: CourageInTheDarkMission) => string | null;
  onSelectMission: (mission: CourageInTheDarkMission) => void;
  onLaunchMission: (mission: CourageInTheDarkMission) => void;
  comingSoonMissionId?: string | null;
};

export default function CourageMissionListPanel({
  week,
  completedCount,
  totalAdventures,
  selectedMissionId,
  isMissionComplete,
  isMissionLocked,
  getMissionUnlockReason,
  getMissionHref,
  onSelectMission,
  onLaunchMission,
  comingSoonMissionId,
}: CourageMissionListPanelProps) {
  const { playClick } = useCourageHubAudio();

  const handleSelectMission = useCallback(
    (mission: CourageInTheDarkMission) => {
      playClick();
      onSelectMission(mission);
    },
    [onSelectMission, playClick],
  );

  const handleLaunchMission = useCallback(
    (mission: CourageInTheDarkMission) => {
      playClick();
      onLaunchMission(mission);
    },
    [onLaunchMission, playClick],
  );

  const remainingCount = totalAdventures - completedCount;
  const progressPercent =
    totalAdventures > 0 ? Math.round((completedCount / totalAdventures) * 100) : 0;

  return (
    <aside className="courageMissionListPanel" aria-label="Mission list">
      <header className="courageMissionListPanelHeader">
        <h3 className="courageMissionListPanelTitle">Choose Your Adventure</h3>
        <p className="courageMissionListPanelIntro">
          Pick a mission or choose a character on the map.
        </p>
      </header>

      <section className="courageMissionListPanelProgress" aria-label={`Week ${week} progress`}>
        <div className="courageMissionListPanelProgressRow">
          <span className="courageMissionListPanelProgressLabel">Week {week} Progress</span>
          <span className="courageMissionListPanelProgressCount" role="status">
            {completedCount} / {totalAdventures} Adventures Complete
          </span>
        </div>
        <div
          className="courageMissionListPanelProgressTrack"
          role="progressbar"
          aria-valuenow={completedCount}
          aria-valuemin={0}
          aria-valuemax={totalAdventures}
          aria-label={`${completedCount} of ${totalAdventures} adventures complete`}
        >
          <span
            className="courageMissionListPanelProgressFill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="courageMissionListPanelProgressMeta">
          <span>{completedCount} completed</span>
          <span>{remainingCount} remaining</span>
        </p>
      </section>

      <ul className="courageMissionListRows">
        {courageInTheDarkMissions.map((mission, index) => {
          const complete = isMissionComplete(mission);
          const locked = isMissionLocked(mission);
          const selected = selectedMissionId === mission.id;
          const comingSoon = comingSoonMissionId === mission.id;
          const unlockReason = locked ? getMissionUnlockReason?.(mission) : undefined;
          const missionHref = !locked && !comingSoon ? getMissionHref?.(mission) ?? null : null;

          return (
            <li
              key={mission.id}
              className="courageMissionListRowWrap"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <button
                type="button"
                className={[
                  'courageMissionListRow',
                  selected ? 'courageMissionListRow--selected' : '',
                  complete ? 'courageMissionListRow--complete' : '',
                  locked ? 'courageMissionListRow--locked' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                data-color={mission.color}
                onClick={() => handleSelectMission(mission)}
                aria-pressed={selected}
              >
                <span className="courageMissionListRowThumb" data-color={mission.color}>
                  <img src={mission.thumbnail} alt="" width={44} height={44} loading="lazy" />
                </span>

                <span className="courageMissionListRowCopy">
                  <span className="courageMissionListRowCharacter">{mission.characterName}</span>
                  <span className="courageMissionListRowTitle">{mission.label}</span>
                  <span className="courageMissionListRowReward">{mission.rewardText}</span>
                </span>

                <span className="courageMissionListRowStatus" aria-hidden="true">
                  {complete ? (
                    <span className="courageMissionListRowBadge">✓</span>
                  ) : locked ? (
                    <span className="courageMissionListRowLock">🔒</span>
                  ) : (
                    <span className="courageMissionListRowChevron">›</span>
                  )}
                </span>
              </button>

              {selected ? (
                <div className="courageMissionListRowActions">
                  {locked && unlockReason ? (
                    <p className="courageMissionListRowLockedNote" role="status">
                      {unlockReason}
                    </p>
                  ) : null}
                  {comingSoon ? (
                    <p className="courageMissionListRowComingSoon" role="status">
                      Adventure coming soon.
                    </p>
                  ) : null}
                  {!locked ? (
                    missionHref ? (
                      <Link
                        to={missionHref}
                        className="courageMissionListRowStart"
                        data-color={mission.color}
                        onClick={playClick}
                      >
                        Start Adventure
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="courageMissionListRowStart"
                        data-color={mission.color}
                        onClick={() => handleLaunchMission(mission)}
                        disabled={comingSoon}
                      >
                        Start Adventure
                      </button>
                    )
                  ) : null}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
