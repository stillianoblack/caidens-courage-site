import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import StoryTimeline from '../components/story-mode/StoryTimeline';
import StoryReader from '../components/story-mode/StoryReader';
import DialogueCard from '../components/story-mode/DialogueCard';
import ChoiceCard from '../components/story-mode/ChoiceCard';
import ChapterCompleteScreen from '../components/story-mode/ChapterCompleteScreen';
import StoryNarratorCard from '../components/story-mode/StoryNarratorCard';
import {
  completeStoryChapter,
  readStoryProgress,
  saveStoryChoice,
  unlockStoryChapter,
  type StoryProgress,
} from '../components/story-mode/storyProgress';
import '../components/story-mode/story-mode.css';
import {
  getNextStoryChapter,
  getStoryChapterById,
  getStoryChapterIndex,
  STORY_CHAPTERS,
} from '../data/storyMode';
import { CAIDEN_QUEST_HUB_PATH, STORY_MODE_PATH } from '../config/courageRoutes';

type StoryStep = 'detail' | 'reader' | 'dialogue' | 'choice' | 'mission' | 'complete';

function buildChapterPath(chapterId: string, search = ''): string {
  return `${STORY_MODE_PATH}/${chapterId}${search}`;
}

function getStepFromSearch(search: string): StoryStep {
  const step = new URLSearchParams(search).get('step');
  if (
    step === 'reader' ||
    step === 'dialogue' ||
    step === 'choice' ||
    step === 'mission' ||
    step === 'complete'
  ) {
    return step;
  }
  return 'detail';
}

