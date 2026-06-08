import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import type { MissionBoardItem } from '../../types/missionBoard';
import { remapPortalKidsRoute } from '../../lib/portalGamePaths';
import MissionPathConnector, { MissionStackConnector, positionClass } from './MissionPathConnector';
import MissionFolderCard from './MissionFolderCard';

type MissionPathProps = {
  missions: MissionBoardItem[];
  onSelectMission?: (mission: MissionBoardItem) => void;
  className?: string;
  pathVariant?: 'miranda' | 'caiden';
};

export default function MissionPath({
  missions,
  onSelectMission,
  className = '',
  pathVariant = 'miranda',
}: MissionPathProps) {
  const location = useLocation();
  const remappedMissions = useMemo(
    () =>
      missions.map((mission) => ({
        ...mission,
        route: remapPortalKidsRoute(mission.route, location.pathname),
      })),
    [location.pathname, missions],
  );

  const sortedMobile = useMemo(
    () => [...remappedMissions].sort((a, b) => a.mobileOrder - b.mobileOrder),
    [remappedMissions],
  );

  return (
    <div className={['mission-pathWrap', `mission-pathWrap--${pathVariant}`, className]
      .filter(Boolean)
      .join(' ')}>
      <div
        className="mission-path mission-path--board"
        role="list"
        aria-label={pathVariant === 'caiden' ? 'Focus quests' : 'Investigation cases'}
      >
        <div className="mission-boardSurface" aria-hidden="true">
          {pathVariant === 'caiden' ? (
            <>
              <span className="mission-boardDeco mission-boardDeco--flame-a" />
              <span className="mission-boardDeco mission-boardDeco--flame-b" />
              <span className="mission-boardDeco mission-boardDeco--backpack" />
              <span className="mission-boardDeco mission-boardDeco--notebook" />
              <span className="mission-boardDeco mission-boardDeco--timer" />
            </>
          ) : (
            <>
              <span className="mission-boardDeco mission-boardDeco--magnifier" />
              <span className="mission-boardDeco mission-boardDeco--note-a" />
              <span className="mission-boardDeco mission-boardDeco--note-b" />
              <span className="mission-boardDeco mission-boardDeco--ember" />
              <span className="mission-boardDeco mission-boardDeco--grid" />
            </>
          )}
        </div>
        <MissionPathConnector variant={pathVariant} />
        {remappedMissions.map((mission) => (
          <div
            key={mission.id}
            className={['mission-pathNode', positionClass(mission.desktopPosition)]
              .filter(Boolean)
              .join(' ')}
          >
            <MissionFolderCard
              mission={mission}
              layout="board"
              onSelect={() => onSelectMission?.(mission)}
            />
          </div>
        ))}
      </div>

      <div
        className="mission-path mission-path--stack"
        role="list"
        aria-label={pathVariant === 'caiden' ? 'Focus quests' : 'Investigation cases'}
      >
        <MissionStackConnector />
        {sortedMobile.map((mission) => (
          <MissionFolderCard
            key={mission.id}
            mission={mission}
            layout="stack"
            onSelect={() => onSelectMission?.(mission)}
          />
        ))}
      </div>
    </div>
  );
}
