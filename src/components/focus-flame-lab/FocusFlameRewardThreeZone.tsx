import React, { useEffect } from 'react';
import { adventureReminderCopy } from './AdventureStatusPanel';
import CompactB4HudCard from './CompactB4HudCard';
import MobileSceneStatus from './MobileSceneStatus';
import {
  isMissionComplete,
  missionProgressCount,
  sceneLevelNumber,
  SCENE_MISSION_ORDER,
} from './focusFlameMission';
import { focusFlameRankLabel } from './focusFlameRanks';

type Feeling = 'Nervous' | 'Excited' | 'Embarrassed' | 'Angry';
type BodySignal = 'Head' | 'Chest' | 'Hands' | 'Stomach';

export type FocusFlameRewardScene = {
  id: 'move' | 'ceremony' | 'cave';
  title: string;
  blurb: string;
  cardImageSrc: string;
};

function clamp<T>(v: T | null | undefined, fallback: T) {
  return (v ?? fallback) as T;
}

function badgeIconUrls(publicUrl: string) {
  const root = publicUrl.endsWith('/') ? publicUrl.slice(0, -1) : publicUrl;
  const icons = `${root}/images/icons`;
  return {
    noticing: `${icons}/leading-the-charge.webp`,
    body: `${icons}/post-on-fire.webp`,
    draw: `${icons}/the-warrior.webp`,
  };
}

function sceneImgClass(sceneId: FocusFlameRewardScene['id']): string {
  if (sceneId === 'move') return 'ffl-sceneRowImg--move';
  if (sceneId === 'ceremony') return 'ffl-sceneRowImg--ceremony';
  return 'ffl-sceneRowImg--cave';
}

function RewardHudBadge({
  src,
  alt,
  label,
}: {
  src: string;
  alt: string;
  label: string;
}) {
  return (
    <div className="ffl-reward-hud-badge" aria-label={label}>
      <div className="ffl-reward-hud-badge-iconWrap">
        <img className="ffl-reward-hud-badge-img" src={src} alt={alt} loading="eager" decoding="async" />
      </div>
      <span className="ffl-reward-hud-badge-label">{label}</span>
    </div>
  );
}