export default function StoryModePage() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [progress, setProgress] = useState<StoryProgress>(() => readStoryProgress());
  const [readerIndex, setReaderIndex] = useState(0);
  const [dialogueIndex, setDialogueIndex] = useState(0);

  const chapter = getStoryChapterById(chapterId);
  const step = getStepFromSearch(location.search);
  const selectedChoice = chapter?.choice ? progress.choices[chapter.choice.id] : undefined;
  const nextChapter = getNextStoryChapter(chapter?.id);

  const lastUnlockedChapter = useMemo(
    () => getStoryChapterById(progress.lastUnlockedChapterId) ?? STORY_CHAPTERS[0],
    [progress.lastUnlockedChapterId],
  );

  useEffect(() => {
    document.title = "Story Mode | Caiden's Courage";
  }, []);

  useEffect(() => {
    setProgress(readStoryProgress());
    setReaderIndex(0);
    setDialogueIndex(0);
  }, [chapterId]);

  if (!chapterId) {
    const continueHref = lastUnlockedChapter
      ? buildChapterPath(lastUnlockedChapter.id, '?step=detail')
      : STORY_MODE_PATH;

    return (
      <main className="storyModePage">
        <div className="storyModeShell">
          <header className="storyModeHero">
            <div>
              <span>Story Mode</span>
              <h1>Caiden's Courage Campaign</h1>
              <p>
                Step into Caiden's world, follow each scene, and begin the mission when
                the Focus Flame is ready.
              </p>
            </div>
            <StoryNarratorCard message="I will guide the journey. Watch the scene, listen for the focus clue, then choose the next brave step." />
            <Link to={continueHref}>Continue Journey</Link>
          </header>
          <StoryTimeline
            chapters={STORY_CHAPTERS}
            progress={progress}
            buildChapterHref={(id) => buildChapterPath(id)}
          />
        </div>
      </main>
    );
  }

  if (!chapter) {
    return <Navigate to={STORY_MODE_PATH} replace />;
  }

  const chapterIndex = getStoryChapterIndex(chapter.id);
  const unlockedIndex = getStoryChapterIndex(progress.lastUnlockedChapterId);

  if (chapterIndex > unlockedIndex) {
    return <Navigate to={STORY_MODE_PATH} replace />;
  }

  const goToStep = (nextStep: StoryStep) => {
    navigate(`${buildChapterPath(chapter.id)}?step=${nextStep}`);
  };

  const handleReaderContinue = () => {
    if (readerIndex < chapter.comicPanels.length - 1) {
      setReaderIndex((current) => current + 1);
      return;
    }
    goToStep('dialogue');
  };

  const handleDialogueContinue = () => {
    if (dialogueIndex < chapter.dialogue.length - 1) {
      setDialogueIndex((current) => current + 1);
      return;
    }
    goToStep('choice');
  };

  const handleChoiceSelect = (option: string) => {
    setProgress((current) => saveStoryChoice(current, chapter.choice.id, option));
  };

  const handleComplete = () => {
    const completed = completeStoryChapter(progress, chapter.id, nextChapter?.id);
    const unlocked = nextChapter ? unlockStoryChapter(completed, nextChapter.id) : completed;
    setProgress(unlocked);
    goToStep('complete');
  };

  const missionHref = `${CAIDEN_QUEST_HUB_PATH}/${chapter.missionId}`;

  return (
    <main className="storyModePage">
      <div className="storyModeShell">
        <header className="storyModeHero">
          <div>
            <span>Chapter {chapterIndex + 1}</span>
            <h1>{chapter.title}</h1>
            <p>{chapter.description}</p>
          </div>
          <Link to={STORY_MODE_PATH}>Timeline</Link>
        </header>

        {step === 'detail' ? (
          <div className="storyModeStage">
            <StoryNarratorCard message="Welcome back, hero. This chapter opens a new Focus Flame path. Look for what matters first." />
            <section className="storyChapterDetail">
              <img src={chapter.coverImage} alt="" />
              <div>
                <h1>{chapter.title}</h1>
                <p>{chapter.description}</p>
                <div className="storyChapterDetail__actions">
                  <Link to={`${buildChapterPath(chapter.id)}?step=reader`}>Enter Scene</Link>
                  <Link to={STORY_MODE_PATH}>Back to Timeline</Link>
                </div>
              </div>
            </section>
          </div>
        ) : null}

        {step === 'reader' ? (
          <div className="storyModeStage">
            <StoryNarratorCard message="Read the scene like a clue map. The right next step is hiding in what Caiden notices." />
            <StoryReader
              panel={chapter.comicPanels[readerIndex] ?? chapter.comicPanels[0]}
              currentStep={readerIndex + 1}
              totalSteps={chapter.comicPanels.length}
              onContinue={handleReaderContinue}
            />
          </div>
        ) : null}

        {step === 'dialogue' ? (
          <div className="storyModeStage">
            <StoryNarratorCard message="Character signals can point to feelings, plans, and brave choices. Listen for the focus clue." />
            <DialogueCard
              line={chapter.dialogue[dialogueIndex] ?? chapter.dialogue[0]}
              onContinue={handleDialogueContinue}
            />
          </div>
        ) : null}

        {step === 'choice' ? (
          <div className="storyModeStage">
            <StoryNarratorCard message="Focus Flame prompt: choose the option that helps Caiden take the next brave step." />
            <ChoiceCard
              choice={chapter.choice}
              selectedOption={selectedChoice}
              onSelect={handleChoiceSelect}
              onContinue={() => goToStep('mission')}
            />
          </div>
        ) : null}

        {step === 'mission' ? (
          <div className="storyModeStage">
            <StoryNarratorCard message="It's your turn now. Carry the Focus Flame into the mission." />
            <section className="storyMissionGate">
              <span>Mission Ready</span>
              <h2>{chapter.title}</h2>
              <p>
                The scene opens into Caiden's existing quest flow. Complete the mission,
                then return here to close the chapter and unlock the next path.
              </p>
              <div className="storyMissionGate__meta">
                <div>
                  <strong>Mission</strong>
                  {chapter.missionId}
                </div>
                <div>
                  <strong>Reflection</strong>
                  {chapter.reflectionId}
                </div>
                <div>
                  <strong>Reward</strong>
                  {chapter.rewardId}
                </div>
              </div>
              <div className="storyMissionGate__actions">
                <Link to={missionHref}>Begin Mission</Link>
                <button type="button" onClick={handleComplete}>
                  Mark Chapter Complete
                </button>
              </div>
            </section>
          </div>
        ) : null}

        {step === 'complete' ? (
          <div className="storyModeStage">
            <StoryNarratorCard message="Nice work. The next chapter glows brighter because you kept moving." />
            <ChapterCompleteScreen
              chapter={chapter}
              timelineHref={STORY_MODE_PATH}
              nextChapterHref={nextChapter ? buildChapterPath(nextChapter.id) : undefined}
            />
          </div>
        ) : null}
      </div>
    </main>
  );
}
