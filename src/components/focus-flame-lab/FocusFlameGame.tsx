import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import B4GuidePanel from './B4GuidePanel';
import GameHudPanel from './GameHudPanel';
import FocusFlameMark from '../FocusFlameMark';
import FocusFlameBootLoader from './FocusFlameBootLoader';
import AdventureFlowLayout from './AdventureFlowLayout';
import FocusFlameRewardThreeZone from './FocusFlameRewardThreeZone';
import FocusFlameSoundGate from './FocusFlameSoundGate';
import FocusFlameSoundMenu from './FocusFlameSoundMenu';
import SceneMoment, { type SceneMomentPhase } from './SceneMoment';
import RealLifePractice, { type RealLifePracticePhase } from './RealLifePractice';
import EmotionTapStep from './EmotionTapStep';
import BodySignalStep from './BodySignalStep';
import FocusMoveStep from './FocusMoveStep';
import ReasoningWhyStep from './ReasoningWhyStep';
import {
  MISSION_GOAL_COPY,
  MISSION_INTRO_B4,
  MISSION_TITLE,
  SCENE_MISSION_ORDER,
  adventureLevelStatus,
  isMissionComplete,
  missionProgressCount,
  sceneLevelNumber,
} from './focusFlameMission';
import {
  bodyWhyOptions,
  bodyWhyPrompt,
  feelingWhyOptions,
  feelingWhyPrompt,
  moveWhyOptions,
  moveWhyPrompt,
} from './focusFlameReasoning';
import type { Feeling, BodySignal } from './focusFlameSelTypes';
import type { FocusFlameMove } from './focusFlameMoves';
import { FOCUS_POINT_AWARDS } from './focusFlameRanks';
import {
  FLAME_STEADY_B4_MESSAGES,
  useFocusFlameAudio,
} from '../../hooks/useFocusFlameAudio';
import { sceneAdventureB4Clip, type B4ClipSlug } from './focusFlameB4Clips';

/**
 * Marketing entry/start screen (Focus Flame Lab title, flame, “Enter the Lab”) is kept in JSX below
 * but gated off. To restore later: set `SHOW_ENTRY_SCREEN` to `true`, set initial `useState<Screen>('entry')`,
 * and in `goBack` handle `sceneSelect` → `entry` instead of navigating home.
 */
const SHOW_ENTRY_SCREEN = false;

export type FocusFlameSceneId = 'move' | 'ceremony' | 'cave';

export type FocusFlameScene = {
  id: FocusFlameSceneId;
  title: string;
  blurb: string;
  momentCopy: string;
  videoSrc: string;
  /** Progressive tap videos during flame phase (The Path only). */
  tapVideoSequence?: readonly string[] | null;
  thumbnail: string;
  cardImageSrc: string;
  cardImageAlt: string;
  featured?: boolean;
  cardBadgeTone: 'blue' | 'gold' | 'violet';
};

type Screen =
  | 'entry'
  | 'sceneSelect'
  | 'sceneMoment'
  | 'step2'
  | 'step2Why'
  | 'step3'
  | 'step3Why'
  | 'step4'
  | 'step4Why'
  | 'realLifePractice'
  | 'reward';

function b4ClipForScreen(
  screen: Screen,
  selectedScene: FocusFlameScene | null,
  showEntryScreen: boolean,
  missionDone: boolean,
  sceneMomentPhase: SceneMomentPhase
): B4ClipSlug | null {
  if (showEntryScreen && screen === 'entry') return 'intro-welcome';
  if (screen === 'sceneSelect') return 'mission-intro';
  if (screen === 'sceneMoment' && selectedScene) {
    if (sceneMomentPhase === 'steady' || sceneMomentPhase === 'ready') return null;
    return sceneAdventureB4Clip(selectedScene.id);
  }
  if (screen === 'step2') return 'feeling-prompt';
  if (screen === 'step2Why') return 'why-feeling';
  if (screen === 'step3') return 'body-prompt';
  if (screen === 'step3Why') return 'why-body';
  if (screen === 'step4') return 'focus-move-prompt';
  if (screen === 'step4Why') return 'why-move';
  if (screen === 'realLifePractice') return null;
  if (screen === 'reward') return missionDone ? 'mission-complete' : 'reward-screen';
  return null;
}

/** Deterministic Focus Flame fill for adventure flow (intro → reward). */
function focusFlameProgressPercent(screen: Screen): number {
  if (screen === 'sceneMoment') return 28;
  if (screen === 'step2') return 36;
  if (screen === 'step2Why') return 44;
  if (screen === 'step3') return 52;
  if (screen === 'step3Why') return 60;
  if (screen === 'step4') return 70;
  if (screen === 'step4Why') return 78;
  if (screen === 'realLifePractice') return 90;
  if (screen === 'reward') return 100;
  return 0;
}

