import { useState } from 'react';
import type { B4FocusFlightResult } from '../phaser/types';
import { getB4Asset, type B4VariantKey } from '../../../data/b4/variantManifest';

interface GameResultsProps {
  result: B4FocusFlightResult;
  bestScore: number;
  onPlayAgain: () => void;
  onExit: () => void;
  exitHref?: string;
  exitLabel?: string;
  variant: B4VariantKey;
}

const flameLabels = {
  spark: 'Spark',
  anchor: 'Anchor',
  ember: 'Ember',
  guardian: 'Guardian',
};

const GameResults: React.FC<GameResultsProps> = ({
  result,
  bestScore,
  onPlayAgain,
  onExit,
  exitHref,
  exitLabel = 'Return to Kid Portal',
  variant,
}) => {
  const [step, setStep] = useState<'celebration' | 'stats'>('celebration');
  const completed = result.objectiveComplete;

  if (step === 'celebration') {
    return (
      <section className="b4ff-resultsPanel b4ff-resultsPanel--celebration" aria-live="polite">
        <img
          className="b4ff-resultsB4"
          src={getB4Asset(variant, completed ? 'happy' : 'idle')}
          alt=""
          aria-hidden="true"
        />
        <p className="b4ff-kicker">{result.levelName}</p>
        <h2>{completed ? 'Level Complete!' : 'Try Again!'}</h2>
        <div className="b4ff-stars" aria-label={`${result.stars} stars earned`}>
          {Array.from({ length: 5 }).map((_, index) => (
            <span
              className={index < result.stars ? 'b4ff-starIcon is-earned' : 'b4ff-starIcon'}
              key={index}
            />
          ))}
        </div>
        <p className="b4ff-resultMissionText">
          {completed
            ? 'Awesome! You collected enough Spark Flames.'
            : 'B-4 still needs more Spark Flames.'}
        </p>
        <div className="b4ff-mainReward">
          <strong>{completed ? '+25' : `${result.sparkCollected} / ${result.sparkGoal}`}</strong>
          <span>Spark Flames</span>
        </div>
        <p className="b4ff-bestScore">Best score: {bestScore}</p>
        <div className="b4ff-resultActions">
          <button type="button" className="b4ff-primaryButton" onClick={() => setStep('stats')}>
            Continue
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="b4ff-resultsPanel b4ff-resultsPanel--stats" aria-live="polite">
      <p className="b4ff-kicker">Mission Stats</p>
      <h2>{completed ? 'Great Flight' : 'Try Again'}</h2>

      <div className="b4ff-flameBreakdown">
        {Object.entries(result.flames).map(([key, count]) => (
          <span key={key}>
            <strong>{count}</strong>
            <small>{flameLabels[key as keyof typeof flameLabels]} collected</small>
          </span>
        ))}
      </div>

      <div className="b4ff-resultsGrid b4ff-resultsGrid--simple">
        <div>
          <strong>{result.score}</strong>
          <small>Total score</small>
        </div>
        <div>
          <strong>{result.bestCombo}x</strong>
          <small>Best combo</small>
        </div>
      </div>

      <div className="b4ff-resultActions">
        <button type="button" className="b4ff-primaryButton" onClick={onPlayAgain}>
          Play Again
        </button>
        {exitHref ? (
          <a className="b4ff-secondaryButton" href={exitHref}>
            {exitLabel}
          </a>
        ) : (
          <button type="button" className="b4ff-secondaryButton" onClick={onExit}>
            {exitLabel}
          </button>
        )}
      </div>
    </section>
  );
};

export default GameResults;
