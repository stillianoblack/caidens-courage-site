import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import ChapterCompleteScreen from '../components/story-mode/ChapterCompleteScreen';
import StoryQuestionCard from '../components/story-mode/StoryQuestionCard';
import {
  completeStoryChapter,
  readStoryProgress,
  saveStoryQuestionResponse,
  unlockStoryChapter,
  type StoryProgress,
} from '../components/story-mode/storyProgress';
import '../components/story-mode/story-mode.css';
import {
  DRAGONS_NEST_CAMPAIGN,
  getNextStoryChapter,
  getQuestionVariant,
  getStoryChapterById,
  getStoryChapterIndex,
  getStoryQuestionsForChapter,
  resolveStoryQuestGradeBand,
  STORY_CHAPTERS,
} from '../data/storyMode';
import { STORY_MODE_PATH } from '../config/courageRoutes';
import { useActiveParticipant } from '../hooks/useActiveParticipant';
import { useKidPlaySession } from '../context/KidPlaySessionContext';
import { getKidPlayShellRoute, parseKidPlayShellPath } from '../lib/kidPlayShellRoutes';

type StoryModePageProps = {
  storyBasePathOverride?: string;
};

const QUESTIONS_PER_CHAPTER = 5;

// Story Quest intentionally routes directly from chapter entry to questions.
export default function StoryModePage({ storyBasePathOverride }: StoryModePageProps = {}) {
  const { chapterId } = useParams<{ chapterId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const kidSession = useKidPlaySession();
  const activeParticipant = useActiveParticipant();
  const shellContext = parseKidPlayShellPath(location.pathname);
  const storyBasePath = storyBasePathOverride ?? (shellContext
    ? `${getKidPlayShellRoute(shellContext.sessionId, 'arcade')}/story`
    : STORY_MODE_PATH);
  const arcadePath = storyBasePath.endsWith('/story') ? storyBasePath.slice(0, -6) : '/kids/games';
  const participantId = activeParticipant.participantId || kidSession?.session.child_id || '';
  const isPreview = Boolean(storyBasePathOverride);
  const progressScope = participantId || kidSession?.sessionId || 'guest';
  const rosterGrade = activeParticipant.roster.find((entry) => entry.participantId === participantId)?.gradeLevel;
  const sessionGrade = String(kidSession?.session.resume_payload?.participant_grade_level ?? '').trim();
  const gradeBand = resolveStoryQuestGradeBand(rosterGrade || sessionGrade || null);
  const [progress, setProgress] = useState<StoryProgress>(() => readStoryProgress(progressScope));
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'hint' | null>(null);
  const [complete, setComplete] = useState(false);
  const [chaptersOpen, setChaptersOpen] = useState(false);
  const [runCorrectQuestionIds, setRunCorrectQuestionIds] = useState<Set<string>>(() => new Set());

  const chapter = getStoryChapterById(chapterId);
  const questions = useMemo(() => {
    if (!chapter) return [];
    const chapterQuestions = getStoryQuestionsForChapter(chapter.id);
    return isPreview
      ? chapterQuestions
      : chapterQuestions.filter((question) => question.contentStatus === 'playable');
  }, [chapter, isPreview]);
  const currentQuestion = questions[questionIndex];
  const storedVariant = currentQuestion ? getQuestionVariant(currentQuestion, gradeBand) : null;
  const currentVariant = currentQuestion?.contentStatus === 'needs_canon_detail' && isPreview
    ? {
      prompt: storedVariant?.prompt ?? 'Story question',
      answers: ['Preview selection A', 'Preview selection B', 'Preview selection C', 'Preview selection D'],
      correctAnswer: 'Preview selection A',
      hint: 'Preview access: choose another selection to test the retry state.',
      b4Feedback: 'Preview access: this question slot and progression are working. Final story answers still need canon approval.',
    }
    : storedVariant;
  const nextChapter = getNextStoryChapter(chapter?.id);
  const nextChapterHasQuestions = nextChapter
    ? getStoryQuestionsForChapter(nextChapter.id).some((question) => question.contentStatus === 'playable')
    : false;
  const firstPlayableChapter = STORY_CHAPTERS.find((item) =>
    getStoryQuestionsForChapter(item.id).some((question) => question.contentStatus === 'playable')) ?? STORY_CHAPTERS[0];
  const currentPlayableChapter = getStoryChapterById(progress.lastUnlockedChapterId)
    && getStoryQuestionsForChapter(progress.lastUnlockedChapterId).some((question) => question.contentStatus === 'playable')
    ? getStoryChapterById(progress.lastUnlockedChapterId)!
    : firstPlayableChapter;

  useEffect(() => { document.title = "The Dragon's Nest Story Quest | Caiden's Courage"; }, []);
  useEffect(() => {
    setProgress(readStoryProgress(progressScope));
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setAttempts(0);
    setFeedback(null);
    setComplete(false);
    setChaptersOpen(false);
    setRunCorrectQuestionIds(new Set());
  }, [chapterId, progressScope]);

  const buildChapterPath = (id: string) => `${storyBasePath}/${id}`;

  if (!chapterId) return <Navigate to={buildChapterPath(currentPlayableChapter.id)} replace />;
  if (!chapter) return <Navigate to={buildChapterPath(firstPlayableChapter.id)} replace />;

  const chapterIndex = getStoryChapterIndex(chapter.id);
  const unlockedIndex = getStoryChapterIndex(progress.lastUnlockedChapterId);
  if (!isPreview && chapterIndex > unlockedIndex) return <Navigate to={storyBasePath} replace />;
  if (questions.length === 0) return <Navigate to={buildChapterPath(firstPlayableChapter.id)} replace />;

  const resetQuestionFeedback = () => {
    setSelectedAnswer(null);
    setAttempts(0);
    setFeedback(null);
  };

  const handleAnswer = (answer: string) => {
    if (!currentQuestion || !currentVariant || feedback === 'correct') return;
    const nextAttempts = attempts + 1;
    const correct = answer === currentVariant.correctAnswer;
    setSelectedAnswer(answer);
    setAttempts(nextAttempts);
    setFeedback(correct ? 'correct' : 'hint');
    const updated = saveStoryQuestionResponse(progress, {
      questionId: currentQuestion.id,
      chapterId: chapter.id,
      category: currentQuestion.category,
      gradeBand,
      selectedAnswer: answer,
      correct,
      attempts: nextAttempts,
      answeredAt: new Date().toISOString(),
    }, correct, progressScope);
    setProgress(updated);
    if (correct) {
      setRunCorrectQuestionIds((current) => {
        const next = new Set(current);
        next.add(currentQuestion.id);
        return next;
      });
    }
    kidSession?.touchResume({
      storyQuest: {
        campaignId: DRAGONS_NEST_CAMPAIGN.id,
        chapterId: chapter.id,
        questionId: currentQuestion.id,
        correct,
        attempts: nextAttempts,
      },
    });
  };

  const finishChapter = () => {
    const nextPlayableChapterId = nextChapter && nextChapterHasQuestions ? nextChapter.id : undefined;
    const completed = completeStoryChapter(progress, chapter.id, nextPlayableChapterId, progressScope);
    const unlocked = nextPlayableChapterId
      ? unlockStoryChapter(completed, nextPlayableChapterId, progressScope)
      : completed;
    setProgress(unlocked);
    setComplete(true);
    kidSession?.touchResume({
      storyQuestCompletion: {
        campaignId: DRAGONS_NEST_CAMPAIGN.id,
        chapterId: chapter.id,
        totalCorrect: runCorrectQuestionIds.size,
        totalQuestions: questions.length,
        completedAt: new Date().toISOString(),
      },
    });
  };

  const handleQuestionContinue = () => {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((value) => value + 1);
      resetQuestionFeedback();
      return;
    }
    if (questions.length === QUESTIONS_PER_CHAPTER) {
      finishChapter();
      return;
    }
    navigate(arcadePath);
  };

  const correctCount = runCorrectQuestionIds.size;
  const sparks = runCorrectQuestionIds.size;

  return (
    <main className="storyModePage storyModePage--game">
      <div className="storyModeShell storyModeShell--game">
        <header className="storyModeHero storyModeHero--compact">
          <div>
            <span>Chapter {chapterIndex + 1}</span>
            <h1>{chapter.title}</h1>
          </div>
          <div className="storyModeHero__actions">
            <Link to={arcadePath}>Back to Arcade</Link>
            <button type="button" onClick={() => setChaptersOpen(true)}>Chapters</button>
          </div>
        </header>

        {chaptersOpen ? (
          <div className="storyChapterSelector" role="dialog" aria-modal="true" aria-labelledby="story-chapters-title">
            <button className="storyChapterSelector__backdrop" type="button" aria-label="Close chapters" onClick={() => setChaptersOpen(false)} />
            <section className="storyChapterSelector__panel">
              <header>
                <div><span>{isPreview ? 'Preview access' : 'Story Quest'}</span><h2 id="story-chapters-title">Story Chapters</h2></div>
                <button type="button" aria-label="Close chapters" onClick={() => setChaptersOpen(false)}>×</button>
              </header>
              <ol>
                {STORY_CHAPTERS.map((storyChapter, index) => {
                  const completed = progress.completedChapterIds.includes(storyChapter.id);
                  const current = storyChapter.id === progress.lastUnlockedChapterId;
                  const locked = !completed && !current && index > unlockedIndex;
                  const status = completed ? 'Complete' : current ? 'Current' : 'Locked';
                  const canOpen = isPreview || completed || current || !locked;
                  return (
                    <li key={storyChapter.id}>
                      {canOpen ? (
                        <Link to={buildChapterPath(storyChapter.id)} onClick={() => setChaptersOpen(false)}>
                          <span>{String(index + 1).padStart(2, '0')}</span>
                          <strong>{storyChapter.title}</strong>
                          <small>{status}</small>
                        </Link>
                      ) : (
                        <div aria-disabled="true">
                          <span>{String(index + 1).padStart(2, '0')}</span>
                          <strong>{storyChapter.title}</strong>
                          <small>{status}</small>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </section>
          </div>
        ) : null}

        {complete ? (
          <ChapterCompleteScreen
            chapter={chapter}
            nextChapterHref={nextChapter && nextChapterHasQuestions
              ? buildChapterPath(nextChapter.id)
              : undefined}
            arcadeHref={arcadePath}
            chapterNumber={chapterIndex + 1}
            correctCount={correctCount}
            totalQuestions={QUESTIONS_PER_CHAPTER}
            message={chapter.id === 'chapter-2'
              ? 'Nice work. You remembered how Caiden kept moving even when he wasn’t sure what was waiting for him.'
              : undefined}
          />
        ) : currentQuestion && currentVariant ? (
          <section className="storyQuestionGame" aria-label={`Question ${questionIndex + 1} of ${QUESTIONS_PER_CHAPTER}`}>
            <div className="storyQuestionGame__companion" aria-hidden="true">
              <img src="/images/Choose-Your-Guide/B-4student-hover.webp" alt="" />
            </div>
            <div className="storyQuestionGame__content">
              <StoryQuestionCard
                question={currentQuestion}
                variant={currentVariant}
                questionNumber={questionIndex + 1}
                selectedAnswer={selectedAnswer}
                attempts={attempts}
                feedback={feedback}
                sparkCount={sparks}
                totalSparks={QUESTIONS_PER_CHAPTER}
                onSelect={handleAnswer}
                onContinue={handleQuestionContinue}
                continueLabel={questionIndex === questions.length - 1
                  ? questions.length === QUESTIONS_PER_CHAPTER ? 'Complete Chapter' : 'Back to Arcade'
                  : 'Next Question'}
              />
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
