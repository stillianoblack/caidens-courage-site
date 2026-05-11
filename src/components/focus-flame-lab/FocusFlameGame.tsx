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
import { useFocusFlameAudio, type FocusFlameB4VoiceKey } from '../../hooks/useFocusFlameAudio';

/** Degrees for selection burst sparks (10 particles, within 8–12). */
const CHOICE_BURST_DEGREES = Array.from({ length: 10 }, (_, i) => (360 * i) / 10);

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
  intro: string;
  cardImageSrc: string;
  cardImageAlt: string;
  featured?: boolean;
  cardBadgeTone: 'blue' | 'gold' | 'violet';
};

type Feeling = 'Nervous' | 'Excited' | 'Embarrassed' | 'Angry';
type BodySignal = 'Head' | 'Chest' | 'Hands' | 'Stomach';
type Move = 'Spark Breath' | 'Anchor Step' | 'B-4 Pause' | 'Flame Draw' | 'Brave Choice';

type Screen = 'entry' | 'sceneSelect' | 'step1' | 'step2' | 'step3' | 'step4' | 'reward';

function b4VoiceKeyForScreen(
  screen: Screen,
  selectedScene: FocusFlameScene | null,
  showEntryScreen: boolean
): FocusFlameB4VoiceKey | null {
  if (showEntryScreen && screen === 'entry') return 'intro-welcome';
  if (screen === 'sceneSelect') return 'intro-welcome';
  if (screen === 'step1' && selectedScene) {
    if (selectedScene.id === 'move') return 'scene-move';
    if (selectedScene.id === 'ceremony') return 'scene-ceremony';
    if (selectedScene.id === 'cave') return 'scene-cave';
  }
  if (screen === 'step2') return 'feeling-prompt';
  if (screen === 'step3') return 'body-prompt';
  if (screen === 'step4') return 'focus-move-prompt';
  if (screen === 'reward') return 'reward';
  return null;
}

