import AdventureStatusPanel, {
  type AdventureStatusPanelScene,
} from './AdventureStatusPanel';

export type MobileSceneStatusScene = AdventureStatusPanelScene;

/** @deprecated Prefer AdventureStatusPanel with variant="bar". Kept for reward screen. */
export default function MobileSceneStatus({
  scene,
  progressPercent,
  reduceMotion = false,
  markSrc,
  missionCompleted = 0,
  missionTotal = 3,
}: {
  scene: MobileSceneStatusScene;
  progressPercent: number;
  reduceMotion?: boolean;
  markSrc?: string;
  missionCompleted?: number;
  missionTotal?: number;
}) {
  const publicUrl = process.env.PUBLIC_URL || '';
  const emblem = markSrc ?? `${publicUrl}/images/icons/focus-flame-mark.svg`;

  return (
    <AdventureStatusPanel
      mode="story"
      variant="bar"
      scene={scene}
      progressPercent={progressPercent}
      markSrc={emblem}
      reduceMotion={reduceMotion}
      missionCompleted={missionCompleted}
      missionTotal={missionTotal}
    />
  );
}
