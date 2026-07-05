import type { B4FocusFlightResult } from '../phaser/types';

interface GameResultsProps {
  result: B4FocusFlightResult;
  bestScore: number;
  onPlayAgain: () => void;
  onExit: () => void;
  exitLabel?: string;
}

const flameLabels = {
  spark: 'Spark',
  anchor: 'Anchor',
  ember: 'Ember',
  guardian: 'Guardian',
};

const GameResults: React.FC<GameResultsProps> = ({ result, bestScore, onPlayAgain, onExit, exitLabel = 'Return to Kid Portal' }) => (
  <section className="b4ff-resultsPanel" aria-live="polite">
    <p className="b4ff-kicker">{result.levelName}</p>
    <h2>{result.objectiveComplete ? 'Objective Complete' : 'Try Again'}</h2>
    <p className="b4ff-resultMissionText">{result.missionText}</p>
    <div className="b4ff-stars" aria-label={`${result.stars} stars earned`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          className={index < result.stars ? 'b4ff-starIcon is-earned' : 'b4ff-starIcon'}
          key={index}
        />
      ))}
    </div>

    <div className="b4ff-resultsGrid">
      <div>
        <strong>{result.sparkCollected} / {result.sparkGoal}</strong>
        <small>Spark Flames</small>
      </div>
      <div>
        <strong>{result.score}</strong>
        <small>Total score</small>
      </div>
      <div>
        <strong>{bestScore}</strong>
        <small>Best score</small>
      </div>
      <div>
        <strong>{result.bestCombo}x</strong>
        <small>Best combo</small>
      </div>
    </div>

    <div className="b4ff-flameBreakdown">
      {Object.entries(result.flames).map(([key, count]) => (
        <span key={key}>
          <strong>{count}</strong>
          <small>{flameLabels[key as keyof typeof flameLabels]}</small>
        </span>
      ))}
    </div>

    <div className="b4ff-resultActions">
      <button type="button" className="b4ff-primaryButton" onClick={onPlayAgain}>
        Play Again
      </button>
      <button type="button" className="b4ff-secondaryButton" onClick={onExit}>
        {exitLabel}
      </button>
    </div>
  </section>
);

export default GameResults;
