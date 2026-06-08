import React from 'react';
import type { GameAssessmentComplete as CompleteConfig, GameScoreMessage } from '../../types/gameAssessment';
import CharacterAvatar from './shared/CharacterAvatar';
import MirandaAvatar from '../miranda/MirandaAvatar';
import MirandaNavButton from '../miranda/MirandaNavButton';
import { MIRANDA_RETURN_HUB_LABEL } from '../../data/miranda/progression';
import type { MissionGameTheme } from '../mission-game/MissionSpeechRow';

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
  showUncleTAvatar?: boolean;
  showCharlieAvatar?: boolean;
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
  showUncleTAvatar = false,
  showCharlieAvatar = false,
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
  const isUncleTProgression = showUncleTAvatar && hubPath;
  const isCharlieProgression = showCharlieAvatar && hubPath;
  const isAdultGuideProgression = isVictoriaProgression || isUncleTProgression;
  const hasNextCase = Boolean(nextCasePath && nextCaseLabel);

  const completeTheme: MissionGameTheme | null = showMirandaAvatar
    ? 'miranda'
    : isCaidenProgression
      ? 'caiden'
      : isVictoriaProgression
        ? 'victoria'
        : isUncleTProgression
          ? 'uncle-t'
          : isCharlieProgression
            ? 'charlie'
            : null;

  const panelClass = [
    'bbc-resultPanel',
    'bbc-resultPanel--detailed',
    'game-complete',
    isCaidenProgression ? 'game-complete--caiden' : '',
    isVictoriaProgression ? 'game-complete--victoria' : '',
    isUncleTProgression ? 'game-complete--uncle-t' : '',
    isCharlieProgression ? 'game-complete--charlie' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={panelClass}>
      {showMirandaAvatar ? (
        <MirandaAvatar variant="complete" src={avatarSrc} alt={avatarAlt} />
      ) : completeTheme && avatarSrc ? (
        <div className={`game-completeHero game-completeHero--${completeTheme}`}>
          <CharacterAvatar
            src={avatarSrc}
            alt={avatarAlt ?? completeTheme}
            size="large"
            theme={completeTheme}
            className="game-completeAvatar"
          />
          {isCaidenProgression ? (
            <div className="caiden-completeFlame" aria-hidden="true">
              🔥
            </div>
          ) : null}
        </div>
      ) : null}

      {!isCaidenProgression && !isAdultGuideProgression && !isCharlieProgression && !showMirandaAvatar ? (
        <div className="game-completeBadge" aria-hidden="true">
          🔍
        </div>
      ) : null}

      <h2 className="bbc-title">{config.title}</h2>
      <p className="bbc-body">{resolveScoreMessage(config, score)}</p>

      <p
        className={`game-completeScore${isCaidenProgression ? ' game-completeScore--caiden' : ''}${
          isVictoriaProgression ? ' game-completeScore--victoria' : ''
        }${isUncleTProgression ? ' game-completeScore--uncle-t' : ''}`}
      >
        You completed <strong>{score}</strong> of <strong>{total}</strong> {scoreLabel}.
      </p>

      <div
        className={`game-badgeRow${isCaidenProgression ? ' game-badgeRow--caiden' : ''}${
          isVictoriaProgression ? ' game-badgeRow--victoria' : ''
        }${isUncleTProgression ? ' game-badgeRow--uncle-t' : ''}`}
        role="list"
        aria-label="Rewards earned"
      >
        {config.badges.map((badge) => (
          <span
            key={badge}
            className={
              isCaidenProgression
                ? 'caiden-rewardPill'
                : isVictoriaProgression
                  ? 'victoria-rewardPill'
                  : isUncleTProgression
                    ? 'uncleT-rewardPill'
                    : 'game-badge'
            }
            role="listitem"
          >
            ✦ {badge}
          </span>
        ))}
      </div>

      <div
        className={`bbc-resultActions${
          isMirandaProgression || isCaidenProgression || isAdultGuideProgression ? ' miranda-completeActions' : ''
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
        ) : isAdultGuideProgression ? (
          <>
            <MirandaNavButton
              to={hubPath!}
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