function GameHudChrome({
  hideStatusLabels,
  hideHudNodes,
  hideHudEdges,
}: {
  hideStatusLabels?: boolean;
  hideHudNodes?: boolean;
  hideHudEdges?: boolean;
}) {
  return (
    <>
      {!hideHudEdges ? (
        <div className="ffl-hudEdges" aria-hidden="true">
          <div className="hud-edge hud-edge--top" />
          <div className="hud-edge hud-edge--bottom" />
          <div className="hud-edge hud-edge--left" />
          <div className="hud-edge hud-edge--right" />
          <div className="hud-corner hud-corner--tl" />
          <div className="hud-corner hud-corner--tr" />
          <div className="hud-corner hud-corner--bl" />
          <div className="hud-corner hud-corner--br" />
        </div>
      ) : null}
      <div className="ffl-gameHudDecor" aria-hidden="true" />
      {!hideHudNodes ? <div className="ffl-gameHudNodes" aria-hidden="true" /> : null}
      {!hideStatusLabels ? (
        <>
          <div className="ffl-gameHudLabel ffl-gameHudLabel--top" aria-hidden="true">
            EMOTIONAL SYSTEM ONLINE
          </div>
          <div className="ffl-gameHudLabel ffl-gameHudLabel--bottom" aria-hidden="true">
            FOCUS FLAME ACTIVE
          </div>
        </>
      ) : null}
    </>
  );
}

/** Scene select: entire card is one button (image + copy + visual Begin pill). */
function SceneSelectMissionRow({
  scene,
  levelStatus,
  onBegin,
  onCardHover,
  onCardSelect,
}: {
  scene: FocusFlameScene;
  levelStatus: 'completed' | 'current' | 'available';
  onBegin: () => void;
  onCardHover: () => void;
  onCardSelect: () => void;
}) {
  const featured = Boolean(scene.featured);
  const levelNum = sceneLevelNumber(scene.id);
  const statusLabel =
    levelStatus === 'completed' ? 'Completed' : levelStatus === 'current' ? 'In progress' : 'Available';
  const imgPosClass =
    scene.id === 'move'
      ? 'ffl-sceneRowImg--move'
      : scene.id === 'ceremony'
        ? 'ffl-sceneRowImg--ceremony'
        : scene.id === 'cave'
          ? 'ffl-sceneRowImg--cave'
          : '';

  return (
    <button
      type="button"
      className={[
        'ffl-sceneRow',
        featured ? 'ffl-sceneRow--featured' : '',
        levelStatus === 'completed' ? 'ffl-sceneRow--completed' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse') onCardHover();
      }}
      onClick={() => {
        onCardSelect();
        onBegin();
      }}
      aria-label={`Level ${levelNum}: ${scene.title}. ${statusLabel}.`}
    >
      <span className="ffl-sceneRowMedia">
        <img
          className={`ffl-sceneRowImg${imgPosClass ? ` ${imgPosClass}` : ''}`}
          src={scene.cardImageSrc}
          alt=""
          loading="lazy"
          decoding="async"
        />
        <span className="ffl-sceneRowLevel" aria-hidden="true">
          Level {levelNum}
        </span>
        {levelStatus === 'completed' ? (
          <span className="ffl-sceneRowCompletedMark" aria-hidden="true">
            ✓
          </span>
        ) : null}
      </span>
      <span className="ffl-sceneRowText">
        <span className="ffl-sceneRowTitle">{scene.title}</span>
        <span className="ffl-sceneRowBlurb">{scene.blurb}</span>
        <span className="ffl-sceneRowStatus" data-status={statusLabel}>
          {statusLabel}
        </span>
      </span>
      <span className="ffl-sceneRowBegin ffl-sceneRowBegin--pill" aria-hidden="true">
        {levelStatus === 'completed' ? 'Play again' : 'Begin'}
      </span>
    </button>
  );
}