/** Deterministic Focus Flame fill for adventure flow (intro → reward). */
function focusFlameProgressPercent(screen: Screen): number {
  if (screen === 'step1') return 15;
  if (screen === 'step2') return 30;
  if (screen === 'step3') return 60;
  if (screen === 'step4') return 85;
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

function ChoiceButton({
  label,
  selected,
  onClick,
  soundOnClick,
}: {
  label: string;
  selected?: boolean;
  onClick: () => void;
  soundOnClick?: () => void;
}) {
  const [burstKey, setBurstKey] = useState<number | null>(null);
  const [selectPulse, setSelectPulse] = useState(false);

  useEffect(() => {
    if (burstKey == null) return;
    const t = window.setTimeout(() => setBurstKey(null), 460);
    return () => window.clearTimeout(t);
  }, [burstKey]);

  const handleClick = () => {
    soundOnClick?.();
    onClick();
    setBurstKey((k) => (k == null ? 1 : k + 1));
    setSelectPulse(true);
  };

  return (
    <button
      type="button"
      className={['ffl-choice', selected ? 'ffl-choice--selected' : '', selectPulse ? 'ffl-choice--selectPulse' : '']
        .filter(Boolean)
        .join(' ')}
      onClick={handleClick}
      onAnimationEnd={(e) => {
        if (e.animationName === 'fflChoiceSelectPop') setSelectPulse(false);
      }}
    >
      {burstKey != null ? (
        <span className="ffl-choiceBurstRoot" key={burstKey} aria-hidden="true">
          {CHOICE_BURST_DEGREES.map((deg, i) => (
            <span
              key={`${burstKey}-${i}`}
              className="ffl-choiceBurstSpark"
              style={
                {
                  '--ffl-burst-deg': `${deg}deg`,
                  '--ffl-burst-delay': `${i * 22}ms`,
                } as React.CSSProperties
              }
            />
          ))}
        </span>
      ) : null}
      <span className="ffl-choiceLabel">{label}</span>
      <span className="ffl-choiceChevron" aria-hidden="true">
        →
      </span>
    </button>
  );
}

/** Scene select: entire card is one button (image + copy + visual Begin pill). */
function SceneSelectMissionRow({
  scene,
  onBegin,
  onCardHover,
  onCardSelect,
}: {
  scene: FocusFlameScene;
  onBegin: () => void;
  onCardHover: () => void;
  onCardSelect: () => void;
}) {
  const featured = Boolean(scene.featured);
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
      className={`ffl-sceneRow${featured ? ' ffl-sceneRow--featured' : ''}`}
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse') onCardHover();
      }}
      onClick={() => {
        onCardSelect();
        onBegin();
      }}
      aria-label={`Begin ${scene.title}`}
    >
      <span className="ffl-sceneRowMedia">
        <img
          className={`ffl-sceneRowImg${imgPosClass ? ` ${imgPosClass}` : ''}`}
          src={scene.cardImageSrc}
          alt=""
          loading="lazy"
          decoding="async"
        />
      </span>
      <span className="ffl-sceneRowText">
        <span className="ffl-sceneRowTitle">{scene.title}</span>
        <span className="ffl-sceneRowBlurb">{scene.blurb}</span>
      </span>
      <span className="ffl-sceneRowBegin ffl-sceneRowBegin--pill" aria-hidden="true">
        Begin
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
  const [move, setMove] = useState<Move | null>(null);
  const [soundGateResolved, setSoundGateResolved] = useState(false);
  /** After “Enable Sound”, skip one auto narration pass so intro is not played twice. */
  const skipNextB4ScreenVoiceRef = useRef(false);

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
      return () => {};
    }
    stopB4Voice();
    const key = b4VoiceKeyForScreen(screen, selectedScene, SHOW_ENTRY_SCREEN);
    if (!key) return;
    const t = window.setTimeout(() => {
      playB4Voice(key);
    }, 320);
    return () => {
      window.clearTimeout(t);
      stopB4Voice();
    };
  }, [bootDone, soundGateResolved, voiceEnabled, screen, selectedScene, playB4Voice, stopB4Voice]);

  const resetRun = useCallback(() => {
    playButtonClick();
    setSelectedScene(null);
    setFeeling(null);
    setBody(null);
    setMove(null);
    setScreen('sceneSelect');
  }, [playButtonClick]);

  const startScene = (s: FocusFlameScene) => {
    setSelectedScene(s);
    setFeeling(null);
    setBody(null);
    setMove(null);
    setScreen('step1');
  };

  const goBack = () => {
    if (!bootDone || !soundGateResolved) return;
    playButtonClick();
    if (screen === 'sceneSelect') {
      navigate('/');
      return;
    }
    if (screen === 'step1') return setScreen('sceneSelect');
    if (screen === 'step2') return setScreen('step1');
    if (screen === 'step3') return setScreen('step2');
    if (screen === 'step4') return setScreen('step3');
    if (screen === 'reward') return setScreen('step4');
  };

  const getSceneIntroImageSrc = (scene: FocusFlameScene) => {
    const publicUrl = process.env.PUBLIC_URL || '';
    if (scene.id === 'move') return `${publicUrl}/images/focus-flame-lab/thepath.webp`;
    if (scene.id === 'ceremony') return `${publicUrl}/images/focus-flame-lab/themove_intro_image.webp`;
    return scene.cardImageSrc;
  };

  const b4Message =
    screen === 'sceneSelect'
      ? 'Pick a moment from Caiden’s story. I’ll help you steady the Focus Flame one step at a time.'
      : screen === 'reward'
        ? 'You did it. Want to try another moment?'
        : 'Choose what feels true right now. We’ll steady the Focus Flame step by step.';

  const canProceedStep2 = screen === 'step2' && feeling != null;
  const canProceedStep3 = screen === 'step3' && body != null;
  const canProceedStep4 = screen === 'step4' && move != null;

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
                            playButtonClick();
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
                  onClick={() => {
                    playButtonClick();
                  }}
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
                    <div className="ffl-sceneSelectTitleBlock ffl-scene-select-header">
                      <h2 className="ffl-sceneSelectTitle">Where should Caiden go?</h2>
                      <p className="ffl-sceneSelectSubtitle">CHOOSE YOUR ADVENTURE.</p>
                    </div>
                    <div className="ffl-sceneSelectStack ffl-sceneCardList">
                      {scenes.map((s) => (
                        <SceneSelectMissionRow
                          key={s.id}
                          scene={s}
                          onBegin={() => startScene(s)}
                          onCardHover={playCardHover}
                          onCardSelect={playCardSelect}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {screen === 'step1' && selectedScene && (
                <AdventureFlowLayout className="ffl-screen--stack ffl-flow-layout ffl-mobile-stack">
                  <GameHudPanel
                    className="ffl-zone-hud"
                    b4Message={b4Message}
                    selectedScene={selectedScene}
                    progressPercent={focusFlameProgressPercent('step1')}
                    markSrc={focusFlameMarkSrc}
                    reduceMotion={reduceMotion}
                    feeling={feeling}
                    body={body}
                    move={move}
                  />
                  <main className="ffl-zone-main ffl-zone-main--step ffl-step-main ffl-flow-main">
                          <div className="ffl-comicFrame">
                            <div className="ffl-comicHeader">
                              <div className="ffl-comicTag">SCENE INTRO</div>
                              <div className="ffl-comicTitle">{selectedScene.title}</div>
                            </div>
                            <div className="ffl-comicMedia" aria-hidden="true">
                              <img
                                className="ffl-comicImg"
                                src={getSceneIntroImageSrc(selectedScene)}
                                alt=""
                                loading="lazy"
                                decoding="async"
                              />
                            </div>
                            <div className="ffl-comicBody">{selectedScene.intro}</div>
                            <div className="ffl-comicAction">
                              <button
                                type="button"
                                className="ffl-ctaPrimary"
                                onClick={() => {
                                  playButtonClick();
                                  setScreen('step2');
                                }}
                              >
                                Help Caiden
                              </button>
                            </div>
                          </div>
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
                          <div className="ffl-questionHeader ffl-step-header">
                            <div className="ffl-kicker">STEP 1 OF 3</div>
                            <h2 className="ffl-h2">What is Caiden feeling?</h2>
                          </div>

                          <div className="ffl-choiceList" role="group" aria-label="Feeling choices">
                            {(['Nervous', 'Excited', 'Embarrassed', 'Angry'] as Feeling[]).map((opt) => (
                              <ChoiceButton
                                key={opt}
                                label={opt}
                                selected={feeling === opt}
                                soundOnClick={playButtonClick}
                                onClick={() => setFeeling(opt)}
                              />
                            ))}
                          </div>

                          <div className="ffl-stepActions">
                            <button
                              type="button"
                              className="ffl-ctaPrimary ffl-ctaPrimary--small"
                              onClick={() => {
                                playButtonClick();
                                setScreen('step3');
                              }}
                              disabled={!canProceedStep2}
                            >
                              Next
                            </button>
                          </div>
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
                          <div className="ffl-questionHeader ffl-step-header">
                            <div className="ffl-kicker">STEP 2 OF 3</div>
                            <h2 className="ffl-h2">Where does Caiden feel it?</h2>
                          </div>

                          <div className="ffl-choiceList" role="group" aria-label="Body signal choices">
                            {(['Head', 'Chest', 'Hands', 'Stomach'] as BodySignal[]).map((opt) => (
                              <ChoiceButton
                                key={opt}
                                label={opt}
                                selected={body === opt}
                                soundOnClick={playButtonClick}
                                onClick={() => setBody(opt)}
                              />
                            ))}
                          </div>

                          <div className="ffl-stepActions">
                            <button
                              type="button"
                              className="ffl-ctaPrimary ffl-ctaPrimary--small"
                              onClick={() => {
                                playButtonClick();
                                setScreen('step4');
                              }}
                              disabled={!canProceedStep3}
                            >
                              Next
                            </button>
                          </div>
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
                          <div className="ffl-questionHeader ffl-step-header">
                            <div className="ffl-kicker">STEP 3 OF 3</div>
                            <h2 className="ffl-h2">Which Focus Flame move should he try?</h2>
                          </div>

                          <div className="ffl-choiceList" role="group" aria-label="Focus Flame move choices">
                            {(
                              [
                                'Spark Breath — slow breathing',
                                'Anchor Step — grounding',
                                'B-4 Pause — stop before reacting',
                                'Flame Draw — express the feeling through art',
                                'Brave Choice — ask for help',
                              ] as const
                            ).map((label) => {
                              const base = label.split(' — ')[0] as Move;
                              return (
                                <ChoiceButton
                                  key={label}
                                  label={label}
                                  selected={move === base}
                                  soundOnClick={playButtonClick}
                                  onClick={() => setMove(base)}
                                />
                              );
                            })}
                          </div>

                          <div className="ffl-stepActions">
                            <button
                              type="button"
                              className="ffl-ctaPrimary ffl-ctaPrimary--small"
                              onClick={() => {
                                playButtonClick();
                                setScreen('reward');
                              }}
                              disabled={!canProceedStep4}
                            >
                              Stabilize Flame
                            </button>
                          </div>
                  </main>
                </AdventureFlowLayout>
              )}

              {screen === 'reward' && selectedScene && (
                <AdventureFlowLayout className="ffl-screen--reward ffl-mobile-stack">
                  <FocusFlameRewardThreeZone
                    selectedScene={selectedScene}
                    scenes={scenes}
                    feeling={feeling}
                    body={body}
                    getBookHref={getBookHref}
                    onTryNewScene={resetRun}
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