function MissionLevelCard({
  scene,
  isCompleted,
  isJustCompleted,
  onStart,
  onPlayButtonClick,
}: {
  scene: FocusFlameRewardScene;
  isCompleted: boolean;
  isJustCompleted: boolean;
  onStart: (scene: FocusFlameRewardScene) => void;
  onPlayButtonClick: () => void;
}) {
  const levelNum = sceneLevelNumber(scene.id);
  const statusPill = isCompleted ? (
    <span className="ffl-level-status ffl-level-status--completed">✓ Completed</span>
  ) : (
    <span className="ffl-level-status ffl-level-status--available">Available</span>
  );

  const media = (
    <span className="ffl-mission-level-media">
      <img
        className={`ffl-mission-level-img ffl-sceneRowImg ${sceneImgClass(scene.id)}`}
        src={scene.cardImageSrc}
        alt=""
        loading="lazy"
        decoding="async"
      />
      <span className="ffl-mission-level-num" aria-hidden="true">
        Level {levelNum}
      </span>
    </span>
  );

  const cardClass = [
    'ffl-mission-level-card',
    isCompleted ? 'ffl-mission-level-card--completed' : 'ffl-mission-level-card--available',
    isJustCompleted ? 'ffl-mission-level-card--justCompleted' : '',
  ]
    .filter(Boolean)
    .join(' ');

  if (isCompleted) {
    return (
      <div className={cardClass}>
        {media}
        <div className="ffl-mission-level-body">
          <div className="ffl-mission-level-text">
            <span className="ffl-mission-level-title">{scene.title}</span>
            <span className="ffl-mission-level-blurb">{scene.blurb}</span>
          </div>
          <div className="ffl-mission-level-meta">
            {statusPill}
            {isJustCompleted ? <span className="ffl-mission-level-justDone">Just completed</span> : null}
          </div>
          <button
            type="button"
            className="ffl-mission-level-replay"
            onClick={() => {
              onPlayButtonClick();
              onStart(scene);
            }}
          >
            Replay
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      className={cardClass}
      onClick={() => {
        onPlayButtonClick();
        onStart(scene);
      }}
      aria-label={`Start ${scene.title}. Available.`}
    >
      {media}
      <div className="ffl-mission-level-body">
        <div className="ffl-mission-level-text">
          <span className="ffl-mission-level-title">{scene.title}</span>
          <span className="ffl-mission-level-blurb">{scene.blurb}</span>
        </div>
        <div className="ffl-mission-level-meta">
          {statusPill}
          {isJustCompleted ? <span className="ffl-mission-level-justDone">Just completed</span> : null}
        </div>
      </div>
    </button>
  );
}

function MissionCompletedThumbCard({ scene }: { scene: FocusFlameRewardScene }) {
  const levelNum = sceneLevelNumber(scene.id);
  return (
    <div
      className="ffl-mission-level-card ffl-mission-level-card--completed ffl-mission-level-card--display"
      aria-label={`${scene.title}. Completed.`}
    >
      <span className="ffl-mission-level-media">
        <img
          className={`ffl-mission-level-img ffl-sceneRowImg ${sceneImgClass(scene.id)}`}
          src={scene.cardImageSrc}
          alt=""
          loading="lazy"
          decoding="async"
        />
        <span className="ffl-mission-level-num" aria-hidden="true">
          Level {levelNum}
        </span>
      </span>
      <div className="ffl-mission-level-body">
        <div className="ffl-mission-level-text">
          <span className="ffl-mission-level-title">{scene.title}</span>
        </div>
        <div className="ffl-mission-level-meta">
          <span className="ffl-level-status ffl-level-status--completed">✓ Completed</span>
        </div>
      </div>
    </div>
  );
}

function EndScreenSummary({
  missionComplete,
  progressCount,
  sceneCount,
  focusPoints,
  rankLabel,
  feeling,
  body,
}: {
  missionComplete: boolean;
  progressCount: number;
  sceneCount: number;
  focusPoints: number;
  rankLabel: string;
  feeling: Feeling | null;
  body: BodySignal | null;
}) {
  return (
    <header className="ffl-reward-hero-intro">
      <p className="ffl-reward-mission-progress" aria-live="polite">
        {progressCount} of {sceneCount} adventures complete
      </p>
      {missionComplete ? (
        <>
          <h1 className="ffl-h2 ffl-reward-hero-title">Mission complete.</h1>
          <p className="ffl-reward-hero-sub">You helped Caiden through all three adventures.</p>
          <p className="ffl-reward-hero-hint">Your Focus Flame certificate is unlocked.</p>
        </>
      ) : (
        <>
          <h1 className="ffl-h2 ffl-reward-hero-title">Adventure complete.</h1>
          <p className="ffl-reward-hero-sub">You helped Caiden steady his flame.</p>
          <p className="ffl-reward-hero-hint">Choose another adventure to continue the mission.</p>
        </>
      )}
      <div className="ffl-reward-hero-pointsRow">
        <span className="ffl-reward-hero-points-value" aria-label={`${focusPoints} Focus Points`}>
          {focusPoints}
        </span>
        <span className="ffl-reward-hero-points-label">Focus Points total</span>
      </div>
      <p className="ffl-reward-hero-rank">Rank: {rankLabel}</p>
      <p className="ffl-reward-hero-meta">
        Feeling: <span className="ffl-strong">{clamp(feeling, '—')}</span> · Body signal:{' '}
        <span className="ffl-strong">{clamp(body, '—')}</span>
      </p>
    </header>
  );
}

export default function FocusFlameRewardThreeZone({
  selectedScene,
  scenes,
  completedSceneIds,
  feeling,
  body,
  focusPoints,
  getBookHref,
  onStartAdventure,
  onPlayAgain,
  onExitGame,
  onPlayButtonClick,
  markSrc,
}: {
  selectedScene: FocusFlameRewardScene;
  scenes: FocusFlameRewardScene[];
  completedSceneIds: ReadonlySet<FocusFlameRewardScene['id']>;
  feeling: Feeling | null;
  body: BodySignal | null;
  focusPoints: number;
  getBookHref?: string;
  onStartAdventure: (scene: FocusFlameRewardScene) => void;
  onPlayAgain: () => void;
  onExitGame: () => void;
  onPlayButtonClick: () => void;
  reduceMotion?: boolean;
  markSrc: string;
}) {
  const publicUrl = process.env.PUBLIC_URL || '';
  const icons = badgeIconUrls(publicUrl);
  const certificatePdfHref = `${publicUrl}/downloads/Certificates/focus-flame-certificate.pdf`;
  const missionComplete = isMissionComplete(completedSceneIds, scenes.length);
  const progressCount = missionProgressCount(completedSceneIds);

  const orderedScenes = [...scenes].sort(
    (a, b) => SCENE_MISSION_ORDER.indexOf(a.id) - SCENE_MISSION_ORDER.indexOf(b.id)
  );
  const rankLabel = focusFlameRankLabel(focusPoints);

  useEffect(() => {
    console.log('[Journey] completedSceneIds', completedSceneIds);
  }, [completedSceneIds]);

  const b4Message = missionComplete
    ? 'You did it. All three adventures are complete.'
    : 'Nice work on this adventure. Ready for another?';

  const chooseAdventurePanel = (
    <section
      className="ffl-reward-surface-card ffl-reward-surface-card--mission ffl-end-screen-action-card ffl-mission-choose-card"
      aria-labelledby="ffl-mission-choose-title"
    >
      <h3 id="ffl-mission-choose-title" className="ffl-reward-surface-title">
        Choose next adventure
      </h3>
      <p className="ffl-reward-kids-copy ffl-mission-choose-sub">
        Complete all 3 adventures to unlock your certificate.
      </p>
      <div className="ffl-mission-level-grid" role="list">
        {orderedScenes.map((s) => {
          const isCompleted = completedSceneIds.has(s.id);
          const isJustCompleted = isCompleted && s.id === selectedScene.id;
          return (
            <div key={s.id} role="listitem">
              <MissionLevelCard
                scene={s}
                isCompleted={isCompleted}
                isJustCompleted={isJustCompleted}
                onStart={onStartAdventure}
                onPlayButtonClick={onPlayButtonClick}
              />
            </div>
          );
        })}
      </div>
      <div className="ffl-reward-cta-stack ffl-mission-choose-footer">
        <button type="button" className="ffl-ctaSecondary ffl-reward-kids-cta" onClick={onExitGame}>
          Exit game
        </button>
        <p className="ffl-reward-cert-locked" role="status">
          Complete all 3 adventures to unlock your certificate.
        </p>
        {getBookHref ? (
          <a
            className="ffl-reward-book-link ffl-reward-book-link--tertiary"
            href={getBookHref}
            onClick={() => onPlayButtonClick()}
          >
            Get the book
          </a>
        ) : null}
      </div>
    </section>
  );

  const certificatePanel = (
    <section
      className="ffl-reward-surface-card ffl-reward-surface-card--mission ffl-end-screen-action-card ffl-mission-cert-card"
      aria-labelledby="ffl-cert-unlocked-title"
    >
      <h3 id="ffl-cert-unlocked-title" className="ffl-reward-surface-title">
        Certificate unlocked
      </h3>
      <div className="ffl-mission-level-grid" role="list" aria-label="Completed adventures">
        {orderedScenes.map((s) => (
          <div key={s.id} role="listitem">
            <MissionCompletedThumbCard scene={s} />
          </div>
        ))}
      </div>
      <p className="ffl-reward-kids-copy ffl-mission-cert-copy">
        You completed the full Focus Flame Mission.
      </p>
      <div className="ffl-reward-cta-stack ffl-mission-cert-footer">
        <a
          className="ffl-ctaPrimary ffl-primary-button ffl-reward-kids-cta ffl-reward-cert-download"
          href={certificatePdfHref}
          download="focus-flame-certificate.pdf"
          onClick={() => onPlayButtonClick()}
        >
          Download Kid Certificate
        </a>
        <button type="button" className="ffl-ctaSecondary ffl-reward-kids-cta" onClick={onPlayAgain}>
          Play again
        </button>
        {getBookHref ? (
          <a
            className="ffl-reward-book-link ffl-reward-book-link--tertiary"
            href={getBookHref}
            onClick={() => onPlayButtonClick()}
          >
            Get the book
          </a>
        ) : null}
      </div>
    </section>
  );

  return (
    <div className="ffl-reward-page-wrap ffl-reward-page-wrap--end">
      <div className="ffl-reward-three-zone ffl-reward-stack ffl-end-screen">
        <aside className="ffl-reward-left-hud" aria-label="Reward status panel">
          <div className="ffl-reward-mobileSceneWrap">
            <MobileSceneStatus scene={selectedScene} progressPercent={100} />
          </div>

          <CompactB4HudCard message={b4Message} />

          <div className="ffl-hud-card ffl-hud-card--adventure ffl-reward-left-hud-card ffl-hud-adventure-card">
            <div className="ffl-hud-scene-thumbWrap ffl-hud-scene-thumbWrap--inCard">
              <img
                className="ffl-hud-scene-thumb"
                src={selectedScene.cardImageSrc}
                alt=""
                loading="lazy"
                decoding="async"
                data-ffl-scene={selectedScene.id}
              />
            </div>
            <div className="ffl-hud-scene-title">{selectedScene.title}</div>
            <p className="ffl-hud-scene-reminder">{adventureReminderCopy(selectedScene.id)}</p>
          </div>

          <div className="ffl-hud-card ffl-hud-card--flame ffl-flame-status-card ffl-reward-left-hud-card ffl-reward-left-flame-card">
            <div className="ffl-reward-left-flame-row">
              <img className="ffl-reward-left-flame-mark" src={markSrc} alt="" decoding="async" />
              <h4 className="ffl-flame-status-headline ffl-reward-left-flame-headline">Steady</h4>
            </div>
            <div className="ffl-reward-hud-badge-row" role="list">
              <div role="listitem">
                <RewardHudBadge src={icons.noticing} alt="Noticing badge" label="Noticing" />
              </div>
              <div role="listitem">
                <RewardHudBadge src={icons.body} alt="Body badge" label="Body" />
              </div>
              <div role="listitem">
                <RewardHudBadge src={icons.draw} alt="Draw badge" label="Draw" />
              </div>
            </div>
          </div>
        </aside>

        <main className="ffl-reward-hero ffl-reward-main ffl-reward-score-column">
          <EndScreenSummary
            missionComplete={missionComplete}
            progressCount={progressCount}
            sceneCount={scenes.length}
            focusPoints={focusPoints}
            rankLabel={rankLabel}
            feeling={feeling}
            body={body}
          />
        </main>

        <aside
          className="ffl-reward-action-panel"
          aria-label={missionComplete ? 'Certificate unlocked' : 'Choose next adventure'}
        >
          {missionComplete ? certificatePanel : chooseAdventurePanel}
        </aside>
      </div>
    </div>
  );
}
