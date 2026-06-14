import React, { useCallback } from 'react';
import { useCourageHubAudio } from './CourageHubAudioContext';
import {
  courageInTheDarkMissions,
  type CourageInTheDarkMission,
} from '../../data/courageInTheDarkMap';
import MissionActionCard from '../../design-system/kids-adventure/MissionActionCard';
import KidsAdventureIcon from '../../design-system/kids-adventure/KidsAdventureIcon';
import { COURAGE_IN_THE_DARK_BG } from '../../data/courageInTheDarkMap';
import { resolveCharacterThemeId, themeDataAttributes } from '../../design-system/kids-adventure/characterThemes';

type CourageMissionListPanelProps = {
  week: number;
  mapMissions?: CourageInTheDarkMission[];
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
  mapMissions = courageInTheDarkMissions,
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
        {mapMissions.map((mission, index) => {
          const complete = isMissionComplete(mission);
          const locked = isMissionLocked(mission);
          const selected = selectedMissionId === mission.id;
          const comingSoon = comingSoonMissionId === mission.id;
          const unlockReason = locked ? getMissionUnlockReason?.(mission) : undefined;
          const missionHref = !locked && !comingSoon ? getMissionHref?.(mission) ?? null : null;
          const themeId = resolveCharacterThemeId(mission.id);
          const themeAttrs = themeId ? themeDataAttributes(themeId) : {};
          const startLabel = complete ? 'Replay' : 'Start';

          const rowStyle = {
            animationDelay: `${index * 50}ms`,
            '--kid-mission-bg': `url("${mission.thumbnail}")`,
            '--kid-map-bg': `url("${COURAGE_IN_THE_DARK_BG}")`,
          } as React.CSSProperties;

          return (
            <li
              key={mission.id}
              className="courageMissionListRowWrap"
              style={rowStyle}
            >
              <div
                className={[
                  'courageMissionListRow',
                  'courageMissionListRow--compact',
                  selected ? 'courageMissionListRow--selected' : '',
                  complete ? 'courageMissionListRow--complete' : '',
                  locked ? 'courageMissionListRow--locked' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                data-color={mission.color}
                {...themeAttrs}
                role="button"
                tabIndex={0}
                onClick={() => handleSelectMission(mission)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleSelectMission(mission);
                  }
                }}
                aria-pressed={selected}
              >
                <div className="courageMissionListRowInner">
                  <div className="courageMissionListRowCopy">
                    <span className="courageMissionListRowTitle">{mission.label}</span>
                    <span className="courageMissionListRowCharacter">{mission.characterName}</span>
                    <span className="courageMissionListRowReward">{mission.rewardText}</span>
                  </div>

                  <div className="courageMissionListRowMeta" aria-hidden="true">
                    {complete ? (
                      <span className="courageMissionListRowBadge">
                        <KidsAdventureIcon name="check" size={16} />
                      </span>
                    ) : locked ? (
                      <span className="courageMissionListRowLock">
                        <KidsAdventureIcon name="lock" size={16} />
                      </span>
                    ) : null}
                  </div>

                  <div className="courageMissionListRowFoot">
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
                      <span
                        className="courageMissionListRowStartWrap"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {missionHref ? (
                          <MissionActionCard
                            themeId={mission.id}
                            label={startLabel}
                            href={missionHref}
                            onClick={playClick}
                            className="courageMissionListRowStart"
                          />
                        ) : (
                          <MissionActionCard
                            themeId={mission.id}
                            label={startLabel}
                            disabled={comingSoon}
                            onClick={() => handleLaunchMission(mission)}
                            className="courageMissionListRowStart"
                          />
                        )}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
