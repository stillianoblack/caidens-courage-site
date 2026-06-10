import React from 'react';
import AvatarContainer, { type AvatarContainerVariant } from '../components/AvatarContainer';
import { LEARNING_MOMENT_VARIANTS } from '../components/learningMomentCard.registry';
import { getCharacter } from '../characters/characterRegistry';
import '../components/learning-moment.css';

export type LearningMomentVariant = 'B4_LOCK_IN' | 'B4_PARENT_COACH' | 'FACILITATOR_INSIGHT';

/** @deprecated Use LearningMomentVariant */
export type LegacyLearningMomentVariant =
  | 'b4_tip'
  | 'expert_insight'
  | 'character_reflection'
  | 'parent_note';

export type LearningMomentAvatarType = 'b4' | 'dr-victoria';

export type LearningMomentCardProps = {
  variant: LearningMomentVariant | LegacyLearningMomentVariant;
  /** Badge label above headline */
  title?: string;
  /** Primary coaching message (alias: message) */
  headline?: string;
  /** @deprecated Use headline */
  message?: string;
  /** Supporting body copy below headline */
  body?: string;
  /** Bullet tips — primarily for B4_LOCK_IN */
  tips?: string[];
  whyItMatters?: string;
  tryThis?: string[];
  tryThisLabel?: string;
  watchFor?: string;
  avatarType?: LearningMomentAvatarType;
  avatarSrc?: string;
  /** @deprecated Variant determines avatar; kept for legacy callers */
  characterId?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

function normalizeVariant(
  variant: LearningMomentVariant | LegacyLearningMomentVariant,
): LearningMomentVariant {
  switch (variant) {
    case 'b4_tip':
      return 'B4_LOCK_IN';
    case 'expert_insight':
      return 'FACILITATOR_INSIGHT';
    case 'parent_note':
      return 'B4_PARENT_COACH';
    case 'character_reflection':
      return 'B4_LOCK_IN';
    default:
      return variant;
  }
}

function resolveAvatar(
  variant: LearningMomentVariant,
  avatarType?: LearningMomentAvatarType,
  avatarSrc?: string,
): { src: string; alt: string; containerVariant: AvatarContainerVariant } {
  const meta = LEARNING_MOMENT_VARIANTS[variant];
  const type = avatarType ?? meta.avatarType;
  const character = getCharacter(type === 'b4' ? 'b4' : 'dr-victoria');
  return {
    src: avatarSrc ?? character?.avatarSrc ?? '',
    alt: character?.displayName ?? (type === 'b4' ? 'B-4' : 'Dr. Victoria'),
    containerVariant: type === 'b4' ? 'b4' : 'dr-victoria',
  };
}

function defaultTryThisLabel(variant: LearningMomentVariant): string {
  return variant === 'B4_PARENT_COACH' ? 'Try this at home' : 'Try this';
}

export default function LearningMomentCard({
  variant: rawVariant,
  title,
  headline,
  message,
  body,
  tips = [],
  whyItMatters,
  tryThis,
  tryThisLabel,
  watchFor,
  avatarType,
  avatarSrc,
  actionLabel,
  onAction,
  className = '',
}: LearningMomentCardProps) {
  const variant = normalizeVariant(rawVariant);
  const meta = LEARNING_MOMENT_VARIANTS[variant];
  const resolvedHeadline = headline ?? message ?? '';
  const badge = title ?? meta.defaultTitle;
  const avatar = resolveAvatar(variant, avatarType, avatarSrc);
  const sectionTryLabel = tryThisLabel ?? defaultTryThisLabel(variant);

  const showTips = tips.length > 0;
  const showWhy = Boolean(whyItMatters);
  const showTry = Boolean(tryThis && tryThis.length > 0);
  const showWatch = Boolean(watchFor);
  const showSections = showTips || showWhy || showTry || showWatch;

  return (
    <aside
      className={['ds-learningMoment', `ds-learningMoment--${variant}`, className].filter(Boolean).join(' ')}
      aria-live="polite"
      aria-label={badge}
    >
      <div className="ds-learningMomentRow">
        {avatar.src ? (
          <AvatarContainer src={avatar.src} alt={avatar.alt} variant={avatar.containerVariant} />
        ) : null}
        <div className="ds-learningMomentContent">
          <p className="ds-learningMomentBadge">{badge}</p>
          <p className="ds-learningMomentHeadline">{resolvedHeadline}</p>
          {body ? <p className="ds-learningMomentBody">{body}</p> : null}
        </div>
      </div>

      {showSections ? (
        <div className="ds-learningMomentSections">
          {showTips && variant === 'B4_LOCK_IN' ? (
            <ul className="ds-learningMomentTips">
              {tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          ) : null}

          {showWhy ? (
            <div>
              <p className="ds-learningMomentSectionTitle">Why it matters</p>
              <p className="ds-learningMomentSectionText">{whyItMatters}</p>
            </div>
          ) : null}

          {showTry ? (
            <div>
              <p className="ds-learningMomentSectionTitle">{sectionTryLabel}</p>
              <ul className="ds-learningMomentTips">
                {tryThis!.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {showWatch ? (
            <div>
              <p className="ds-learningMomentSectionTitle">Watch for</p>
              <p className="ds-learningMomentSectionText">{watchFor}</p>
            </div>
          ) : null}
        </div>
      ) : null}

      {actionLabel && onAction ? (
        <div className="ds-learningMomentAction">
          <button type="button" className="ds-learningMomentBtn" onClick={onAction}>
            {actionLabel}
          </button>
        </div>
      ) : null}
    </aside>
  );
}
