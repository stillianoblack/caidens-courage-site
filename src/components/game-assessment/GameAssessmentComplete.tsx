import React from 'react';
import type { GameAssessmentComplete as CompleteConfig, GameScoreMessage } from '../../types/gameAssessment';
import MirandaAvatar from '../miranda/MirandaAvatar';
import MirandaNavButton from '../miranda/MirandaNavButton';
import { MIRANDA_RETURN_HUB_LABEL } from '../../data/miranda/progression';

type GameAssessmentCompleteProps = {
  config: CompleteConfig;
  score: number;
  total: number;
  onPlayAgain: () => void;
  onExit: () => void;
  avatarSrc?: string;
  avatarAlt?: string;
  showMirandaAvatar?: boolean;
  showCaidenAvatar?: boolean;
  showVictoriaAvatar?: boolean;
  hubPath?: string;
  nextCasePath?: string | null;
  nextCaseLabel?: string | null;
  familyPortalPath?: string;
  familyPortalLabel?: string;
  continueLabel?: string;
  scoreLabel?: string;
  exitLabel?: string;
  onNavClick?: () => void;
};

function resolveScoreMessage(config: CompleteConfig, score: number): string {
  if (config.scoreMessages?.length) {
    const match = config.scoreMessages.find((entry: GameScoreMessage) => score >= entry.min && score <= entry.max);
    if (match) return match.message;
  }
  return config.message;
}

export default function GameAssessmentComplete({
  config,
  score,
  total,
  onPlayAgain,
  onExit,
  avatarSrc,
  avatarAlt,
  showMirandaAvatar = false,
  showCaidenAvatar = false,
  showVictoriaAvatar = false,
  hubPath,
  nextCasePath,
  nextCaseLabel,
  familyPortalPath,
  familyPortalLabel = 'Return to Family Portal',
  continueLabel = 'Continue Journey',
  scoreLabel = 'clues',
  exitLabel = 'Return to Training',
  onNavClick,
}: GameAssessmentCompleteProps) {
  const isMirandaProgression = showMirandaAvatar && hubPath;
  const isCaidenProgression = showCaidenAvatar && hubPath;
  const isVictoriaProgression = showVictoriaAvatar && hubPath;
  const hasNextCase = Boolean(nextCasePath && nextCaseLabel);

  const panelClass = [
    'bbc-resultPanel',
    'bbc-resultPanel--detailed',
    'game-complete',
    isCaidenProgression ? 'game-complete--caiden' : '',
    isVictoriaProgression ? 'game-complete--victoria' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={panelClass}>
      {showMirandaAvatar ? (
        <MirandaAvatar variant="complete" src={avatarSrc} alt={avatarAlt} />
      ) : null}

      {isCaidenProgression ? (
        <div className="caiden-completeHero">
          {avatarSrc ? (
            <img src={avatarSrc} alt={avatarAlt ?? 'Caiden'} className="caiden-completeAvatar" />
          ) : null}
          <div className="caiden-completeFlame" aria-hidden="true">
            🔥
          </div>
        </div>
      ) : null}

      {isVictoriaProgression ? (
        <div className="victoria-completeHero">
          {avatarSrc ? (
            <img src={avatarSrc} alt={avatarAlt ?? 'Dr. Victoria'} className="victoria-completeAvatar" />
          ) : null}
        </div>
      ) : null}

      {!isCaidenProgression && !isVictoriaProgression ? (
        <div className="game-completeBadge" aria-hidden="true">
          🔍
        </div>
      ) : null}

      <h2 className="bbc-title">{config.title}</h2>
      <p className="bbc-body">{resolveScoreMessage(config, score)}</p>

      <p
        className={`game-completeScore${isCaidenProgression ? ' game-completeScore--caiden' : ''}${
          isVictoriaProgression ? ' game-completeScore--victoria' : ''
        }`}
      >
        You completed <strong>{score}</strong> of <strong>{total}</strong> {scoreLabel}.
      </p>

      <div
        className={`game-badgeRow${isCaidenProgression ? ' game-badgeRow--caiden' : ''}${
          isVictoriaProgression ? ' game-badgeRow--victoria' : ''
        }`}
        role="list"
        aria-label="Rewards earned"
      >
        {config.badges.map((badge) => (
          <span
            key={badge}
            className={
              isCaidenProgression ? 'caiden-rewardPill' : isVictoriaProgression ? 'victoria-rewardPill' : 'game-badge'
            }
            role="listitem"
          >
            ✦ {badge}
          </span>
        ))}
      </div>

      <div
        className={`bbc-resultActions${
          isMirandaProgression || isCaidenProgression || isVictoriaProgression ? ' miranda-completeActions' : ''
        }`}
      >
        {isMirandaProgression ? (
          <>
            {hasNextCase ? (
              <MirandaNavButton
                to={nextCasePath!}
                label={nextCaseLabel!}
                variant="next-case"
                onClick={onNavClick}
              />
            ) : (
              <MirandaNavButton
                to={hubPath}
                label={MIRANDA_RETURN_HUB_LABEL}
                variant="next-case"
                onClick={onNavClick}
              />
            )}
            {hasNextCase ? (
              <MirandaNavButton
                to={hubPath}
                label={MIRANDA_RETURN_HUB_LABEL}
                variant="hub-return-outline"
                onClick={onNavClick}
              />
            ) : (
              <button type="button" className="miranda-navBtn miranda-navBtn--hub-return-outline" onClick={onPlayAgain}>
                <span className="miranda-navBtnLabel">🔁 Play this case again</span>
              </button>
            )}
          </>
        ) : isVictoriaProgression ? (
          <>
            <MirandaNavButton
              to={hubPath}
              label={continueLabel ?? exitLabel}
              variant="next-case"
              onClick={onNavClick}
            />
            {familyPortalPath ? (
              <MirandaNavButton
                to={familyPortalPath}
                label={familyPortalLabel}
                variant="hub-return-outline"
                onClick={onNavClick}
              />
            ) : null}
          </>
        ) : isCaidenProgression ? (
          <>
            {hasNextCase ? (
              <MirandaNavButton
                to={nextCasePath!}
                label={nextCaseLabel!}
                variant="next-case"
                onClick={onNavClick}
              />
            ) : (
              <MirandaNavButton
                to={hubPath}
                label={continueLabel}
                variant="next-case"
                onClick={onNavClick}
              />
            )}
            {familyPortalPath ? (
              <MirandaNavButton
                to={familyPortalPath}
                label={familyPortalLabel}
                variant="hub-return-outline"
                onClick={onNavClick}
              />
            ) : (
              <MirandaNavButton
                to={hubPath}
                label="← Return to Quest Map"
                variant="hub-return-outline"
                onClick={onNavClick}
              />
            )}
          </>
        ) : (
          <>
            <button type="button" className="bbc-primaryBtn" onClick={onPlayAgain}>
              Play Again
            </button>
            <button type="button" className="bbc-secondaryBtn" onClick={onExit}>
              Exit
            </button>
          </>
        )}
      </div>
    </div>
  );
}
