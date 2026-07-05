import type { B4FocusFlightHudState } from '../phaser/types';

interface GameHudProps {
  hud: B4FocusFlightHudState;
  onPause: () => void;
  onMute: () => void;
  onRestart: () => void;
  onExit: () => void;
  exitLabel?: string;
}

const SpeakerOnIcon = () => (
  <svg className="b4ff-speakerIcon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 9.2h4.1L13.2 5v14l-5.1-4.2H4z" />
    <path d="M16.2 8.2c1.1 1 1.7 2.3 1.7 3.8s-.6 2.8-1.7 3.8" />
    <path d="M18.8 5.8c1.8 1.6 2.8 3.7 2.8 6.2s-1 4.6-2.8 6.2" />
  </svg>
);

const SpeakerMutedIcon = () => (
  <svg className="b4ff-speakerIcon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 9.2h4.1L13.2 5v14l-5.1-4.2H4z" />
    <path d="M16.5 9l4.2 4.2" />
    <path d="M20.7 9l-4.2 4.2" />
  </svg>
);

const GameHud: React.FC<GameHudProps> = ({ hud, onPause, onMute, onRestart, onExit, exitLabel = 'Portal' }) => (
  <div className="b4ff-hud" aria-label="B-4 Focus Flight mission status">
    <div className="b4ff-hudStats">
      <span className="b4ff-stat">
        <strong>{hud.score}</strong>
        <small>Score</small>
      </span>
      <span className="b4ff-stat b4ff-objectiveStat">
        <strong>{hud.sparkCollected} / {hud.sparkGoal}</strong>
        <small>{hud.objectiveText}</small>
      </span>
      <span className="b4ff-stat b4ff-hearts" aria-label={`${hud.hearts} hearts left`}>
        <span className="b4ff-heartRow" aria-hidden="true">
          {Array.from({ length: Math.max(0, hud.hearts) }).map((_, index) => (
            <span className="b4ff-heartIcon" key={index} />
          ))}
        </span>
        <small>Hearts</small>
      </span>
      <span className="b4ff-stat">
        <strong>{hud.combo}x</strong>
        <small>Combo</small>
      </span>
    </div>

    <div className="b4ff-hudActions">
      <button type="button" className="b4ff-iconButton" onClick={onPause} aria-label={hud.paused ? 'Resume mission' : 'Pause mission'}>
        {hud.paused ? '>' : '||'}
      </button>
      <button type="button" className="b4ff-iconButton" onClick={onMute} aria-label={hud.muted ? 'Turn sound on' : 'Mute sound'}>
        {hud.muted ? <SpeakerMutedIcon /> : <SpeakerOnIcon />}
      </button>
      <button type="button" className="b4ff-iconButton" onClick={onRestart} aria-label="Restart mission">
        R
      </button>
      <button type="button" className="b4ff-exitButton" onClick={onExit}>
        {exitLabel}
      </button>
    </div>
  </div>
);

export default GameHud;