export default function FocusFlameGame({
  scenes,
  parentsLink,
  getBookHref,
}: {
  scenes: FocusFlameScene[];
  parentsLink?: React.ReactNode;
  getBookHref?: string;
}) {
  const navigate = useNavigate();
  const {
    soundEnabled,
    setSoundEnabled,
    musicVolume,
    setMusicVolume,
    sfxVolume,
    setSfxVolume,
    voiceEnabled,
    setVoiceEnabled,
    voiceVolume,
    setVoiceVolume,
    playB4Voice,
    playFlameSteadySuccess,
    playB4Clip,
    playB4ClipAsync,
    stopB4PracticeVoice,
    playUiConfirm,
    stopB4Voice,
    playCardHover,
    playCardSelect,
    playButtonClick,
  } = useFocusFlameAudio();
  const [bootDone, setBootDone] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [soundMenuOpen, setSoundMenuOpen] = useState(false);
  const [screen, setScreen] = useState<Screen>('sceneSelect');
  const [selectedScene, setSelectedScene] = useState<FocusFlameScene | null>(null);
  const [feeling, setFeeling] = useState<Feeling | null>(null);
  const [body, setBody] = useState<BodySignal | null>(null);
  const [move, setMove] = useState<FocusFlameMove | null>(null);
  const [storyClueB4, setStoryClueB4] = useState<string | null>(null);
  const [focusPoints, setFocusPoints] = useState(0);
  // TODO: persist completedSceneIds to localStorage if we want returning users to keep journey progress.
  const [completedSceneIds, setCompletedSceneIds] = useState<Set<FocusFlameSceneId>>(() => new Set());
  const [soundGateResolved, setSoundGateResolved] = useState(false);
  const prevFeelingAwarded = useRef(false);
  const prevFeelingWhyAwarded = useRef(false);
  const prevBodyAwarded = useRef(false);
  const prevBodyWhyAwarded = useRef(false);
  const prevMoveAwarded = useRef(false);
  const prevMoveWhyAwarded = useRef(false);
  const beatSteadyAwardedRef = useRef(false);
  const practiceAwardedRef = useRef(false);
  const [sceneMomentKey, setSceneMomentKey] = useState(0);
  const [sceneMomentPhase, setSceneMomentPhase] = useState<SceneMomentPhase>('watch');
  const [practicePhase, setPracticePhase] = useState<RealLifePracticePhase>('practice');
  /** After “Enable Sound”, skip one auto narration pass so intro is not played twice. */
  const skipNextB4ScreenVoiceRef = useRef(false);
  const sceneMomentPhaseRef = useRef<SceneMomentPhase>(sceneMomentPhase);
  sceneMomentPhaseRef.current = sceneMomentPhase;

  const handleSceneMomentPhaseChange = useCallback((phase: SceneMomentPhase) => {
    sceneMomentPhaseRef.current = phase;
    setSceneMomentPhase(phase);
  }, []);

  useEffect(() => {
    if (screen !== 'step2Why' && screen !== 'step3Why' && screen !== 'step4Why') {
      setStoryClueB4(null);
    }
  }, [screen]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const fn = () => setReduceMotion(mq.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);

  const [isMobileGameUi, setIsMobileGameUi] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches
  );
  const [mobileGameMenuOpen, setMobileGameMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 768px)');
    const apply = () => setIsMobileGameUi(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const playSceneSelectCardHover = useCallback(() => {
    if (isMobileGameUi) return;
    playCardHover();
  }, [isMobileGameUi, playCardHover]);

  const confirmStepChoice = useCallback(
    (isNewSelection: boolean) => {
      if (isNewSelection) playUiConfirm();
    },
    [playUiConfirm]
  );

  useEffect(() => {
    if (!mobileGameMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileGameMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileGameMenuOpen]);

  useEffect(() => {
    if (!mobileGameMenuOpen) setSoundMenuOpen(false);
  }, [mobileGameMenuOpen, setSoundMenuOpen]);

  const handleSoundGateEnable = useCallback(() => {
    setMusicVolume(0.12);
    setSoundEnabled(true);
    setVoiceEnabled(true);
    setSoundGateResolved(true);
    skipNextB4ScreenVoiceRef.current = true;
    playB4Voice('intro-welcome', { bypassVoiceCheck: true });
  }, [playB4Voice, setMusicVolume, setSoundEnabled, setVoiceEnabled]);

  const handleSoundGateSilent = useCallback(() => {
    setSoundEnabled(false);
    setVoiceEnabled(false);
    setSoundGateResolved(true);
    stopB4Voice();
  }, [setSoundEnabled, setVoiceEnabled, stopB4Voice]);

  useEffect(() => {
    return () => {
      stopB4Voice();
    };
  }, [screen, stopB4Voice]);

  const missionProgress = missionProgressCount(completedSceneIds);
  const missionDone = isMissionComplete(completedSceneIds, scenes.length);
  const inProgressSceneId =
    screen !== 'sceneSelect' && screen !== 'reward' && selectedScene ? selectedScene.id : null;

  useEffect(() => {
    if (!bootDone || !soundGateResolved) {
      stopB4Voice();
      return;
    }
    if (!voiceEnabled) {
      stopB4Voice();
      return;
    }
    if (skipNextB4ScreenVoiceRef.current) {
      skipNextB4ScreenVoiceRef.current = false;
      return;
    }
    const momentPhase = sceneMomentPhaseRef.current;
    if (screen === 'sceneMoment' && (momentPhase === 'steady' || momentPhase === 'ready')) {
      return;
    }
    if (screen === 'realLifePractice') {
      return;
    }
    stopB4Voice();

    const clip = b4ClipForScreen(
      screen,
      selectedScene,
      SHOW_ENTRY_SCREEN,
      missionDone,
      momentPhase
    );
    if (!clip) return;
    const t = window.setTimeout(() => {
      const phaseNow = sceneMomentPhaseRef.current;
      if (screen === 'sceneMoment' && (phaseNow === 'steady' || phaseNow === 'ready')) return;
      playB4Clip(clip);
    }, 320);
    return () => {
      window.clearTimeout(t);
    };
  }, [
    bootDone,
    soundGateResolved,
    voiceEnabled,
    screen,
    selectedScene,
    sceneMomentPhase,
    missionDone,
    playB4Clip,
    stopB4Voice,
  ]);

  const awardFocusPoints = useCallback((amount: number) => {
    setFocusPoints((p) => p + amount);
  }, []);

  const resetAdventureChoices = useCallback(() => {
    setFeeling(null);
    setBody(null);
    setMove(null);
    prevFeelingAwarded.current = false;
    prevFeelingWhyAwarded.current = false;
    prevBodyAwarded.current = false;
    prevBodyWhyAwarded.current = false;
    prevMoveAwarded.current = false;
    prevMoveWhyAwarded.current = false;
    beatSteadyAwardedRef.current = false;
    practiceAwardedRef.current = false;
  }, []);

  const goToSceneMoment = useCallback(() => {
    sceneMomentPhaseRef.current = 'watch';
    setSceneMomentPhase('watch');
    setSceneMomentKey((k) => k + 1);
    setScreen('sceneMoment');
  }, []);

  const completeSceneMoment = useCallback(() => {
    setScreen('step2');
  }, []);

  const skipSceneMomentBeat = useCallback(() => {
    playButtonClick();
    setScreen('step2');
  }, [playButtonClick]);

  const markSceneComplete = useCallback((sceneId: FocusFlameSceneId) => {
    setCompletedSceneIds((prev) => {
      if (prev.has(sceneId)) return prev;
      const next = new Set(prev);
      next.add(sceneId);
      console.log('[Journey] completedSceneIds', next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (screen === 'reward' && selectedScene) {
      markSceneComplete(selectedScene.id);
    }
  }, [screen, selectedScene, markSceneComplete]);

  const resetGameSession = useCallback(() => {
    setCompletedSceneIds(new Set());
    setSelectedScene(null);
    resetAdventureChoices();
    setFocusPoints(0);
    sceneMomentPhaseRef.current = 'watch';
    setSceneMomentPhase('watch');
    setScreen('sceneSelect');
  }, [resetAdventureChoices]);

  const handleExitGame = useCallback(() => {
    playButtonClick();
    resetGameSession();
  }, [playButtonClick, resetGameSession]);

  const startScene = useCallback(
    (s: FocusFlameScene) => {
      setSelectedScene(s);
      resetAdventureChoices();
      goToSceneMoment();
    },
    [resetAdventureChoices, goToSceneMoment]
  );

  const startAdventureFromReward = useCallback(
    (rewardScene: { id: FocusFlameScene['id'] }) => {
      const fullScene = scenes.find((s) => s.id === rewardScene.id);
      if (!fullScene) return;
      playButtonClick();
      playCardSelect();
      startScene(fullScene);
    },
    [scenes, playButtonClick, playCardSelect, startScene]
  );

  const goBack = () => {
    if (!bootDone || !soundGateResolved) return;
    playButtonClick();
    if (screen === 'sceneSelect') {
      navigate('/');
      return;
    }
    if (screen === 'sceneMoment') return setScreen('sceneSelect');
    if (screen === 'step2') return goToSceneMoment();
    if (screen === 'step2Why') return setScreen('step2');
    if (screen === 'step3') return setScreen('step2Why');
    if (screen === 'step3Why') return setScreen('step3');
    if (screen === 'step4') return setScreen('step3Why');
    if (screen === 'step4Why') return setScreen('step4');
    if (screen === 'realLifePractice') return setScreen('step4Why');
    if (screen === 'reward') return setScreen('realLifePractice');
  };

  useEffect(() => {
    if (feeling && !prevFeelingAwarded.current) {
      prevFeelingAwarded.current = true;
      awardFocusPoints(FOCUS_POINT_AWARDS.feeling);
    }
    if (!feeling) prevFeelingAwarded.current = false;
  }, [feeling, awardFocusPoints]);

  useEffect(() => {
    if (body && !prevBodyAwarded.current) {
      prevBodyAwarded.current = true;
      awardFocusPoints(FOCUS_POINT_AWARDS.body);
    }
    if (!body) prevBodyAwarded.current = false;
  }, [body, awardFocusPoints]);

  useEffect(() => {
    if (move && !prevMoveAwarded.current) {
      prevMoveAwarded.current = true;
      awardFocusPoints(FOCUS_POINT_AWARDS.move);
    }
    if (!move) prevMoveAwarded.current = false;
  }, [move, awardFocusPoints]);

  const b4Message =
    screen === 'sceneSelect'
      ? MISSION_INTRO_B4
      : screen === 'sceneMoment'
        ? sceneMomentPhase === 'watch'
          ? 'Watch closely. Caiden’s flame is trying to tell us something.'
          : sceneMomentPhase === 'ready'
            ? FLAME_STEADY_B4_MESSAGES.after
            : FLAME_STEADY_B4_MESSAGES.before
        : screen === 'step2'
            ? 'Let’s name what Caiden might be feeling.'
            : screen === 'step2Why'
              ? storyClueB4 ?? 'Why do you think Caiden feels that way?'
              : screen === 'step3'
                ? 'Big feelings can show up in the body too.'
                : screen === 'step3Why'
                  ? storyClueB4 ?? 'What clue did Caiden’s body give us?'
                  : screen === 'step4'
                    ? 'Choose one move to help Caiden steady his flame.'
                    : screen === 'step4Why'
                      ? storyClueB4 ?? 'Why could that Focus Flame move help?'
                      : screen === 'realLifePractice'
                  ? practicePhase === 'practice'
                    ? 'Let’s try one Focus Flame move together.'
                    : 'You can use this anytime your flame feels too big.'
                  : screen === 'reward'
                    ? missionDone
                      ? 'You did it. You helped Caiden through all three adventures. Your Focus Flame certificate is unlocked.'
                      : 'Nice work on this adventure. Ready for another?'
                    : 'Choose what feels true right now. We’ll steady the Focus Flame step by step.';

  const canProceedStep2 = screen === 'step2' && feeling != null;
  const canProceedStep3 = screen === 'step3' && body != null;
  const canProceedStep4 = screen === 'step4' && move != null;

  const awardReasoningPoints = useCallback(
    (ref: React.MutableRefObject<boolean>) => {
      if (ref.current) return;
      ref.current = true;
      console.log('[STORY CLUE] +10 Focus Points awarded');
      awardFocusPoints(FOCUS_POINT_AWARDS.reasoning);
      playUiConfirm();
    },
    [awardFocusPoints, playUiConfirm]
  );

  const sortedScenes = [...scenes].sort(
    (a, b) => SCENE_MISSION_ORDER.indexOf(a.id) - SCENE_MISSION_ORDER.indexOf(b.id)
  );

  const focusFlameMarkSrc = `${process.env.PUBLIC_URL || ''}/images/icons/focus-flame-mark.svg`;

  const navDisabled = !bootDone || !soundGateResolved;

  return (
    <section className="ffl-shell ffl-gameShell ffl-focusFlameGame">
      <div className="ffl-gameStageWrap">
        {!bootDone ? (
          <FocusFlameBootLoader
            markSrc={`${process.env.PUBLIC_URL || ''}/images/icons/focus-flame-mark.svg`}
            reduceMotion={reduceMotion}
            onDone={() => setBootDone(true)}
          />
        ) : null}
        <div
          className={`ffl-stage ffl-stage--game${SHOW_ENTRY_SCREEN && screen === 'entry' ? ' ffl-stage--entry' : ''}${
            bootDone ? ' ffl-stage--booted' : ' ffl-stage--booting'
          }`}
          role="region"
          aria-label="Focus Flame Lab"
        >
        <div className="focus-flame-game-shell">
          <div className="ffl-gameViewport focus-flame-hud ffl-gamePanel ffl-panel">
            {isMobileGameUi ? (
              <div className="ffl-mobile-game-chrome ffl-mobile-top-nav" data-open={mobileGameMenuOpen ? 'true' : undefined}>
                <button
                  type="button"
                  className="ffl-back ffl-hudBack ffl-mobile-game-back"
                  onClick={() => {
                    goBack();
                    setMobileGameMenuOpen(false);
                  }}
                  disabled={navDisabled}
                >
                  ← Back
                </button>
                <button
                  type="button"
                  className="ffl-mobile-menu-fab ffl-nav-button"
                  aria-expanded={mobileGameMenuOpen}
                  aria-haspopup="dialog"
                  aria-controls="ffl-mobile-game-menu"
                  onClick={() => setMobileGameMenuOpen((o) => !o)}
                >
                  Menu
                </button>
                {mobileGameMenuOpen ? (
                  <>
                    <button
                      type="button"
                      className="ffl-mobile-menu-backdrop"
                      aria-label="Close menu"
                      onClick={() => setMobileGameMenuOpen(false)}
                    />
                    <div
                      id="ffl-mobile-game-menu"
                      className="ffl-mobile-menu-sheet"
                      role="dialog"
                      aria-modal="true"
                      aria-label="Game menu"
                    >
                      <div className="ffl-mobile-menu-sheet-inner">
                        <Link
                          to="/"
                          className="ffl-nav-button ffl-mobile-menu-row"
                          onClick={() => {
                            handleExitGame();
                            setMobileGameMenuOpen(false);
                          }}
                        >
                          Exit Game
                        </Link>
                        <div className="ffl-mobile-menu-sound">
                          <FocusFlameSoundMenu
                            open={soundMenuOpen}
                            onOpenChange={setSoundMenuOpen}
                            soundEnabled={soundEnabled}
                            onSoundEnabledChange={setSoundEnabled}
                            voiceEnabled={voiceEnabled}
                            onVoiceEnabledChange={setVoiceEnabled}
                            musicVolume={musicVolume}
                            onMusicVolumeChange={setMusicVolume}
                            sfxVolume={sfxVolume}
                            onSfxVolumeChange={setSfxVolume}
                            voiceVolume={voiceVolume}
                            onVoiceVolumeChange={setVoiceVolume}
                          />
                        </div>
                        <div
                          className="ffl-mobile-menu-parents"
                          onClickCapture={(e) => {
                            const el = e.target as HTMLElement | null;
                            if (el?.closest('a, button')) {
                              playButtonClick();
                              setMobileGameMenuOpen(false);
                            }
                          }}
                        >
                          {parentsLink}
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            ) : null}
            <div className="ffl-hudNavBar ffl-gameTopNav ffl-top-nav ffl-hudNavDesktop">
              <div className="ffl-hudNavLeft">
                <button
                  type="button"
                  className="ffl-back ffl-hudBack"
                  onClick={goBack}
                  disabled={navDisabled}
                >
                  ← Back
                </button>
                <Link
                  to="/"
                  className="ffl-nav-button"
                  onClick={handleExitGame}
                >
                  Exit Game
                </Link>
              </div>
              <div className="ffl-hudNavRight">
                {!isMobileGameUi ? (
                  <FocusFlameSoundMenu
                    open={soundMenuOpen}
                    onOpenChange={setSoundMenuOpen}
                    soundEnabled={soundEnabled}
                    onSoundEnabledChange={setSoundEnabled}
                    voiceEnabled={voiceEnabled}
                    onVoiceEnabledChange={setVoiceEnabled}
                    musicVolume={musicVolume}
                    onMusicVolumeChange={setMusicVolume}
                    sfxVolume={sfxVolume}
                    onSfxVolumeChange={setSfxVolume}
                    voiceVolume={voiceVolume}
                    onVoiceVolumeChange={setVoiceVolume}
                  />
                ) : null}
                <div
                  className="ffl-hudParents"
                  onClickCapture={(e) => {
                    const el = e.target as HTMLElement | null;
                    if (el?.closest('a, button')) playButtonClick();
                  }}
                >
                  {parentsLink}
                </div>
              </div>
            </div>
            <div
              className={[
                'ffl-gameHud',
                screen === 'sceneSelect' ? 'ffl-gameHud--sceneSelect' : '',
                SHOW_ENTRY_SCREEN && screen === 'entry' ? 'ffl-gameHud--entry' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <GameHudChrome hideStatusLabels hideHudNodes hideHudEdges />
              <div className="ffl-hudContent">
                <div className="ffl-gameHudMain ffl-mobile-content">
              {SHOW_ENTRY_SCREEN && screen === 'entry' ? (
                <div className="ffl-screen ffl-screen--entry ffl-grid">
                  <div className="ffl-zone-hud">
                    <B4GuidePanel
                      message="I’m B-4. I’ll guide you one brave step at a time."
                      className="ffl-gameB4 ffl-b4-panel"
                    />
                  </div>
                  <div className="ffl-zone-main ffl-entry-stack">
                    <div className="ffl-entryKicker">FOCUS FLAME LAB</div>
                    <h1 className="ffl-entryTitle">Focus Flame Lab</h1>
                    <p className="ffl-entrySubtitle">
                      Step into Caiden’s world and help him turn big feelings into focused action.
                    </p>

                    <div className="ffl-entryFlameSlot">
                      <FocusFlameMark state="golden" size={232} className="ffl-entryFlameMark" />
                    </div>

                    <div className="ffl-entryActions">
                      <button
                        type="button"
                        className="ffl-entryLabBtn"
                        onClick={() => {
                          playButtonClick();
                          setScreen('sceneSelect');
                        }}
                      >
                        Enter the Lab
                      </button>
                      <div className="ffl-entryCtaHint">No login. No data saved. Just courage practice.</div>
                    </div>

                    <div className="ffl-entryStatus">FOCUS FLAME ACTIVE</div>
                  </div>
                </div>
              ) : null}

              {screen === 'sceneSelect' && (
                <div className="ffl-screen ffl-screen--sceneSelect ffl-grid">
                  <div className="ffl-zone-hud">
                    <B4GuidePanel message={b4Message} className="ffl-gameB4 ffl-b4-panel" />
                  </div>
                  <div className="ffl-scene-select-main">
                    <div className="ffl-sceneSelectTitleBlock ffl-scene-select-header ffl-missionSelectHeader">
                      <p className="ffl-missionSelectKicker">{MISSION_TITLE}</p>
                      <h2 className="ffl-sceneSelectTitle">Choose your next adventure</h2>
                      <p className="ffl-sceneSelectSubtitle">{MISSION_GOAL_COPY}</p>
                      <p className="ffl-missionSelectProgress" aria-live="polite">
                        {missionProgress} of {scenes.length} adventures complete
                      </p>
                    </div>
                    <div className="ffl-sceneSelectStack ffl-sceneCardList">
                      {sortedScenes.map((s) => (
                        <SceneSelectMissionRow
                          key={s.id}
                          scene={s}
                          levelStatus={adventureLevelStatus(s.id, completedSceneIds, inProgressSceneId)}
                          onBegin={() => startScene(s)}
                          onCardHover={playSceneSelectCardHover}
                          onCardSelect={playCardSelect}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {screen === 'sceneMoment' && selectedScene && (
                <AdventureFlowLayout className="ffl-screen--stack ffl-flow-layout ffl-mobile-stack">
                  <GameHudPanel
                    className="ffl-zone-hud"
                    b4Message={b4Message}
                    selectedScene={selectedScene}
                    progressPercent={focusFlameProgressPercent('sceneMoment')}
                    markSrc={focusFlameMarkSrc}
                    reduceMotion={reduceMotion}
                    feeling={feeling}
                    body={body}
                    move={move}
                  />
                  <main className="ffl-zone-main ffl-zone-main--step ffl-step-main ffl-flow-main">
                    <SceneMoment
                      key={`${selectedScene.id}-${sceneMomentKey}`}
                      scene={selectedScene}
                      markSrc={focusFlameMarkSrc}
                      reduceMotion={reduceMotion}
                      onButtonClick={playButtonClick}
                      onPhaseChange={handleSceneMomentPhaseChange}
                      playFlameSteadySuccess={playFlameSteadySuccess}
                      playB4Clip={playB4Clip}
                      onAwardPoints={(amount) => {
                        if (beatSteadyAwardedRef.current) return;
                        beatSteadyAwardedRef.current = true;
                        awardFocusPoints(amount);
                      }}
                      onComplete={completeSceneMoment}
                      onSkip={skipSceneMomentBeat}
                    />
                  </main>
                </AdventureFlowLayout>
              )}

              {screen === 'step2' && selectedScene && (
                <AdventureFlowLayout className="ffl-screen--stack ffl-flow-layout ffl-mobile-stack">
                  <GameHudPanel
                    className="ffl-zone-hud"
                    b4Message={b4Message}
                    selectedScene={selectedScene}
                    progressPercent={focusFlameProgressPercent('step2')}
                    markSrc={focusFlameMarkSrc}
                    reduceMotion={reduceMotion}
                    feeling={feeling}
                    body={body}
                    move={move}
                  />
                  <main className="ffl-zone-main ffl-zone-main--step ffl-step-main ffl-flow-main">
                    <EmotionTapStep
                      markSrc={focusFlameMarkSrc}
                      value={feeling}
                      reduceMotion={reduceMotion}
                      canProceed={canProceedStep2}
                      onSelect={(opt, isNew) => {
                        confirmStepChoice(isNew);
                        setFeeling(opt);
                      }}
                      onNextClick={playButtonClick}
                      onNext={() => setScreen('step2Why')}
                    />
                  </main>
                </AdventureFlowLayout>
              )}

              {screen === 'step2Why' && selectedScene && feeling && (
                <AdventureFlowLayout className="ffl-screen--stack ffl-flow-layout ffl-mobile-stack">
                  <GameHudPanel
                    className="ffl-zone-hud"
                    b4Message={b4Message}
                    selectedScene={selectedScene}
                    progressPercent={focusFlameProgressPercent('step2Why')}
                    markSrc={focusFlameMarkSrc}
                    reduceMotion={reduceMotion}
                    feeling={feeling}
                    body={body}
                    move={move}
                  />
                  <main className="ffl-zone-main ffl-zone-main--step ffl-step-main ffl-flow-main">
                    <ReasoningWhyStep
                      resetKey={`feeling-why-${selectedScene.id}-${feeling}`}
                      kicker="STORY CLUE"
                      prompt={feelingWhyPrompt(feeling)}
                      options={feelingWhyOptions(selectedScene.id)}
                      onAwardPoints={() => awardReasoningPoints(prevFeelingWhyAwarded)}
                      onB4Message={setStoryClueB4}
                      onTryAgainSound={playButtonClick}
                      onNextClick={playButtonClick}
                      onNext={() => setScreen('step3')}
                    />
                  </main>
                </AdventureFlowLayout>
              )}

              {screen === 'step3' && selectedScene && (
                <AdventureFlowLayout className="ffl-screen--stack ffl-flow-layout ffl-mobile-stack">
                  <GameHudPanel
                    className="ffl-zone-hud"
                    b4Message={b4Message}
                    selectedScene={selectedScene}
                    progressPercent={focusFlameProgressPercent('step3')}
                    markSrc={focusFlameMarkSrc}
                    reduceMotion={reduceMotion}
                    feeling={feeling}
                    body={body}
                    move={move}
                  />
                  <main className="ffl-zone-main ffl-zone-main--step ffl-step-main ffl-flow-main">
                    <BodySignalStep
                      value={body}
                      canProceed={canProceedStep3}
                      onSelect={(opt, isNew) => {
                        confirmStepChoice(isNew);
                        setBody(opt);
                      }}
                      onNextClick={playButtonClick}
                      onNext={() => setScreen('step3Why')}
                    />
                  </main>
                </AdventureFlowLayout>
              )}

              {screen === 'step3Why' && selectedScene && body && (
                <AdventureFlowLayout className="ffl-screen--stack ffl-flow-layout ffl-mobile-stack">
                  <GameHudPanel
                    className="ffl-zone-hud"
                    b4Message={b4Message}
                    selectedScene={selectedScene}
                    progressPercent={focusFlameProgressPercent('step3Why')}
                    markSrc={focusFlameMarkSrc}
                    reduceMotion={reduceMotion}
                    feeling={feeling}
                    body={body}
                    move={move}
                  />
                  <main className="ffl-zone-main ffl-zone-main--step ffl-step-main ffl-flow-main">
                    <ReasoningWhyStep
                      resetKey={`body-why-${selectedScene.id}-${body}`}
                      kicker="STORY CLUE"
                      prompt={bodyWhyPrompt(body)}
                      options={bodyWhyOptions(selectedScene.id)}
                      onAwardPoints={() => awardReasoningPoints(prevBodyWhyAwarded)}
                      onB4Message={setStoryClueB4}
                      onTryAgainSound={playButtonClick}
                      onNextClick={playButtonClick}
                      onNext={() => setScreen('step4')}
                    />
                  </main>
                </AdventureFlowLayout>
              )}

              {screen === 'step4' && selectedScene && (
                <AdventureFlowLayout className="ffl-screen--stack ffl-screen--step4 ffl-flow-layout ffl-mobile-stack">
                  <GameHudPanel
                    className="ffl-zone-hud"
                    b4Message={b4Message}
                    selectedScene={selectedScene}
                    progressPercent={focusFlameProgressPercent('step4')}
                    markSrc={focusFlameMarkSrc}
                    reduceMotion={reduceMotion}
                    feeling={feeling}
                    body={body}
                    move={move}
                  />
                  <main className="ffl-zone-main ffl-zone-main--step ffl-step-main ffl-flow-main">
                    <FocusMoveStep
                      value={move}
                      canProceed={canProceedStep4}
                      onSelect={(opt, isNew) => {
                        confirmStepChoice(isNew);
                        setMove(opt);
                      }}
                      onNextClick={playButtonClick}
                      onNext={() => setScreen('step4Why')}
                    />
                  </main>
                </AdventureFlowLayout>
              )}

              {screen === 'step4Why' && selectedScene && move && (
                <AdventureFlowLayout className="ffl-screen--stack ffl-flow-layout ffl-mobile-stack">
                  <GameHudPanel
                    className="ffl-zone-hud"
                    b4Message={b4Message}
                    selectedScene={selectedScene}
                    progressPercent={focusFlameProgressPercent('step4Why')}
                    markSrc={focusFlameMarkSrc}
                    reduceMotion={reduceMotion}
                    feeling={feeling}
                    body={body}
                    move={move}
                  />
                  <main className="ffl-zone-main ffl-zone-main--step ffl-step-main ffl-flow-main">
                    <ReasoningWhyStep
                      resetKey={`move-why-${move}`}
                      kicker="STORY CLUE"
                      prompt={moveWhyPrompt(move)}
                      options={moveWhyOptions(move)}
                      onAwardPoints={() => awardReasoningPoints(prevMoveWhyAwarded)}
                      onB4Message={setStoryClueB4}
                      onTryAgainSound={playButtonClick}
                      onNextClick={playButtonClick}
                      onNext={() => {
                        setPracticePhase('practice');
                        setScreen('realLifePractice');
                      }}
                    />
                  </main>
                </AdventureFlowLayout>
              )}

              {screen === 'realLifePractice' && selectedScene && move && (
                <AdventureFlowLayout className="ffl-screen--stack ffl-screen--practice ffl-flow-layout ffl-mobile-stack">
                  <GameHudPanel
                    className="ffl-zone-hud"
                    b4Message={b4Message}
                    selectedScene={selectedScene}
                    progressPercent={focusFlameProgressPercent('realLifePractice')}
                    markSrc={focusFlameMarkSrc}
                    reduceMotion={reduceMotion}
                    feeling={feeling}
                    body={body}
                    move={move}
                  />
                  <main className="ffl-zone-main ffl-zone-main--step ffl-step-main ffl-flow-main">
                    <RealLifePractice
                      selectedMove={move}
                      reduceMotion={reduceMotion}
                      onButtonClick={playButtonClick}
                      onAwardPoints={(amount) => {
                        if (practiceAwardedRef.current) return;
                        practiceAwardedRef.current = true;
                        awardFocusPoints(amount);
                      }}
                      onPhaseChange={setPracticePhase}
                      playB4ClipAsync={playB4ClipAsync}
                      stopB4PracticeVoice={stopB4PracticeVoice}
                      playUiConfirm={playUiConfirm}
                      onComplete={() => {
                        stopB4PracticeVoice();
                        playUiConfirm();
                        if (selectedScene) markSceneComplete(selectedScene.id);
                        setScreen('reward');
                      }}
                    />
                  </main>
                </AdventureFlowLayout>
              )}

              {screen === 'reward' && selectedScene && (
                <AdventureFlowLayout className="ffl-screen--reward ffl-mobile-stack">
                  <FocusFlameRewardThreeZone
                    selectedScene={selectedScene}
                    scenes={scenes}
                    completedSceneIds={completedSceneIds}
                    feeling={feeling}
                    body={body}
                    focusPoints={focusPoints}
                    getBookHref={getBookHref}
                    onStartAdventure={startAdventureFromReward}
                    onPlayAgain={resetGameSession}
                    onExitGame={handleExitGame}
                    onPlayButtonClick={playButtonClick}
                    reduceMotion={reduceMotion}
                    markSrc={focusFlameMarkSrc}
                  />
                </AdventureFlowLayout>
              )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {bootDone && !soundGateResolved ? (
          <FocusFlameSoundGate onEnableSound={handleSoundGateEnable} onContinueSilent={handleSoundGateSilent} />
        ) : null}
      </div>
      </div>
    </section>
  );
}

